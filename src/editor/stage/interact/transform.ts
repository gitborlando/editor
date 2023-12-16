import { intercept, makeObservable, observable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { max, min, rcos, rsin } from '~/editor/math/base'
import { xy_mutate, xy_mutate2, xy_rotate2 } from '~/editor/math/xy'
import { OperateGeometryService, injectOperateGeometry } from '~/editor/operate/geometry'
import { OperateService, injectOperate } from '~/editor/operate/operate'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { Before_After_Toggle, autobind } from '~/shared/decorator'
import { StageElementService, injectStageElement } from '../element'
import { StageSelectService, injectStageSelect } from './select'

@autobind
@injectable()
export class StageTransformService {
  @observable data = initData()
  noIntercept = false
  constructor(
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectOperate private Operate: OperateService,
    @injectStageSelect private StageSelect: StageSelectService,
    @injectOperateGeometry private OperateGeometry: OperateGeometryService,
    @injectStageElement private StageElement: StageElementService
  ) {
    makeObservable(this)
    this.initialize()
  }
  private initialize() {
    this.StageSelect.duringSelect.hook(() => this.setTransformData())
    this.StageSelect.afterSelect.hook(() => this.setTransformData())
    this.OperateGeometry.afterOperate.hook(() => this.setTransformData())
    this.SchemaNode.beforeFlushDirty.hook(() => this.patchChange())
    intercept(this.data, (ctx) => {
      if (this.noIntercept) return ctx
      if (ctx.type !== 'update') return ctx
      const prop = <keyof typeof this.data>ctx.name.toString()

      return ctx
    })
  }
  @Before_After_Toggle('noIntercept')
  private setTransformData() {
    const selectIds = this.SchemaNode.selectIds
    if (selectIds.size === 1) {
      const OBB = this.StageElement.OBBCache.get([...selectIds][0])
      void (<const>['width', 'height', 'centerX', 'centerY', 'rotation']).forEach(
        (key) => (this.data[key] = OBB[key])
      )
      xy_mutate2(this.data, OBB.xy.x, OBB.xy.y)
    }
    if (selectIds.size > 1) {
      const nodes = [...selectIds].map((id) => this.SchemaNode.find(id))
      let [xMin, yMin, xMax, yMax] = [Infinity, Infinity, -Infinity, -Infinity]
      nodes.forEach((node) => {
        const OBB = this.StageElement.OBBCache.get(node.id)
        OBB.vertexes.forEach((xy) => {
          xMin = min(xMin, xy.x)
          yMin = min(yMin, xy.y)
          xMax = max(xMax, xy.x)
          yMax = max(yMax, xy.y)
        })
      })
      this.data.x = xMin
      this.data.y = yMin
      this.data.width = xMax - xMin
      this.data.height = yMax - yMin
      this.data.centerX = this.data.x + this.data.width / 2
      this.data.centerY = this.data.y + this.data.height / 2
      this.data.rotation = 0
    }

    this.setupGeometryProxyData()
  }
  @Before_After_Toggle('OperateGeometry.noDispatch')
  private setupGeometryProxyData() {
    const { proxyData } = this.OperateGeometry
    if (this.SchemaNode.selectIds.size === 1) {
      void (<const>['x', 'y', 'width', 'height', 'rotation']).forEach(
        (key) => (proxyData[key] = this.data[key])
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
          } else {
            if (tempObj[key] !== node[key]) multiValueArr.push(key)
          }
        })
      })
      propKeys.forEach((key) => {
        if (!multiValueArr.includes(key)) proxyData[key] = tempObj[key]
      })
    }
  }
  @Before_After_Toggle('noIntercept')
  private patchChange() {
    const { oneTickChange, changedProps } = this.Operate
    const { x, y, width, height, rotation } = oneTickChange
    if (changedProps.has('x') && x) {
      this.data.centerX += x.new - x.old
    }
    if (changedProps.has('y') && y) {
      this.data.centerY += y.new - y.old
    }
    if (changedProps.has('width') && width) {
      this.data.centerX += (rcos(this.data.rotation) * (width.new - width.old)) / 2
      this.data.centerY += (rsin(this.data.rotation) * (width.new - width.old)) / 2
    }
    if (changedProps.has('height') && height) {
      this.data.centerX -= (rsin(this.data.rotation) * (height.new - height.old)) / 2
      this.data.centerY += (rcos(this.data.rotation) * (height.new - height.old)) / 2
    }
    if (changedProps.has('rotation') && rotation) {
      const rotatedXY = xy_rotate2(
        this.data,
        this.data.centerX,
        this.data.centerY,
        rotation.new - rotation.old
      )
      xy_mutate(this.data, rotatedXY)
    }
  }
}

export const injectStageTransform = inject(StageTransformService)

function initData() {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    radius: 0,
  }
}
