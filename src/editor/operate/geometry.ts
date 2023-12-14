import { IObjectWillChange, intercept, makeObservable, observable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { max, min, rcos, rsin } from '~/editor/math/base'
import { WatchNext, autobind } from '~/shared/decorator'
import { createValueHooker } from '~/shared/hooker/bool-hooker'
import { createHooker } from '~/shared/hooker/hooker'
import { createWatchHooker } from '~/shared/hooker/watch-hooker'
import { macro_StringMatch } from '~/shared/macro/string-match'
import { XY } from '~/shared/structure/xy'
import { xy_mutate, xy_rotate2, xy_rotate4 } from '../math/xy'
import { SchemaNodeService, injectSchemaNode } from '../schema/node'
import { INode } from '../schema/type'
import { OperateService, injectOperate } from './operate'

@autobind
@injectable()
export class OperateGeometryService {
  @observable proxyData = this.createProxyData()
  pivotXY = XY.Of(0, 0)
  noDispatch = false
  isGeometryChanged = createValueHooker(false)
  beforeOperate = createWatchHooker<[(keyof typeof this.proxyData)[]]>()
  afterOperate = createHooker()
  constructor(
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectOperate private Operate: OperateService
  ) {
    makeObservable(this)
    this.autoSetup()
    this.operate()
  }
  private createProxyData() {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      centerX: 0,
      centerY: 0,
      rotation: 0,
      selfRotation: 0,
      scaleX: 1,
      scaleY: 1,
      radius: 0,
    }
  }
  @WatchNext('SchemaNode.selectCount')
  private autoSetup() {
    this.noDispatch = true
    const selectIds = this.SchemaNode.selectIds
    if (!this.SchemaNode.selectIds.size) {
      return (this.proxyData = this.createProxyData())
    }
    if (selectIds.size === 1) {
      const node = this.SchemaNode.find([...selectIds][0])
      void (<const>['x', 'y', 'width', 'height', 'centerX', 'centerY', 'rotation']).forEach(
        (key) => (this.proxyData[key] = node[key])
      )
      XY.From(this.proxyData)
        .rotate(XY.From(this.proxyData, 'center'), -this.proxyData.rotation)
        .mutate(this.pivotXY)
    }
    if (selectIds.size !== 1) {
      const nodes = [...selectIds].map((id) => this.SchemaNode.find(id))
      let [xMin, yMin, xMax, yMax] = [Infinity, Infinity, -Infinity, -Infinity]
      nodes.forEach((node) => {
        const OBB = this.SchemaNode.OBBCache.get(node.id)
        Object.values(OBB.vertexes).forEach((xy) => {
          xMin = min(xMin, xy.x)
          yMin = min(yMin, xy.y)
          xMax = max(xMax, xy.x)
          yMax = max(yMax, xy.y)
        })
        this.proxyData.x = xMin
        this.proxyData.y = yMin
        this.proxyData.width = xMax - xMin
        this.proxyData.height = yMax - yMin
      })
      const { x, y, width, height } = this.proxyData
      this.proxyData.centerX = x + width / 2
      this.proxyData.centerY = y + height / 2
      this.pivotXY.set(this.proxyData)
    }
    this.noDispatch = false
  }
  private operate() {
    this.interceptChange()
    this.SchemaNode.beforeFlushDirty.hook(() => {
      if (!this.isGeometryChanged.value) return
      this.reconcile()
    })
    this.SchemaNode.duringFlushDirty.hook((id) => {
      if (!this.isGeometryChanged.value) return
      this.patchChangeToVectorPoints(id)
      this.patchChangeToNode(id)
    })
    this.SchemaNode.afterFlushDirty.hook(() => {
      this.isGeometryChanged.dispatch(false)
    })
  }
  private interceptChange() {
    intercept(this.proxyData, (ctx) => {
      if (this.noDispatch) return ctx
      if (ctx.type !== 'update') return ctx
      this.fixBeforeChange(ctx)
      this.recordOneTickChange(ctx)
      this.SchemaNode.makeSelectDirty()
      this.isGeometryChanged.dispatch(true)
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
  private reconcile() {
    this.noDispatch = true
    const proxyData = this.proxyData
    const { oneTickChange, changedProps } = this.Operate
    const { x, y, width, height, rotation } = oneTickChange
    if (changedProps.has('x') && x) {
      proxyData.centerX += x.new - x.old
      this.pivotXY.x += x.new - x.old
    }
    if (changedProps.has('y') && y) {
      proxyData.centerY += y.new - y.old
      this.pivotXY.y += y.new - y.old
    }
    if (changedProps.has('width') && width) {
      proxyData.centerX += (rcos(proxyData.rotation) * (width.new - width.old)) / 2
      proxyData.centerY += (rsin(proxyData.rotation) * (width.new - width.old)) / 2
      this.pivotXY.x = proxyData.centerX - proxyData.width / 2
      this.pivotXY.y += (rsin(proxyData.rotation) * (width.new - width.old)) / 2
    }
    if (changedProps.has('height') && height) {
      proxyData.centerX -= (rsin(proxyData.rotation) * (height.new - height.old)) / 2
      proxyData.centerY += (rcos(proxyData.rotation) * (height.new - height.old)) / 2
      this.pivotXY.x -= (rsin(proxyData.rotation) * (height.new - height.old)) / 2
      this.pivotXY.y = proxyData.centerY - proxyData.height / 2
    }
    if (changedProps.has('rotation') && rotation) {
      const rotatedXY = xy_rotate4(
        this.pivotXY.x,
        this.pivotXY.y,
        proxyData.centerX,
        proxyData.centerY,
        rotation.new
      )
      xy_mutate(proxyData, rotatedXY)
    }
    this.noDispatch = false
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
        point.y *= 1 + (height.new - height.old) / node.width
        point.handleLeft && (point.handleLeft.y *= height.new / height.old)
        point.handleRight && (point.handleRight.y *= height.new / height.old)
      }
    })
  }
  private patchChangeToNode(id: string) {
    const node = this.SchemaNode.find(id)
    const { oneTickChange, changedProps } = this.Operate
    const { x, y, width, height, rotation } = oneTickChange
    const OBB = this.SchemaNode.OBBCache.get(id)
    if (changedProps.has('x') && x) {
      node.x += x.new - x.old
      node.centerX += x.new - x.old
      OBB.shift({ x: x.new - x.old })
    }
    if (changedProps.has('y') && y) {
      node.y += y.new - y.old
      node.centerY += y.new - y.old
      OBB.shift({ x: y.new - y.old })
    }
    if (changedProps.has('width') && width) {
      node.width *= width.new / width.old
      const rate = node.width / this.proxyData.width
      node.centerX += ((rcos(node.rotation) * (width.new - width.old)) / 2) * rate
      node.centerY += ((rsin(node.rotation) * (width.new - width.old)) / 2) * rate
    }
    if (changedProps.has('height') && height) {
      node.height *= height.new / height.old
      const rate = node.height / this.proxyData.height
      node.centerX -= ((rsin(node.rotation) * (height.new - height.old)) / 2) * rate
      node.centerY += ((rcos(node.rotation) * (height.new - height.old)) / 2) * rate
    }
    if (changedProps.has('rotation') && rotation) {
      node.rotation += rotation.new - rotation.old
      xy_rotate2(node, this.proxyData.centerX, this.proxyData.centerY, rotation.new - rotation.old)
    }
  }
}

export const injectOperateGeometry = inject(OperateGeometryService)
