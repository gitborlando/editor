import autobind from 'class-autobind-decorator'
import { rcos, rsin } from '~/editor/math/base'
import { createInterceptData } from '~/shared/intercept-data/interceptable'
import { createMomentChange } from '~/shared/intercept-data/moment-change'
import { createSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { iife } from '~/shared/utils/normal'
import { Record, recordSignalContext } from '../record'
import { SchemaNode } from '../schema/node'
import { IPolygon, IStar } from '../schema/type'
import { SchemaUtil } from '../schema/util'
import { StageDraw } from '../stage/draw/draw'
import { StageElement } from '../stage/element'
import { StageSelect } from '../stage/interact/select'

function initData() {
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

export type IGeometryData = ReturnType<typeof initData>

@autobind
export class OperateGeometryService {
  data = createInterceptData(initData())
  oneTickChange = createMomentChange(initData())
  oneOperateChange = createMomentChange(initData())
  beforeOperate = createSignal<(keyof IGeometryData)[]>()
  afterOperate = createSignal()
  operateKeys = <Set<keyof IGeometryData>>new Set(['x', 'y', 'width', 'height', 'rotation'])
  isGeometryChanged = false
  initHook() {
    StageSelect.afterSelect.hook(() => {
      this.setupOperateKeys()
      this.setupGeometryData()
    })
    this.data._whenDataDidChange.hook(({ key, val }) => {
      this.oneTickChange.update(key, val)
      this.oneOperateChange.update(key, val)
      SchemaNode.makeSelectDirty()
      this.isGeometryChanged = true
    })
    SchemaNode.duringFlushDirty.hook((id) => {
      if (!this.isGeometryChanged) return
      this.patchChangeToNode(id)
    })
    SchemaNode.afterFlushDirty.hook(() => {
      this.oneTickChange.endCurrent()
      this.isGeometryChanged = false
    }, ['id:operateGeometryReset'])
    this.beforeOperate.hook(() => {
      this.oneOperateChange.endCurrent()
    })
    this.afterOperate.hook(this.record)
  }
  private setupGeometryData() {
    this.data._noIntercept = true
    if (SchemaNode.selectIds.value.size === 1) {
      const node = SchemaNode.selectNodes[0]
      //@ts-ignore
      this.operateKeys.forEach((key) => (this.data[key] = node[key]))
    }
    if (SchemaNode.selectIds.value.size > 1) {
      const propKeys = [...this.operateKeys]
      const tempObj = <Record<(typeof propKeys)[number], number>>{}
      const multiValueArr = <string[]>[]
      SchemaNode.selectNodes.forEach((node, i) => {
        propKeys.forEach((key) => {
          //@ts-ignore
          if (i === 0) tempObj[key] = node[key]
          //@ts-ignore
          else if (tempObj[key] !== node[key]) multiValueArr.push(key)
        })
      })
      propKeys.forEach((key) => {
        if (!multiValueArr.includes(key)) this.data[key] = tempObj[key]
        else this.data[key] = 0
      })
    }
    this.data._noIntercept = false
    const { x, y, width, height, rotation, radius, sides, points } = this.data
    const newData = { x, y, width, height, rotation, radius, sides, points }
    this.oneTickChange.reset(newData)
    this.oneOperateChange.reset(newData)
  }
  private setupOperateKeys() {
    this.operateKeys = new Set(['x', 'y', 'width', 'height', 'rotation'])
    SchemaNode.selectNodes.forEach((node) => {
      if (node.type !== 'vector') return
      if (node.vectorType === 'rect') return this.operateKeys.add('radius')
      if (node.vectorType === 'polygon') return this.operateKeys.add('sides')
      if (node.vectorType === 'star') return this.operateKeys.add('points')
    })
  }
  private patchChangeToVectorPoints(id: string) {
    const node = SchemaNode.find(id)
    if (node.type !== 'vector') return
    const { record, changedKeys } = this.oneTickChange
    const { width, height } = record
    // node.points.forEach((point) => {
    //   if (changedKeys.has('width') && width) {
    //     point.x *= 1 + (width.new - width.old) / node.width
    //     point.handleLeft && (point.handleLeft.x *= width.new / width.old)
    //     point.handleRight && (point.handleRight.x *= width.new / width.old)
    //   }
    //   if (changedKeys.has('height') && height) {
    //     point.y *= 1 + (height.new - height.old) / node.height
    //     point.handleLeft && (point.handleLeft.y *= height.new / height.old)
    //     point.handleRight && (point.handleRight.y *= height.new / height.old)
    //   }
    // })
  }
  private patchChangeToNode(id: string) {
    const node = SchemaNode.find(id)
    const OBB = StageElement.OBBCache.get(id)
    const path = StageElement.pathCache.get(id)
    const { record, changedKeys } = this.oneTickChange
    const { x, y, width, height, rotation, radius, sides, points } = record
    if (changedKeys.has('x') && x) {
      node.x += x.current - x.last
      node.centerX += x.current - x.last
      OBB.shiftX(x.shift)
    }
    if (changedKeys.has('y') && y) {
      node.y += y.current - y.last
      node.centerY += y.current - y.last
      OBB.shiftY(y.shift)
    }
    if (changedKeys.has('width') && width) {
      node.width += width.current - width.last
      node.centerX += (rcos(node.rotation) * (width.current - width.last)) / 2
      node.centerY += (rsin(node.rotation) * (width.current - width.last)) / 2
      OBB.reBound(node.width, undefined, node.centerX, node.centerY)
    }
    if (changedKeys.has('height') && height) {
      node.height += height.current - height.last
      node.centerX -= (rsin(node.rotation) * (height.current - height.last)) / 2
      node.centerY += (rcos(node.rotation) * (height.current - height.last)) / 2
      OBB.reBound(undefined, node.height, node.centerX, node.centerY)
    }
    if (changedKeys.has('rotation') && rotation) {
      node.rotation += rotation.current - rotation.last
      XY.From(node)
        .rotate(XY.From(node, 'center'), rotation.current - rotation.last)
        .mutate(node)
      OBB.reRotation(node.rotation)
    }
    if (changedKeys.has('radius') && radius) {
      ;(node as IStar).radius = radius.current
    }
    if (changedKeys.has('sides') && sides) {
      ;(node as IPolygon).sides = sides.current
    }
    if (changedKeys.has('points') && points) {
      ;(node as IStar).points = points.current
    }

    StageDraw.collectRedraw(id)

    SchemaUtil.getChildren(id).forEach((childNode) => {
      if (changedKeys.has('x') && x) {
        const childOBB = StageElement.OBBCache.get(childNode.id)
        childNode.x += x.shift
        childNode.centerX += x.shift
        childOBB.shiftX(x.shift)
      }
      if (changedKeys.has('y') && y) {
        const childOBB = StageElement.OBBCache.get(childNode.id)
        childNode.y += y.shift
        childNode.centerY += y.shift
        childOBB.shiftY(y.shift)
      }
      if (changedKeys.has('rotation') && rotation) {
        const childOBB = StageElement.OBBCache.get(childNode.id)
        childNode.rotation += rotation.shift
        const childCenterXY = XY.From(childNode, 'center')
        childCenterXY.rotate(XY.From(node, 'center'), rotation.shift).mutate(childNode, 'center')
        XY.From(childNode).rotate(childCenterXY, rotation.shift).mutate(childNode)
        {
          const { width, height, rotation, centerX, centerY } = childNode
          childOBB.reRotation(rotation)
          childOBB.reBound(width, height, centerX, centerY)
        }
      }
      StageDraw.collectRedraw(childNode.id)
    })

    // path.points.forEach((point, i) => {
    //   if (changedKeys.has('x') && x) {
    //     point.x += x.new - x.old
    //   }
    //   if (changedKeys.has('y') && y) {
    //     point.y += y.new - y.old
    //   }
    //   if (changedKeys.has('width') || changedKeys.has('height') || changedKeys.has('rotation')) {
    //     const rotatedXY = xy_rotate((<IVector>node).points[i], xy_new(0, 0), node.rotation)
    //     point.x = rotatedXY.x + node.centerX
    //     point.y = rotatedXY.y + node.centerY
    //   }
    // })
    StageElement.pathCache.set(id, path)
    StageElement.OBBCache.set(id, OBB)
  }

  private record() {
    if (recordSignalContext()) return
    const keys = this.beforeOperate.value
    const record = structuredClone(this.oneOperateChange.record)
    const travel = (type: 'last' | 'current') => {
      this.beforeOperate.dispatch(keys)
      keys.forEach((key) => (this.data[key] = record[key][type]))
      this.afterOperate.dispatch()
    }
    Record.push({
      description: '操作几何数据',
      detail: iife(() => {
        const keysToValues = keys
          .filter((key) => record[key]['last'] !== record[key]['current'])
          .map((key) => [key, { last: record[key]['last'], current: record[key]['current'] }])
        return Object.fromEntries(keysToValues)
      }),
      undo: () => travel('last'),
      redo: () => travel('current'),
    })
  }
}

export const OperateGeometry = new OperateGeometryService()
