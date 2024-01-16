import autobind from 'class-autobind-decorator'
import { max, min } from '~/editor/math/base'
import { OperateGeometry } from '~/editor/operate/geometry'
import { SchemaNode } from '~/editor/schema/node'
import { createInterceptData } from '~/shared/intercept-data/interceptable'
import { firstOne } from '~/shared/utils/array'
import { StageElement } from '../element'
import { StageCreate } from './create'
import { StageSelect } from './select'

@autobind
export class StageTransformService {
  data = createInterceptData(initData())
  initHook() {
    StageCreate.duringCreate.hook(this.calcTransformData)
    StageSelect.duringMarqueeSelect.hook(this.calcTransformData)
    StageSelect.afterSelect.hook(this.calcTransformData)
    OperateGeometry.afterOperate.hook(() => {
      SchemaNode.afterFlushDirty.hookOnce(this.calcTransformData)
    })
  }
  private calcTransformData() {
    this.data._noIntercept = true
    const selectIds = SchemaNode.selectIds
    if (selectIds.value.size === 1) {
      const id = firstOne(selectIds.value)
      const OBB = StageElement.OBBCache.get(id)
      const keys = <const>['width', 'height', 'centerX', 'centerY', 'rotation']
      keys.forEach((key) => (this.data[key] = OBB[key]))
    }
    if (selectIds.value.size > 1) {
      let [xMin, yMin, xMax, yMax] = [Infinity, Infinity, -Infinity, -Infinity]
      SchemaNode.selectNodes.forEach((node) => {
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
    this.data._noIntercept = false
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
    pivotX: 0,
    pivotY: 0,
    rotation: 0,
    radius: 0,
  }
}
