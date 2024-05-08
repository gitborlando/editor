import autobind from 'class-autobind-decorator'
import hotkeys from 'hotkeys-js'
import { max, min } from '~/editor/math/base'
import { OBB } from '~/editor/math/obb'
import { OperateGeometry } from '~/editor/operate/geometry'
import { OperateMeta } from '~/editor/operate/meta'
import { OperateNode } from '~/editor/operate/node'
import { SchemaHistory } from '~/editor/schema/history'
import { Schema } from '~/editor/schema/schema'
import { Drag } from '~/global/event/drag'
import { createSignal } from '~/shared/signal/signal'
import { IXY } from '~/shared/utils/normal'
import { XY } from '~/shared/xy'
import { StageInteract } from '../interact/interact'
import { Pixi } from '../pixi'
import { StageViewport } from '../viewport'

@autobind
class StageWidgetTransformService {
  needDraw = createSignal(false)
  transformOBB: OBB = new OBB(0, 0, 0, 0, 0)
  vertexes = <IXY[]>[]
  mouseOnEdge = false
  initHook() {
    Pixi.inited.hook(() => {
      this.bindMoveEvent()
    })
    SchemaHistory.afterReplay.hook(() => {
      this.needDraw.dispatch(true)
    })
    OperateNode.selectIds.hook(() => {
      this.needDraw.dispatch(true)
    })
    OperateMeta.curPage.hook(() => {
      this.needDraw.dispatch(false)
    })
    OperateGeometry.beforeOperate.hook((operateKeys) => {
      //  /*       operateKeys.some((k) => k !== 'width' && k !== 'height') &&  */
      this.needDraw.dispatch(false)
    })
    StageViewport.beforeZoom.hook(() => {
      this.needDraw.dispatch(false)
    })
    StageViewport.afterZoom.hook(() => {
      this.needDraw.dispatch(true)
    })
    // UIPickerCopy.show.hook((show) => {
    //   this.needDraw.dispatch(!show)
    // })
    OperateGeometry.afterOperate.hook(() => {
      // const operateKeys = OperateGeometry.beforeOperate.value
      this.needDraw.dispatch(true)
      // if (operateKeys.some((k) => k !== 'width' && k !== 'height')) {

      // }
    })
  }
  mouseIn(e: MouseEvent) {
    if (this.needDraw.value === false) return false
    const { x, y } = StageViewport.toSceneStageXY(XY.From(e, 'client'))
    const pointOBB = new OBB(x, y, 1, 1, 0)
    return this.transformOBB.obbHitTest(pointOBB)
  }
  calcTransformOBB() {
    if (!OperateNode.selectIds.value.size) {
      return (this.transformOBB = new OBB(0, 0, 0, 0, 0))
    }
    if (OperateNode.selectIds.value.size === 1) {
      const node = OperateNode.selectNodes[0]
      const { centerX, centerY, width, height, rotation } = node
      return (this.transformOBB = new OBB(centerX, centerY, width, height, rotation))
    }
    let [xMin, yMin, xMax, yMax] = [Infinity, Infinity, -Infinity, -Infinity]
    OperateNode.selectNodes.forEach((node) => {
      const obb = OperateNode.getNodeRuntime(node.id).obb
      obb.calcVertexXY().forEach((xy) => {
        xMin = min(xMin, xy.x)
        yMin = min(yMin, xy.y)
        xMax = max(xMax, xy.x)
        yMax = max(yMax, xy.y)
      })
    })
    const [x, y, width, height] = [xMin, yMin, xMax - xMin, yMax - yMin]
    return (this.transformOBB = new OBB(x + width / 2, y + height / 2, width, height, 0))
  }
  bindMoveEvent() {
    const handleDrag = () => {
      const { x, y } = OperateGeometry.geometry
      Drag.onStart(() => {
        this.needDraw.dispatch(false)
        if (hotkeys.alt) {
          OperateNode.copySelectNodes()
          OperateNode.pasteNodes()
        }
        OperateGeometry.beforeOperate.dispatch(['x', 'y'])
      })
        .onMove(({ shift }) => {
          const sceneShiftXY = StageViewport.toSceneStageShiftXY(shift)
          OperateGeometry.setGeometry('x', x + sceneShiftXY.x)
          OperateGeometry.setGeometry('y', y + sceneShiftXY.y)
        })
        .onDestroy(({ dragService }) => {
          if (dragService.started) {
            if (hotkeys.alt) {
              OperateGeometry.operateKeys.clear()
              Schema.finalOperation('alt 复制节点')
            } else {
              OperateGeometry.afterOperate.dispatch()
            }
          }
        })
    }
    Pixi.addListener('mousedown', (e) => {
      if (StageInteract.currentType.value !== 'select') return
      if (this.mouseOnEdge) return
      if (this.mouseIn(e as MouseEvent)) handleDrag()
    })
  }
}

export const StageWidgetTransform = new StageWidgetTransformService()
