import { createObjCache } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import { radianfy, rcos, rsin } from 'src/editor/math/base'
import { AABB, OBB } from 'src/editor/math/obb'
import { xy_dot, xy_getRotation, xy_xAxis, xy_yAxis } from 'src/editor/math/xy'
import { OperateGeometry } from 'src/editor/operate/geometry'
import { OperateNode, getSelectIds, getSelectNodes } from 'src/editor/operate/node'
import { SchemaHistory } from 'src/editor/schema/history'
import { Schema } from 'src/editor/schema/schema'
import { ID } from 'src/editor/schema/type'
import { StageCursor } from 'src/editor/stage/cursor'
import { StageInteract } from 'src/editor/stage/interact/interact'
import { StageSelect } from 'src/editor/stage/interact/select'
import { Elem, ElemMouseEvent, HitTest } from 'src/editor/stage/render/elem'
import { StageScene } from 'src/editor/stage/render/scene'
import { Surface } from 'src/editor/stage/render/surface'
import { StageViewport, getZoom } from 'src/editor/stage/viewport'
import { Drag } from 'src/global/event/drag'
import { createSignal } from 'src/shared/signal/signal'
import { hslBlueColor } from 'src/shared/utils/color'
import { isLeftMouse, isRightMouse } from 'src/shared/utils/event'
import { IXY } from 'src/shared/utils/normal'

@autobind
class StageTransformService {
  show = createSignal(false)

  get transformOBB() {
    return this.transformElem.obb
  }

  private transformElem = new Elem('transform', 'widgetElem')
  private lineElems = createObjCache<Elem>()
  private vertexElems = createObjCache<Elem>()

  initHook() {
    this.setupTransformElem()
    this.hookShow()
  }

  move = (e: ElemMouseEvent) => {
    Drag.onStart(() => {
      this.show.dispatch(false)
      if (e.hostEvent.altKey) {
        StageCursor.setCursor('copy')
        OperateNode.copySelectNodes()
        OperateNode.pasteNodes()
      }
    })
      .onMove(({ delta }) => {
        delta = StageViewport.toSceneShift(delta ?? { x: 0, y: 0 })
        OperateGeometry.setActiveGeometry('x', delta.x, true)
        OperateGeometry.setActiveGeometry('y', delta.y, true)
      })
      .onDestroy(() => {
        if (Drag.started) {
          if (e.hostEvent.altKey) {
            StageCursor.setCursor('select')
            OperateGeometry.operateKeys.clear()
            Schema.finalOperation('alt 复制节点')
          }
          SchemaHistory.commit('操作几何数据')
          YUndo.track({ type: 'state', description: '移动节点' })
        }
      })
  }

  private hookShow() {
    this.show.hook(() => this.render())
    this.show.intercept(() => {
      if (!getSelectIds().length) return false
      if (OperateNode.intoEditNodeId.value) return false
    })
    OperateNode.selectIds.hook((newIds, oldIds) => {
      this.updateElemOutline(newIds, oldIds)
      this.show.dispatch(true)
    })

    OperateNode.intoEditNodeId.hook(() => {
      this.show.dispatch(false)
    })
    OperateNode.selectedNodes.hook(() => {
      this.show.dispatch(true)
    })
  }

  private render() {
    if (!this.transformElem.hidden) {
      Surface.collectDirty(this.transformElem)
    }

    if (this.show.value === false) {
      return (this.transformElem.hidden = true)
    } else {
      this.transformElem.hidden = false
    }

    this.calcTransformOBB()
    Surface.collectDirty(this.transformElem)

    const [p0, p1, p2, p3] = this.transformOBB.calcVertexXY()
    this.updateTransformElem()
    this.updateLine('top', p0, p1)
    this.updateLine('right', p1, p2)
    this.updateLine('bottom', p2, p3)
    this.updateLine('left', p3, p0)
    this.updateVertex('topLeft', p0)
    this.updateVertex('topRight', p1)
    this.updateVertex('bottomRight', p2)
    this.updateVertex('bottomLeft', p3)
  }

