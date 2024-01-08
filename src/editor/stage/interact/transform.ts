import { max, min } from '~/editor/math/base'
import { xy_mutate2 } from '~/editor/math/xy'
import { OperateGeometry } from '~/editor/operate/geometry'
import { SchemaNode } from '~/editor/schema/node'
import { WrapToggle, autobind } from '~/shared/decorator'
import { createInterceptData } from '~/shared/intercept-data/interceptable'
import { StageElement } from '../element'
import { StageSelect } from './select'

@autobind
export class StageTransformService {
  data = createInterceptData(initData())
  initHook() {
    StageSelect.duringMarqueeSelect.hook(() => this.onSelectSetTransformData())
    StageSelect.afterSelect.hook(() => this.onSelectSetTransformData())
    OperateGeometry.afterOperate.hook(() => {
      SchemaNode.afterFlushDirty.hookOnce(() => {
        this.onSelectSetTransformData()
      })
    })
  }
  @WrapToggle('data._noIntercept')
  private onSelectSetTransformData() {
    const selectIds = SchemaNode.selectIds
    if (selectIds.value.size === 1) {
      const OBB = StageElement.OBBCache.get([...selectIds.value][0])
      void (<const>['width', 'height', 'centerX', 'centerY', 'rotation']).forEach(
        (key) => (this.data[key] = OBB[key])
      )
      xy_mutate2(this.data, OBB.xy.x, OBB.xy.y)
    }
    if (selectIds.value.size > 1) {
      const nodes = [...selectIds.value].map((id) => SchemaNode.find(id))
      let [xMin, yMin, xMax, yMax] = [Infinity, Infinity, -Infinity, -Infinity]
      nodes.forEach((node) => {
        const OBB = StageElement.OBBCache.get(node.id)
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

export const StageTransform = new StageTransformService()

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
