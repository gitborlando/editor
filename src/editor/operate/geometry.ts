import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal/signal'
import { createCache } from '~/shared/utils/cache'
import { ITraverseData, SchemaUtil } from '~/shared/utils/schema'
import { xy_minus, xy_rotate } from '../math/xy'
import { Schema } from '../schema/schema'
import { IIrregular } from '../schema/type'
import { OperateNode } from './node'

function createInitGeometry() {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    radius: 0,
    sides: 3,
    points: 5,
  }
}

export type IGeometry = ReturnType<typeof createInitGeometry>

@autobind
class OperateGeometryService {
  geometry = createInitGeometry()
  isChangedGeometry = createSignal(false)
  geometryKeys = new Set(<(keyof IGeometry)[]>['x', 'y', 'width', 'height', 'rotation'])
  operateKeys = new Set<keyof IGeometry>()
  beforeOperate = createSignal<(keyof IGeometry)[]>()
  afterOperate = createSignal()
  geometryKeyValue = createCache<keyof IGeometry, number | 'multi'>()
  private lastGeometry = createInitGeometry()
  initHook() {
    OperateNode.selectIds.hook(() => {
      this.setupOperateKeys()
      this.setupGeometry()
      this.syncLastGeometry()
    })
    OperateNode.selectedNodes.hook({ id: 'geometryKeyValue' }, (nodes) => {
      this.geometryKeyValue.clear()
      this.geometryKeys.forEach((key) => {
        nodes.forEach((_node) => {
          const node = _node as any
          if (!Object.hasOwn(node, key)) return
          let last = this.geometryKeyValue.getSet(key, () => node[key])
          if (last === 'multi') return
          if (node[key] !== last) this.geometryKeyValue.set(key, 'multi')
        })
      })
    })
    this.beforeOperate.hook((keys) => {
      this.operateKeys = new Set(keys)
    })
    this.afterOperate.hook(() => {
      Schema.finalOperation('操作几何数据')
      this.operateKeys.clear()
    })
  }
  setGeometry(key: keyof IGeometry, value: number) {
    const lastValue = this.lastGeometry[key]
    if (value === lastValue) return
    this.geometry[key] = value
    this.isChangedGeometry.dispatch(true)
    SchemaUtil.traverseIds([...OperateNode.selectIds.value], this.applyChangeToNode)
    Schema.commitOperation('设置几何数据')
    Schema.nextSchema()
    this.syncLastGeometry()
  }
  private syncLastGeometry() {
    Object.keys(this.lastGeometry).forEach((key) => {
      //@ts-ignore
      this.lastGeometry[key] = this.geometry[key]
    })
  }
  private delta(key: keyof IGeometry) {
    return this.geometry[key] - this.lastGeometry[key]
  }
  private setupGeometry() {
    if (OperateNode.selectIds.value.size === 1) {
      const node = OperateNode.selectingNodes[0]
      this.geometryKeys.forEach((key) => {
        //@ts-ignore
        this.geometry[key] = node[key]
      })
    }
    if (OperateNode.selectIds.value.size > 1) {
      const propKeys = [...this.geometryKeys]
      const tempObj = <any>{}
      const multiValueArr = <string[]>[]
      OperateNode.selectingNodes.forEach((node, i) => {
        propKeys.forEach((key) => {
          //@ts-ignore
          if (i === 0) tempObj[key] = node[key]
          //@ts-ignore
          else if (tempObj[key] !== node[key]) multiValueArr.push(key)
        })
      })
      propKeys.forEach((key) => {
        if (!multiValueArr.includes(key)) this.geometry[key] = tempObj[key]
        else this.geometry[key] = 0
      })
    }
  }
  private setupOperateKeys() {
    this.geometryKeys = new Set(['x', 'y', 'width', 'height', 'rotation'])
    OperateNode.selectingNodes.forEach((node) => {
      if (node.type === 'frame') return this.geometryKeys.add('radius')
      if (node.type === 'vector') {
        if (node.vectorType === 'rect') return this.geometryKeys.add('radius')
        if (node.vectorType === 'polygon') return this.geometryKeys.add('sides')
        if (node.vectorType === 'star') return this.geometryKeys.add('points')
      }
    })
  }
  private applyChangeToNode(traverseData: ITraverseData) {
    const { node, depth } = traverseData

    if (depth === 0) this.patchChangeToVectorPoints(node.id)

    if (this.operateKeys.has('x')) {
      Schema.itemReset(node, ['x'], node.x + this.delta('x'))
    }
    if (this.operateKeys.has('y')) {
      Schema.itemReset(node, ['y'], node.y + this.delta('y'))
    }
    if (this.operateKeys.has('width') && depth === 0) {
      Schema.itemReset(node, ['width'], node.width + this.delta('width'))
    }
    if (this.operateKeys.has('height') && depth === 0) {
      Schema.itemReset(node, ['height'], node.height + this.delta('height'))
    }
    if (this.operateKeys.has('radius') && depth === 0) {
      Schema.itemReset(node, ['radius'], this.geometry['radius'])
    }
    if (this.operateKeys.has('sides')) {
      Schema.itemReset(node, ['sides'], this.geometry['sides'])
    }
    if (this.operateKeys.has('points')) {
      Schema.itemReset(node, ['points'], this.geometry['points'])
    }
    if (this.operateKeys.has('rotation')) {
      const { getNodeCenterXY } = OperateNode
      const centerXY = getNodeCenterXY(node)
      const newXY = xy_rotate(node, centerXY, this.delta('rotation'))
      Schema.itemReset(node, ['rotation'], node.rotation + this.delta('rotation'))
      if (depth === 0) {
        Schema.itemReset(node, ['x'], newXY.x)
        Schema.itemReset(node, ['y'], newXY.y)
      } else {
        let upLevelRef = traverseData.upLevelRef!
        while (upLevelRef.upLevelRef) upLevelRef = upLevelRef.upLevelRef
        const ancestorCenter = getNodeCenterXY(upLevelRef.node)
        const newCenter = xy_rotate(centerXY, ancestorCenter, this.delta('rotation'))
        const centerShift = xy_minus(newCenter, centerXY)
        Schema.itemReset(node, ['x'], newXY.x + centerShift.x)
        Schema.itemReset(node, ['y'], newXY.y + centerShift.y)
      }
    }
  }
  private patchChangeToVectorPoints(id: string) {
    const node = Schema.find<IIrregular>(id)
    if (node.type !== 'vector') return
    if (node.vectorType !== 'irregular') return
    node.points.forEach((point, i) => {
      if (this.operateKeys.has('width')) {
        point.x *= 1 + this.delta('width') / node.width
        point.handleLeft && (point.handleLeft.x *= 1 + this.delta('width') / node.width)
        point.handleRight && (point.handleRight.x *= 1 + this.delta('width') / node.width)
      }
      if (this.operateKeys.has('height')) {
        point.y *= 1 + this.delta('height') / node.height
        point.handleLeft && (point.handleLeft.y *= 1 + this.delta('height') / node.height)
        point.handleRight && (point.handleRight.y *= 1 + this.delta('height') / node.height)
      }
    })
  }
}

export const OperateGeometry = new OperateGeometryService()
