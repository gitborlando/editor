import autobind from 'class-autobind-decorator'
import { HandleNode } from 'src/editor/handle/node'
import { divide, floor, max, min } from 'src/editor/math/base'
import { createRegularPolygon, createStarPolygon } from 'src/editor/math/point'
import { SchemaHelper, SchemaUtilTraverseData } from 'src/editor/schema/helper'
import { MULTI_VALUE } from 'src/global/constant'
import { cleanObject } from 'src/shared/utils/normal'
import { xy_minus, xy_rotate } from '../math/xy'
import { IPolygon, IStar } from '../schema/type'
import { getSelectIdMap } from '../y-state/y-clients'

function createAllGeometry() {
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

function createActiveKeys(
  set: Set<keyof AllGeometry>,
  keys: (keyof AllGeometry)[] = [],
) {
  set.clear()
  keys.forEach((key) => set.add(key))
  return set
}

export type AllGeometry = ReturnType<typeof createAllGeometry>

@autobind
class OperateGeometryService {
  activeGeometry = createAllGeometry()
  activeKeys = createActiveKeys(new Set())
  operateKeys = createActiveKeys(new Set())
  deltaKeys = createActiveKeys(new Set())

  initHook() {}

  setupActiveKeys(selectedNodes: V1.Node[]) {
    createActiveKeys(this.activeKeys, ['x', 'y', 'width', 'height', 'rotation'])

    selectedNodes.forEach((node) => {
      if (node.type === 'frame') this.activeKeys.add('radius')
      if (node.type === 'rect') this.activeKeys.add('radius')
      if (node.type === 'polygon') this.activeKeys.add('sides')
      if (node.type === 'star') {
        this.activeKeys.add('innerRate')
        this.activeKeys.add('pointCount')
      }
      if (node.type === 'ellipse') {
        this.activeKeys.add('startAngle')
        this.activeKeys.add('endAngle')
        this.activeKeys.add('innerRate')
      }
    })
  }

  setupActiveGeometry(selectedNodes: V1.Node[]) {
    cleanObject(this.activeGeometry)
    selectedNodes.forEach((node, i) => {
      this.activeKeys.forEach((key) => {
        if (i === 0) this.activeGeometry[key] = t<any>(node)[key]
        else if (this.activeGeometry[key] !== t<any>(node)[key])
          t<any>(this.activeGeometry)[key] = MULTI_VALUE
      })
    })
  }

  private hasStartApply = false

  setActiveGeometry(key: keyof AllGeometry, value: number, delta: boolean = true) {
    if (delta) this.deltaKeys.add(key)
    this.operateKeys.add(key)
    this.activeGeometry[key] = value

    if (this.hasStartApply) return
    this.hasStartApply = true

    queueMicrotask(() => {
      const traverse = SchemaHelper.createTraverse({
        finder: YState.find<V1.Node>,
        callback: this.applyChangeToNode,
      })
      traverse(Object.keys(getSelectIdMap()))
      YState.next()

      this.hasStartApply = false
      this.operateKeys.clear()
      this.deltaKeys.clear()

      if (!delta) {
        YUndo.track({ type: 'state', description: `修改几何属性: ${key}` })
      }
    })
  }

  private delta(key: keyof AllGeometry, node: V1.Node) {
    if (this.deltaKeys.has(key)) return this.activeGeometry[key]
    return this.activeGeometry[key] - t<any>(node)[key]
  }

  private deltaRate(key: keyof AllGeometry, node: any) {
    return divide(this.delta(key, node), node[key])
  }

  private applyChangeToNode(traverseData: SchemaUtilTraverseData) {
    const { node, depth } = traverseData

    if (depth === 0) this.patchChangeToVectorPoints(node.id)

    this.operateKeys.forEach((key) => {
      if (key === 'width') {
        if (depth !== 0) return
        return YState.set(
          `${node.id}.width`,
          max(0, node.width + this.delta(key, node)),
        )
      }
      if (key === 'height') {
        if (depth !== 0 || node.type === 'line') return
        return YState.set(
          `${node.id}.height`,
          max(0, node.height + this.delta(key, node)),
        )
      }
      if (key === 'radius') {
        if (depth !== 0) return
        return YState.set(
          `${node.id}.radius`,
          max(0, t<any>(node).radius + this.delta(key, node)),
        )
      }
      if (key === 'rotation') {
        return this.applyRotationToNode(traverseData, node, depth)
      }
      if (key === 'sides') {
        let { width, height, sides } = node as IPolygon
        sides = max(3, sides + floor(this.delta(key, node)))
        YState.set(`${node.id}.sides`, sides)
        YState.set(`${node.id}.points`, createRegularPolygon(width, height, sides))
        return
      }
      if (key === 'pointCount' || key === 'innerRate') {
        let { width, height, pointCount, innerRate } = node as IStar
        pointCount = max(3, floor(pointCount))
        innerRate = min(1, max(0, innerRate))
        YState.set(`${node.id}.pointCount`, pointCount)
        YState.set(`${node.id}.innerRate`, innerRate)
        YState.set(
          `${node.id}.points`,
          createStarPolygon(width, height, pointCount, innerRate),
        )
      }
      YState.set(`${node.id}.${key}`, t<any>(node)[key] + this.delta(key, node))
    })
  }

  private applyRotationToNode(
    traverseData: SchemaUtilTraverseData,
    node: V1.Node,
    depth: number,
  ) {
    const { getNodeCenterXY } = HandleNode
    const centerXY = getNodeCenterXY(node)
    const newXY = xy_rotate(node, centerXY, this.delta('rotation', node))

    YState.set(`${node.id}.rotation`, node.rotation + this.delta('rotation', node))

    if (depth === 0) {
      YState.set(`${node.id}.x`, newXY.x)
      YState.set(`${node.id}.y`, newXY.y)
    } else {
      let upLevelRef = traverseData.upLevelRef!
      while (upLevelRef.upLevelRef) upLevelRef = upLevelRef.upLevelRef
      const ancestorCenter = getNodeCenterXY(upLevelRef.node)
      const newCenter = xy_rotate(
        centerXY,
        ancestorCenter,
        this.delta('rotation', node),
      )
      const centerShift = xy_minus(newCenter, centerXY)
      YState.set(`${node.id}.x`, newXY.x + centerShift.x)
      YState.set(`${node.id}.y`, newXY.y + centerShift.y)
    }
  }

  private patchChangeToVectorPoints(id: string) {
    const node = YState.find<V1.Vector>(id)
    if (!node.points) return

    node.points.forEach((point) => {
      if (this.operateKeys.has('width')) {
        point.x *= 1 + this.deltaRate('width', node)
        point.handleL && (point.handleL.x *= 1 + this.deltaRate('width', node))
        point.handleR && (point.handleR.x *= 1 + this.deltaRate('width', node))
      }
      if (this.operateKeys.has('height')) {
        point.y *= 1 + this.deltaRate('height', node)
        point.handleL && (point.handleL.y *= 1 + this.deltaRate('height', node))
        point.handleR && (point.handleR.y *= 1 + this.deltaRate('height', node))
      }
    })
  }
}

export const OperateGeometry = new OperateGeometryService()
