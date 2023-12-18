import { inject, injectable } from 'tsyringe'
import { max, min } from '~/editor/math/base'
import { xy_mutate2 } from '~/editor/math/xy'
import { OperateGeometryService, injectOperateGeometry } from '~/editor/operate/geometry'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { Before_After_Toggle, autobind } from '~/shared/decorator'
import { createInterceptData } from '~/shared/intercept-data/interceptable'
import { StageElementService, injectStageElement } from '../element'
import { StageSelectService, injectStageSelect } from './select'

@autobind
@injectable()
export class StageTransformService {
  data = createInterceptData(initData())
  constructor(
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectStageSelect private StageSelect: StageSelectService,
    @injectOperateGeometry private OperateGeometry: OperateGeometryService,
    @injectStageElement private StageElement: StageElementService
  ) {
    this.initialize()
  }
  private initialize() {
    this.StageSelect.duringSelect.hook(() => this.onSelectSetTransformData())
    this.StageSelect.afterSelect.hook(() => this.onSelectSetTransformData())
    this.OperateGeometry.afterOperate.hook(() => {
      this.SchemaNode.afterFlushDirty.hookOnce(() => {
        this.onSelectSetTransformData()
      })
    })
  }
  @Before_After_Toggle('data._noIntercept')
  private onSelectSetTransformData() {
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
    radius: 0,
  }
}
