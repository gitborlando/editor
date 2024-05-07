import autobind from 'class-autobind-decorator'
import { rcos, rsin } from '~/editor/math/base'
import { createCache } from '~/shared/cache'
import { createSignal } from '~/shared/signal/signal'
import { XY } from '~/shared/xy'
import { Schema } from '../schema/schema'
import { ITraverseData, SchemaUtil } from '../schema/util'
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
      const node = OperateNode.selectNodes[0]
      this.geometryKeys.forEach((key) => {
        //@ts-ignore
        this.geometry[key] = node[key]
      })
    }
    if (OperateNode.selectIds.value.size > 1) {
      const propKeys = [...this.geometryKeys]
      const tempObj = <any>{}
      const multiValueArr = <string[]>[]
      OperateNode.selectNodes.forEach((node, i) => {
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
    OperateNode.selectNodes.forEach((node) => {
      if (node.type === 'frame') return this.geometryKeys.add('radius')
      if (node.type === 'vector') {
        if (node.vectorType === 'rect') return this.geometryKeys.add('radius')
        if (node.vectorType === 'polygon') return this.geometryKeys.add('sides')
        if (node.vectorType === 'star') return this.geometryKeys.add('points')
      }
    })
  }
  // private patchChangeToVectorPoints(id: string) {
  //   const node = Schema.find(id)
  // if (node.type !== 'vector') return
  // const { record, changedKeys } = this.oneTickChange
  // const { width, height } = record
  // node.points.forEach((point) => {
  //   if (this.operateKeys.has('width') && width) {
  //     point.x *= 1 + (width.new - width.old) / node.width
  //     point.handleLeft && (point.handleLeft.x *= width.new / width.old)
  //     point.handleRight && (point.handleRight.x *= width.new / width.old)
  //   }
  //   if (this.operateKeys.has('height') && height) {
  //     point.y *= 1 + (height.new - height.old) / node.height
  //     point.handleLeft && (point.handleLeft.y *= height.new / height.old)
  //     point.handleRight && (point.handleRight.y *= height.new / height.old)
  //   }
  // })
  // }
  private applyChangeToNode(traverseData: ITraverseData) {
    const { node, depth } = traverseData

    if (this.operateKeys.has('x')) {
      Schema.itemReset(node, ['x'], node.x + this.delta('x'))
      Schema.itemReset(node, ['centerX'], node.centerX + this.delta('x'))
    }
    if (this.operateKeys.has('y')) {
      Schema.itemReset(node, ['y'], node.y + this.delta('y'))
      Schema.itemReset(node, ['centerY'], node.centerY + this.delta('y'))
    }
    if (this.operateKeys.has('width') && depth === 0) {
      const newCenterX = node.centerX + (rcos(node.rotation) * this.delta('width')) / 2
      const newCenterY = node.centerY + (rsin(node.rotation) * this.delta('width')) / 2
      Schema.itemReset(node, ['width'], node.width + this.delta('width'))
      Schema.itemReset(node, ['centerX'], newCenterX)
      Schema.itemReset(node, ['centerY'], newCenterY)
    }
    if (this.operateKeys.has('height') && depth === 0) {
      const newCenterX = node.centerX - (rsin(node.rotation) * this.delta('height')) / 2
      const newCenterY = node.centerY + (rcos(node.rotation) * this.delta('height')) / 2
      Schema.itemReset(node, ['height'], node.height + this.delta('height'))
      Schema.itemReset(node, ['centerX'], newCenterX)
      Schema.itemReset(node, ['centerY'], newCenterY)
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
      if (depth === 0) {
        const newXY = XY.From(node).rotate(XY.From(node, 'center'), this.delta('rotation'))
        Schema.itemReset(node, ['rotation'], node.rotation + this.delta('rotation'))
        Schema.itemReset(node, ['x'], newXY.x)
        Schema.itemReset(node, ['y'], newXY.y)
      } else {
        let upLevelRef = traverseData.upLevelRef!
        while (upLevelRef.upLevelRef) upLevelRef = upLevelRef.upLevelRef
        const newCenterXY = XY.From(node, 'center').rotate(
          XY.From(upLevelRef.node, 'center'),
          this.delta('rotation')
        )
        const newXY = XY.From(node).rotate(newCenterXY, this.delta('rotation'))
        Schema.itemReset(node, ['rotation'], node.rotation + this.delta('rotation'))
        Schema.itemReset(node, ['centerX'], newCenterXY.x)
        Schema.itemReset(node, ['centerY'], newCenterXY.y)
        Schema.itemReset(node, ['x'], newXY.x)
        Schema.itemReset(node, ['y'], newXY.y)
      }
    }
  }
}

export const OperateGeometry = new OperateGeometryService()
