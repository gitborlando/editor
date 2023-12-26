import { IValueWillChange } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { max, min, rcos, rsin } from '~/editor/math/base'
import { Before_After_Toggle, autobind } from '~/shared/decorator'
import { createHooker } from '~/shared/hooker'
import { createInterceptData } from '~/shared/intercept-data/interceptable'
import { createMomentChange } from '~/shared/intercept-data/moment-change'
import { macro_StringMatch } from '~/shared/macro'
import { ValueOf } from '~/shared/utils/normal'
import { xy_mutate, xy_rotate2 } from '../math/xy'
import { SchemaNodeService, injectSchemaNode } from '../schema/node'
import { ITriangle } from '../schema/type'
import { StageElementService, injectStageElement } from '../stage/element'
import { StageSelectService, injectStageSelect } from '../stage/interact/select'

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
@injectable()
export class OperateGeometryService {
  data = createInterceptData(initData())
  oneTickChange = createMomentChange<Record<keyof IGeometryData, any>>()
  isGeometryChanged = false
  beforeOperate = createHooker<[(keyof IGeometryData)[]]>()
  afterOperate = createHooker()
  constructor(
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectStageElement private StageElement: StageElementService,
    @injectStageSelect private StageSelect: StageSelectService
  ) {
    this.initialize()
  }
  private initialize() {
    this.StageSelect.afterSelect.hook(() => {
      this.setupGeometryData()
    })
    this.data._whenDataWillChange.hook(({ key, ctx }) => {
      //this.fixBeforeChange(key, ctx)
    })
    this.data._whenDataDidChange.hook(({ key, val }) => {
      this.oneTickChange.update(key, val)
      this.SchemaNode.makeSelectDirty()
      this.isGeometryChanged = true
    })
    this.SchemaNode.duringFlushDirty.hook((id) => {
      if (!this.isGeometryChanged) return
      //this.patchChangeToVectorPoints(id)
      this.patchChangeToNode(id)
    })
    this.SchemaNode.afterFlushDirty.hook(() => {
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
  @Before_After_Toggle('data._noIntercept')
  private setupGeometryData() {
    if (this.SchemaNode.selectIds.size === 1) {
      const node = this.SchemaNode.selectNodes[0]
      void (<const>['x', 'y', 'width', 'height', 'rotation']).forEach(
        (key) => (this.data[key] = node[key])
      )
    }
    if (this.SchemaNode.selectIds.size > 1) {
      const propKeys = <const>['x', 'y', 'width', 'height', 'rotation']
      const tempObj = <Record<typeof propKeys[number], number>>{}
      const multiValueArr = <string[]>[]
      this.SchemaNode.selectNodes.forEach((node, i) => {
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
    const node = this.SchemaNode.find(id)
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
    const node = this.SchemaNode.find(id)
    const OBB = this.StageElement.OBBCache.get(id)
    const path = this.StageElement.pathCache.get(id)
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
    this.StageElement.pathCache.set(id, path)
    this.StageElement.OBBCache.set(id, OBB)
  }
}

export const injectOperateGeometry = inject(OperateGeometryService)

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