  private calcTransformOBB() {
    if (!getSelectIds().length) {
      return (this.transformElem.obb = OBB.IdentityOBB())
    }

    if (getSelectIds().length === 1) {
      const elem = StageScene.findElem(getSelectNodes()[0].id)
      if (!elem) return (this.transformElem.obb = OBB.IdentityOBB())
      return (this.transformElem.obb = elem.obb.clone())
    }

    const aabbList = getSelectNodes().map((node) => StageScene.findElem(node.id).aabb)
    return (this.transformElem.obb = OBB.FromAABB(AABB.Merge(aabbList)))
  }

  private setupTransformElem = () => {
    StageScene.widgetRoot.addChild(this.transformElem)

    // this.transformElem.getDirtyRect = (expand) => {
    //   return expand(this.transformOBB.aabb, 6)
    // }

    this.transformElem.addEvent('mousedown', (e) => {
      if (StageInteract.currentType.value !== 'select') return

      if (isLeftMouse(e.hostEvent)) {
        e.stopPropagation()
        this.move(e)
      } else {
        StageSelect.onMenu()
      }
    })

    Surface.addEvent('mousedown', () => {
      if (Surface.getElemsFromPoint().some((elem) => elem.id.includes('transform'))) {
        Surface.disablePointEvent()
      }
    })
  }

  private updateTransformElem() {
    // this.transformElem.obb = this.transformOBB
    // this.transformElem.hitTest = HitTest.HitRoundRect(
    //   this.transformOBB.width,
    //   this.transformOBB.height,
    //   0,
    // )
  }

  private updateLine(type: 'top' | 'bottom' | 'left' | 'right', p1: IXY, p2: IXY) {
    const { setActiveGeometry } = OperateGeometry

    const mouseover = (e: ElemMouseEvent) => {
      if (!e.hovered) return StageCursor.setCursor('select')

      const selectNodes = getSelectNodes()
      if (selectNodes.length === 1 && selectNodes[0].type === 'line') {
        return StageCursor.setCursor('select')
      }

      switch (type) {
        case 'top':
        case 'bottom':
          return StageCursor.setCursor('resize', this.transformOBB.rotation + 90)
        case 'right':
        case 'left':
          return StageCursor.setCursor('resize', this.transformOBB.rotation)
      }
    }

    const mousedown = (e: ElemMouseEvent) => {
      StageCursor.lock()
      e.stopPropagation()

      const { x, y, width, height, rotation } = OperateGeometry.activeGeometry

      Drag.onSlide(({ shift }) => {
        shift = StageViewport.toSceneShift(shift)
        const shiftW = xy_dot(shift, xy_xAxis(rotation))
        const shiftH = xy_dot(shift, xy_yAxis(rotation))

        if (getSelectNodes().length === 1 && getSelectNodes()[0].type === 'line') {
          setActiveGeometry('x', x + xy_dot(shift, xy_xAxis(0)))
          setActiveGeometry('y', y + xy_dot(shift, xy_yAxis(0)))
          return
        }

        if (e.hostEvent.shiftKey) {
          switch (type) {
            case 'top':
              setActiveGeometry('x', x - (shiftH / 2) * rsin(rotation))
              setActiveGeometry('y', y + (shiftH / 2) * rcos(rotation))
              setActiveGeometry('height', height - shiftH)
              setActiveGeometry('height', height + -shiftH)
              break
            case 'right':
              setActiveGeometry('width', width + shiftW)
              setActiveGeometry('x', x + (-shiftW / 2) * rcos(rotation))
              setActiveGeometry('y', y + (-shiftW / 2) * rsin(rotation))
              setActiveGeometry('width', width - -shiftW)
              break
            case 'bottom':
              setActiveGeometry('height', height + shiftH)
              setActiveGeometry('x', x - (-shiftH / 2) * rsin(rotation))
              setActiveGeometry('y', y + (-shiftH / 2) * rcos(rotation))
              setActiveGeometry('height', height - -shiftH)
              break
            case 'left':
              setActiveGeometry('x', x + (shiftW / 2) * rcos(rotation))
              setActiveGeometry('y', y + (shiftW / 2) * rsin(rotation))
              setActiveGeometry('width', width - shiftW)
              setActiveGeometry('width', width + -shiftW)
              break
          }
        } else {
          switch (type) {
            case 'top':
              setActiveGeometry('x', x - shiftH * rsin(rotation))
              setActiveGeometry('y', y + shiftH * rcos(rotation))
              setActiveGeometry('height', height - shiftH)
              break
            case 'right':
              setActiveGeometry('width', width + shiftW)
              break
            case 'bottom':
              setActiveGeometry('height', height + shiftH)
              break
            case 'left':
              setActiveGeometry('x', x + shiftW * rcos(rotation))
              setActiveGeometry('y', y + shiftW * rsin(rotation))
              setActiveGeometry('width', width - shiftW)
              break
          }
        }
      }).onDestroy(() => SchemaHistory.commit('操作几何数据'))
    }

    const line = this.lineElems.getSet(type, () => {
      const line = new Elem(`transform-line-${type}`, 'widgetElem')
      line.addEvent('hover', mouseover)
      line.addEvent('mousedown', mousedown)
      return line
    })

    line.hitTest = HitTest.HitPolyline([p1, p2], 4 / getZoom())

    line.draw = (ctx, path2d) => {
      if (!this.show.value) return

      ctx.lineWidth = 1 / getZoom()
      ctx.strokeStyle = hslBlueColor(65)
      path2d.moveTo(p1.x, p1.y)
      path2d.lineTo(p2.x, p2.y)
      ctx.stroke(path2d)
    }
  }

