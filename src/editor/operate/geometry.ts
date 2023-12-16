import { IObjectWillChange, intercept, makeObservable, observable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { max, min, rcos, rsin } from '~/editor/math/base'
import { autobind } from '~/shared/decorator'
import { createHooker } from '~/shared/hooker'
import { macro_StringMatch } from '~/shared/macro'
import { xy_mutate, xy_rotate2 } from '../math/xy'
import { SchemaNodeService, injectSchemaNode } from '../schema/node'
import { INode } from '../schema/type'
import { StageElementService, injectStageElement } from '../stage/element'
import { OperateService, injectOperate } from './operate'

@autobind
@injectable()
export class OperateGeometryService {
  @observable proxyData = this.initProxyData()
  @observable isGeometryChanged = false
  noDispatch = false
  beforeOperate = createHooker<[(keyof typeof this.proxyData)[]]>()
  afterOperate = createHooker()
  constructor(
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectOperate private Operate: OperateService,
    @injectStageElement private StageElement: StageElementService
  ) {
    makeObservable(this)
    this.initialize()
  }
  private initProxyData() {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      rotation: 0,
      radius: 0,
      scaleX: 1,
      scaleY: 1,
    }
  }
  private initialize() {
    this.interceptChange()
    this.SchemaNode.duringFlushDirty.hook((id) => {
      if (!this.isGeometryChanged) return
      this.patchChangeToVectorPoints(id)
      this.patchChangeToNode(id)
    })
    this.SchemaNode.afterFlushDirty.hook(() => {
      this.isGeometryChanged = false
    })
  }
  private interceptChange() {
    intercept(this.proxyData, (ctx) => {
      if (this.noDispatch) return ctx
      if (ctx.type !== 'update') return ctx
      this.fixBeforeChange(ctx)
      this.recordOneTickChange(ctx)
      this.SchemaNode.makeSelectDirty()
      this.isGeometryChanged = true
      return ctx
    })
  }
  private fixBeforeChange(ctx: IObjectWillChange & { type: 'update' | 'add' }) {
    const propName = <keyof INode>ctx.name.toString()
    if (macro_StringMatch`width|height`(propName)) {
      ctx.newValue = max(0, ctx.newValue)
    }
    if (macro_StringMatch`rotation`(propName)) {
      ctx.newValue = max(-180, min(180, ctx.newValue))
    }
  }
  private recordOneTickChange(ctx: IObjectWillChange & { type: 'update' | 'add' }) {
    const { oneTickChange, changedProps } = this.Operate
    const propName = <keyof INode>ctx.name.toString()
    changedProps.add(propName)
    if (!oneTickChange[propName]) {
      ;(<any>oneTickChange[propName]) = {}
      oneTickChange[propName]!.old = this.proxyData[<keyof typeof this.proxyData>propName]
    }
    oneTickChange[propName]!.new = ctx.newValue
    if (macro_StringMatch`x|y|width|height|rotation`(propName)) {
      this.Operate.geometryChanged = true
    }
  }
  private patchChangeToVectorPoints(id: string) {
    const node = this.SchemaNode.find(id)
    if (node.type !== 'vector') return
    const { oneTickChange, changedProps } = this.Operate
    const { width, height } = oneTickChange
    node.points.forEach((point) => {
      if (changedProps.has('width') && width) {
        point.x *= 1 + (width.new - width.old) / node.width
        point.handleLeft && (point.handleLeft.x *= width.new / width.old)
        point.handleRight && (point.handleRight.x *= width.new / width.old)
      }
      if (changedProps.has('height') && height) {
        point.y *= 1 + (height.new - height.old) / node.height
        point.handleLeft && (point.handleLeft.y *= height.new / height.old)
        point.handleRight && (point.handleRight.y *= height.new / height.old)
      }
    })
  }
  private patchChangeToNode(id: string) {
    const node = this.SchemaNode.find(id)
    const { oneTickChange, changedProps } = this.Operate
    const { x, y, width, height, rotation } = oneTickChange
    const OBB = this.StageElement.OBBCache.get(id)
    if (changedProps.has('x') && x) {
      node.x += x.new - x.old
      node.centerX += x.new - x.old
      OBB.shift(x.new - x.old)
    }
    if (changedProps.has('y') && y) {
      node.y += y.new - y.old
      node.centerY += y.new - y.old
      OBB.shift(undefined, y.new - y.old)
    }
    if (changedProps.has('width') && width) {
      node.width += width.new - width.old
      node.centerX += (rcos(node.rotation) * (width.new - width.old)) / 2
      node.centerY += (rsin(node.rotation) * (width.new - width.old)) / 2
      OBB.reBound(node.width, undefined, node.centerX, node.centerY)
    }
    if (changedProps.has('height') && height) {
      node.height += height.new - height.old
      node.centerX -= (rsin(node.rotation) * (height.new - height.old)) / 2
      node.centerY += (rcos(node.rotation) * (height.new - height.old)) / 2
      OBB.reBound(undefined, node.height, node.centerX, node.centerY)
    }
    if (changedProps.has('rotation') && rotation) {
      node.rotation += rotation.new - rotation.old
      const rotatedXY = xy_rotate2(node, node.centerX, node.centerY, rotation.new - rotation.old)
      xy_mutate(node, rotatedXY)
      OBB.reRotation(node.rotation)
    }
  }
}

export const injectOperateGeometry = inject(OperateGeometryService)
