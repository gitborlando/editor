import autobind from 'class-autobind-decorator'
import { createCache } from 'src/shared/utils/cache'
import { ITraverseData, SchemaUtil } from 'src/shared/utils/schema'
import { xy_minus, xy_rotate } from '../math/xy'
import { Schema } from '../schema/schema'
import { INode, IVector } from '../schema/type'
import { OperateNode, getSelectIds, getSelectNodes } from './node'

function createInitGeometry() {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    radius: 0,
    sides: 3,
    pointCount: 5,
    startAngle: 0,
    endAngle: 360,
    innerRate: 0,
  }
}

export type IGeometry = ReturnType<typeof createInitGeometry>

@autobind
class OperateGeometryService {
  geometry = createInitGeometry()
  geometryKeys = new Set(<(keyof IGeometry)[]>['x', 'y', 'width', 'height', 'rotation'])
  operateKeys = new Set<keyof IGeometry>()
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
  }

  private hasStartApply = false

  setGeometry(key: keyof IGeometry, value: number) {
    this.geometry[key] = value
    this.operateKeys.add(key)

    if (this.hasStartApply) return
    this.hasStartApply = true

    queueMicrotask(() => {
      SchemaUtil.traverseIds(getSelectIds(), this.applyChangeToNode)
      Schema.commitOperation('设置几何数据')
      Schema.nextSchema()
      this.syncLastGeometry()
      this.hasStartApply = false
      this.operateKeys.clear()
    })
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

    getSelectNodes().forEach((node) => {
      if (node.type === 'frame') this.geometryKeys.add('radius')
      if (node.type === 'rect') this.geometryKeys.add('radius')
      if (node.type === 'polygon') this.geometryKeys.add('sides')
      if (node.type === 'star') {
        this.geometryKeys.add('innerRate')
        this.geometryKeys.add('pointCount')
      }
      if (node.type === 'ellipse') {
        this.geometryKeys.add('startAngle')
        this.geometryKeys.add('endAngle')
        this.geometryKeys.add('innerRate')
      }
    })
  }

  private applyChangeToNode(traverseData: ITraverseData) {
    const { node, depth } = traverseData
    console.log('depth: ', depth)

    if (depth === 0) this.patchChangeToVectorPoints(node.id)

    this.operateKeys.forEach((key) => {
      if ((key === 'width' || key === 'height' || key === 'radius') && depth !== 0) return
      if (key === 'height' && node.type === 'line') return
      if (key === 'rotation') {
        return this.applyRotationToNode(traverseData, node, depth)
      }
      //@ts-ignore
      Schema.itemReset(node, [key], node[key] + this.delta(key))
    })
  }

  private applyRotationToNode(traverseData: ITraverseData, node: INode, depth: number) {
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

  private patchChangeToVectorPoints(id: string) {
    const node = Schema.find<IVector>(id)
    console.log('node: ', node)
    if (!node.points) return

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