  private updateVertex(type: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft', xy: IXY) {
    const { setActiveGeometry } = OperateGeometry

    const mouseenter = (e: ElemMouseEvent) => {
      if (!e.hovered) return StageCursor.setCursor('select')

      if (getSelectNodes().length === 1 && getSelectNodes()[0].type === 'line') {
        return StageCursor.setCursor('resize', this.transformOBB.rotation)
      }

      switch (type) {
        case 'topLeft':
        case 'bottomRight':
          return StageCursor.setCursor('resize', this.transformOBB.rotation + 45)
        case 'topRight':
        case 'bottomLeft':
          return StageCursor.setCursor('resize', this.transformOBB.rotation - 45)
      }
    }

    const moveVertex = (e: ElemMouseEvent) => {
      StageCursor.lock()
      const { x, y, width, height, rotation } = OperateGeometry.activeGeometry

      Drag.onSlide(({ shift }) => {
        shift = StageViewport.toSceneShift(shift)
        const shiftW = xy_dot(shift, xy_xAxis(rotation))
        const shiftH = xy_dot(shift, xy_yAxis(rotation))

        if (getSelectNodes().length === 1 && getSelectNodes()[0].type === 'line') {
          setActiveGeometry('width', width + shiftW)
          setActiveGeometry('height', height + shiftH)
          return
        }

        if (e.hostEvent.shiftKey) {
          switch (type) {
            case 'topLeft':
              setActiveGeometry('x', x - shiftH * rsin(rotation) + shiftW * rcos(rotation))
              setActiveGeometry('y', y + shiftW * rsin(rotation) + shiftH * rcos(rotation))
              setActiveGeometry('width', width - shiftW)
              setActiveGeometry('height', height - shiftH)
              break
            case 'topRight':
              setActiveGeometry('x', x - shiftH * rsin(rotation))
              setActiveGeometry('y', y + shiftH * rcos(rotation))
              setActiveGeometry('height', height - shiftH)
              setActiveGeometry('width', width + shiftW)
              break
            case 'bottomRight':
              setActiveGeometry('width', width + shiftW)
              setActiveGeometry('height', height + shiftH)
              setActiveGeometry(
                'x',
                x - (-shiftH / 2) * rsin(rotation) + (-shiftW / 2) * rcos(rotation),
              )
              setActiveGeometry(
                'y',
                y + (-shiftW / 2) * rsin(rotation) + (-shiftH / 2) * rcos(rotation),
              )
              setActiveGeometry('width', width - -shiftW)
              setActiveGeometry('height', height - -shiftH)
              break
            case 'bottomLeft':
              setActiveGeometry('x', x + shiftW * rcos(rotation))
              setActiveGeometry('y', y + shiftW * rsin(rotation))
              setActiveGeometry('width', width - shiftW)
              setActiveGeometry('height', height + shiftH)
              break
          }
        } else {
          switch (type) {
            case 'topLeft':
              setActiveGeometry('x', x - shiftH * rsin(rotation) + shiftW * rcos(rotation))
              setActiveGeometry('y', y + shiftW * rsin(rotation) + shiftH * rcos(rotation))
              setActiveGeometry('width', width - shiftW)
              setActiveGeometry('height', height - shiftH)
              break
            case 'topRight':
              setActiveGeometry('x', x - shiftH * rsin(rotation))
              setActiveGeometry('y', y + shiftH * rcos(rotation))
              setActiveGeometry('height', height - shiftH)
              setActiveGeometry('width', width + shiftW)
              break
            case 'bottomRight':
              setActiveGeometry('width', width + shiftW)
              setActiveGeometry('height', height + shiftH)
              break
            case 'bottomLeft':
              setActiveGeometry('x', x + shiftW * rcos(rotation))
              setActiveGeometry('y', y + shiftW * rsin(rotation))
              setActiveGeometry('width', width - shiftW)
              setActiveGeometry('height', height + shiftH)
              break
          }
        }
      }).onDestroy(() => SchemaHistory.commit('操作几何数据'))
    }

    const rotate = (e: ElemMouseEvent) => {
      const { rotation, center } = this.transformOBB

      StageCursor.setCursor('rotate').lock().upReset()

      Drag.onSlide(({ current, start }) => {
        current = StageViewport.toSceneXY(current)
        start = StageViewport.toSceneXY(start)
        const deltaRotation = xy_getRotation(current, start, center)

        setActiveGeometry('rotation', rotation + deltaRotation)
      })
    }

    const mousedown = (e: ElemMouseEvent) => {
      e.stopPropagation()
      if (isLeftMouse(e.hostEvent)) return moveVertex(e)
      if (isRightMouse(e.hostEvent)) rotate(e)
    }

    const vertexElem = this.vertexElems.getSet(type, () => {
      const vertexElem = new Elem(`transform-vertex-${type}`, 'widgetElem', this.transformElem)
      vertexElem.addEvent('hover', mouseenter)
      vertexElem.addEvent('mousedown', mousedown)
      vertexElem.addEvent('mousemove', (e) => e.stopPropagation())
      return vertexElem
    })

    const size = 6 / getZoom()

    vertexElem.hitTest = HitTest.HitPoint(xy, size * 5)

    vertexElem.draw = (ctx, path2d) => {
      if (!this.show.value) return

      path2d.roundRect(-size / 2, -size / 2, size, size, 1 / getZoom())
      ctx.lineWidth = 2 / getZoom()
      ctx.strokeStyle = hslBlueColor(65)
      ctx.fillStyle = 'white'
      ctx.translate(xy.x, xy.y)
      ctx.rotate(radianfy(this.transformOBB.rotation))
      ctx.stroke(path2d)
      ctx.fill(path2d)
    }
  }

  private updateElemOutline = (newIds: Set<ID>, oldIds: Set<ID>) => {
    oldIds.forEach((id) => {
      const elem = StageScene.findElem(id)
      if (!elem) return
      elem.outline = undefined
      Surface.collectDirty(elem)
    })
    newIds.forEach((id) => {
      const elem = StageScene.findElem(id)
      if (!elem) return
      elem.outline = 'select'
      Surface.collectDirty(elem)
    })
  }
}

export const StageTransform = new StageTransformService()
