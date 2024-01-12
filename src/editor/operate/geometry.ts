import { IValueWillChange } from 'mobx'
import { max, min, rcos, rsin } from '~/editor/math/base'
import { WrapToggle, autobind } from '~/shared/decorator'
import { createInterceptData } from '~/shared/intercept-data/interceptable'
import { createMomentChange } from '~/shared/intercept-data/moment-change'
import { macro_StringMatch } from '~/shared/macro'
import { createSignal } from '~/shared/signal'
import { XY } from '~/shared/structure/xy'
import { ValueOf } from '~/shared/utils/normal'
import { xy_mutate, xy_rotate2 } from '../math/xy'
import { SchemaNode } from '../schema/node'
import { ITriangle } from '../schema/type'
import { SchemaUtil } from '../schema/util'
import { StageElement } from '../stage/element'
import { StageSelect } from '../stage/interact/select'

export type IGeometryData = {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  radius: number
  sides: number
}

@autobind
export class OperateGeometryService {
  data = createInterceptData(initData())
  oneTickChange = createMomentChange<Record<keyof IGeometryData, any>>()
  beforeOperate = createSignal<keyof IGeometryData>()
  afterOperate = createSignal()
  isGeometryChanged = false
  initHook() {
    StageSelect.afterSelect.hook(() => {
      this.setupGeometryData()
    })
    this.data._whenDataWillChange.hook(({ key, ctx }) => {
      //this.fixBeforeChange(key, ctx)
    })
    this.data._whenDataDidChange.hook(({ key, val }) => {
      this.oneTickChange.update(key, val)
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
    })
  }
  private fixBeforeChange(key: keyof IGeometryData, ctx: IValueWillChange<ValueOf<IGeometryData>>) {
    if (macro_StringMatch`width|height`(key)) {
      ctx.newValue = max(0, ctx.newValue)
    }
    if (macro_StringMatch`rotation`(key)) {
      ctx.newValue = max(-180, min(180, ctx.newValue))
    }
  }
  @WrapToggle('data._noIntercept')
  private setupGeometryData() {
    if (SchemaNode.selectIds.value.size === 1) {
      const node = SchemaNode.selectNodes[0]
      void (<const>['x', 'y', 'width', 'height', 'rotation']).forEach(
        (key) => (this.data[key] = node[key])
      )
    }
    if (SchemaNode.selectIds.value.size > 1) {
      const propKeys = <const>['x', 'y', 'width', 'height', 'rotation']
      const tempObj = <Record<(typeof propKeys)[number], number>>{}
      const multiValueArr = <string[]>[]
      SchemaNode.selectNodes.forEach((node, i) => {
        propKeys.forEach((key) => {
          if (i === 0) {
            tempObj[key] = node[key]
          } else if (tempObj[key] !== node[key]) multiValueArr.push(key)
        })
      })
      propKeys.forEach((key) => {
        if (!multiValueArr.includes(key)) this.data[key] = tempObj[key]
        else this.data[key] = 0
      })
    }

    const { x, y, width, height, rotation, radius, sides } = this.data
    this.oneTickChange.reset({ x, y, width, height, rotation, radius, sides })
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
    const { x, y, width, height, rotation, sides } = record
    if (changedKeys.has('x') && x) {
      node.x += x.new - x.old
      node.centerX += x.new - x.old
      OBB.shift(x.new - x.old)
    }
    if (changedKeys.has('y') && y) {
      node.y += y.new - y.old
      node.centerY += y.new - y.old
      OBB.shift(undefined, y.new - y.old)
    }
    if (changedKeys.has('width') && width) {
      node.width += width.new - width.old
      node.centerX += (rcos(node.rotation) * (width.new - width.old)) / 2
      node.centerY += (rsin(node.rotation) * (width.new - width.old)) / 2
      OBB.reBound(node.width, undefined, node.centerX, node.centerY)
    }
    if (changedKeys.has('height') && height) {
      node.height += height.new - height.old
      node.centerX -= (rsin(node.rotation) * (height.new - height.old)) / 2
      node.centerY += (rcos(node.rotation) * (height.new - height.old)) / 2
      OBB.reBound(undefined, node.height, node.centerX, node.centerY)
    }
    if (changedKeys.has('rotation') && rotation) {
      node.rotation += rotation.new - rotation.old
      const rotatedXY = xy_rotate2(node, node.centerX, node.centerY, rotation.new - rotation.old)
      xy_mutate(node, rotatedXY)
      OBB.reRotation(node.rotation)
    }
    if (changedKeys.has('sides') && sides) {
      ;(node as ITriangle).sides = sides.new
    }

    const children = SchemaUtil.getChildren(id)
    children.forEach((childNode) => {
      if (changedKeys.has('rotation') && rotation) {
        const childOBB = StageElement.OBBCache.get(childNode.id)
        const rotationShift = rotation.new - rotation.old
        childNode.rotation += rotationShift
        const childCenterXY = XY.From(childNode, 'center')
        childCenterXY.rotate(XY.From(node, 'center'), rotationShift).mutate(childNode, 'center')
        XY.From(childNode).rotate(childCenterXY, rotationShift).mutate(childNode)
        {
          const { width, height, rotation, centerX, centerY } = childNode
          childOBB.reRotation(rotation)
          childOBB.reBound(width, height, centerX, centerY)
        }
      }
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
}

export const OperateGeometry = new OperateGeometryService()

function initData() {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    radius: 0,
    sides: 3,
  }
}
