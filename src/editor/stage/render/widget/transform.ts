import autobind from 'class-autobind-decorator'
import hotkeys from 'hotkeys-js'
import { EditorCursor } from 'src/editor/editor/cursor'
import { radianfy, rcos, rsin } from 'src/editor/math/base'
import { AABB, OBB } from 'src/editor/math/obb'
import { xy_, xy_plus } from 'src/editor/math/xy'
import { OperateGeometry } from 'src/editor/operate/geometry'
import { OperateNode } from 'src/editor/operate/node'
import { SchemaHistory } from 'src/editor/schema/history'
import { Schema } from 'src/editor/schema/schema'
import { StageInteract } from 'src/editor/stage/interact/interact'
import { Elem, ElemMouseEvent } from 'src/editor/stage/render/elem'
import { StageScene } from 'src/editor/stage/render/scene'
import { Surface } from 'src/editor/stage/render/surface'
import { StageViewport, getZoom } from 'src/editor/stage/viewport'
import { Drag } from 'src/global/event/drag'
import { createSignal } from 'src/shared/signal/signal'
import { createObjCache } from 'src/shared/utils/cache'
import { hslBlueColor } from 'src/shared/utils/color'
import { IXY, iife } from 'src/shared/utils/normal'

@autobind
class StageWidgetTransformService {
  show = createSignal(false)
  transformOBB = OBB.IdentityOBB()

  private transformElem = new Elem('transform')
  private lineElems = createObjCache<Elem>()
  private vertexElems = createObjCache<Elem>()
  private rotateElems = createObjCache<Elem>()

  initHook() {
    StageScene.widgetRoot.addChild(this.transformElem)

    this.transformElem.on('mousedown', (e) => {
      if (StageInteract.currentType.value !== 'select') return
      e.stopPropagation()
      this.move()
    })

    this.hookShow()
    this.show.hook(() => this.render())
  }

  move() {
    const { x, y } = OperateGeometry.geometry
    Drag.onStart(() => {
      this.show.dispatch(false)
      if (hotkeys.alt) {
        EditorCursor.setCursor('copy')
        OperateNode.copySelectNodes()
        OperateNode.pasteNodes()
      }
      OperateGeometry.beforeOperate.dispatch(['x', 'y'])
    })
      .onMove(({ shift }) => {
        const sceneShiftXY = StageViewport.toSceneShift(shift)
        OperateGeometry.setGeometry('x', x + sceneShiftXY.x)
        OperateGeometry.setGeometry('y', y + sceneShiftXY.y)
      })
      .onDestroy(({ dragService }) => {
        if (dragService.started) {
          if (hotkeys.alt) {
            EditorCursor.setCursor('select')
            OperateGeometry.operateKeys.clear()
            Schema.finalOperation('alt 复制节点')
          } else {
            OperateGeometry.afterOperate.dispatch()
          }
        }
      })
  }

  private hookShow() {
    SchemaHistory.afterReplay.hook(() => {
      this.show.dispatch(true)
    })
    OperateNode.selectIds.hook(() => {
      this.show.dispatch(true)
    })
    StageViewport.beforeZoom.hook(() => {
      this.show.dispatch(false)
    })
    StageViewport.afterZoom.hook(() => {
      this.show.dispatch(true)
    })
    OperateGeometry.afterOperate.hook(() => {
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
    Surface.collectDirtyRect(this.transformElem.aabb, 6)
    this.calcTransformOBB()
    Surface.collectDirtyRect(this.transformElem.aabb, 6)

    this.transformElem.hidden = false
    if (this.transformOBB.width === 0) {
      this.transformElem.hidden = true
      return Surface.collectDirtyRect(this.transformElem.aabb, 6)
    }

    const [p0, p1, p2, p3] = this.transformOBB.calcVertexXY()
    this.setupTransformElem()
    // this.setupRotation(p1)
    this.setupLine('top', p0, p1)
    this.setupLine('right', p1, p2)
    this.setupLine('bottom', p2, p3)
    this.setupLine('left', p3, p0)
    this.setupVertex('topLeft', p0)
    this.setupVertex('topRight', p1)
    this.setupVertex('bottomRight', p2)
    this.setupVertex('bottomLeft', p3)

    OperateNode.selectingNodes.map((node) => {
      const elem = StageScene.findElem(node.id)
      if (elem) elem.outline = 'select'
    })
  }

  private calcTransformOBB() {
    if (!OperateNode.selectIds.value.size) {
      return (this.transformOBB = OBB.IdentityOBB())
    }
    if (OperateNode.selectIds.value.size === 1) {
      const elem = StageScene.findElem(OperateNode.selectingNodes[0].id)
      if (!elem) return (this.transformOBB = OBB.IdentityOBB())
      return (this.transformOBB = elem.obb.clone())
    }
    const aabbList = OperateNode.selectingNodes.map((node) => {
      return StageScene.findElem(node.id).obb.aabb
    })
    return (this.transformOBB = OBB.FromAABB(AABB.Merge(...aabbList)))
  }

  private setupTransformElem() {
    this.transformElem.obb = this.transformOBB
    this.transformElem.hitTest = this.transformElem.eventHandle.hitRoundRect(
      this.transformOBB.width,
      this.transformOBB.height,
      0
    )
  }

  private setupLine(type: 'top' | 'bottom' | 'left' | 'right', p1: IXY, p2: IXY) {
    const spread = 10
    const { geometry, beforeOperate, afterOperate, setGeometry } = OperateGeometry

    const mouseover = (e: ElemMouseEvent) => {
      if (!e.hovered) return EditorCursor.setCursor('select')

      switch (type) {
        case 'top':
        case 'bottom':
          return EditorCursor.setCursor('resize', this.transformOBB.rotation + 90)
        case 'right':
        case 'left':
          return EditorCursor.setCursor('resize', this.transformOBB.rotation)
      }
    }

    const mousedown = (e: ElemMouseEvent) => {
      e.stopPropagation()

      const { x, y, width, height, rotation } = OperateGeometry.geometry

      Drag.onStart(() => {
        const operateKeys = iife(() => {
          if (type === 'top') return ['x', 'y', 'height']
          if (type === 'right') return ['width']
          if (type === 'bottom') return ['height']
          if (type === 'left') return ['x', 'y', 'width']
        }) //@ts-ignore
        beforeOperate.dispatch(operateKeys)
      })
        .onMove(({ shift }) => {
          shift = StageViewport.toSceneShift(shift)
          switch (type) {
            case 'top':
              setGeometry('x', x - shift.y * rsin(rotation))
              setGeometry('y', y + shift.y * rcos(rotation))
              setGeometry('height', height - shift.y)
              break
            case 'right':
              setGeometry('width', width + shift.x)
              break
            case 'bottom':
              setGeometry('height', height + shift.y)
              break
            case 'left':
              setGeometry('x', x + shift.x * rcos(rotation))
              setGeometry('y', y + shift.x * rsin(rotation))
              setGeometry('width', width - shift.x)
              break
          }
        })
        .onDestroy(() => {
          afterOperate.dispatch()
        })
    }

    const line = this.lineElems.getSet(type, () => {
      const line = new Elem(`transform-line-${type}`)
      this.transformElem.addChild(line)
      line.on('hover', mouseover)
      line.on('mousedown', mousedown)
      return line
    })

    line.hitTest = line.eventHandle.hitPolyline([p1, p2], spread / getZoom())

    line.draw = (ctx, path2d) => {
      if (!this.show.value) return

      ctx.lineWidth = 1 / getZoom()
      ctx.strokeStyle = hslBlueColor(65)
      path2d.moveTo(p1.x, p1.y)
      path2d.lineTo(p2.x, p2.y)
      ctx.stroke(path2d)
    }
  }

  private setupVertex(type: 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft', xy: IXY) {
    const mouseenter = (e: ElemMouseEvent) => {
      if (!e.hovered) return EditorCursor.setCursor('select')

      switch (type) {
        case 'topLeft':
        case 'bottomRight':
          return EditorCursor.setCursor('resize', this.transformOBB.rotation + 45)
        case 'topRight':
        case 'bottomLeft':
          return EditorCursor.setCursor('resize', this.transformOBB.rotation - 45)
      }
    }

    const mousedown = (e: ElemMouseEvent) => {
      e.stopPropagation()

      const { x, y, width, height } = OperateGeometry.geometry
      Drag.onStart(() => {
        const operateKeys = iife(() => {
          if (type === 'topLeft') return ['x', 'y', 'width', 'height']
          if (type === 'topRight') return ['y', 'width', 'height']
          if (type === 'bottomRight') return ['width', 'height']
          if (type === 'bottomLeft') return ['x', 'width', 'height']
        }) //@ts-ignore
        OperateGeometry.beforeOperate.dispatch(operateKeys)
      })
        .onMove(({ shift }) => {
          shift = StageViewport.toSceneShift(shift)
          switch (type) {
            case 'topLeft':
              OperateGeometry.setGeometry('x', x + shift.x)
              OperateGeometry.setGeometry('y', y + shift.y)
              OperateGeometry.setGeometry('width', width - shift.x)
              OperateGeometry.setGeometry('height', height - shift.y)
              break
            case 'topRight':
              OperateGeometry.setGeometry('y', y + shift.y)
              OperateGeometry.setGeometry('width', width + shift.x)
              OperateGeometry.setGeometry('height', height - shift.y)
              break
            case 'bottomRight':
              OperateGeometry.setGeometry('width', width + shift.x)
              OperateGeometry.setGeometry('height', height + shift.y)
              break
            case 'bottomLeft':
              OperateGeometry.setGeometry('x', x + shift.x)
              OperateGeometry.setGeometry('width', width - shift.x)
              OperateGeometry.setGeometry('height', height + shift.y)
              break
          }
        })
        .onDestroy(() => {
          OperateGeometry.afterOperate.dispatch()
        })
    }

    const vertexElem = this.vertexElems.getSet(type, () => {
      const vertexElem = new Elem(`transform-vertex-${type}`)
      vertexElem.on('hover', mouseenter)
      vertexElem.on('mousedown', mousedown)
      vertexElem.on('mousemove', (e) => e.stopPropagation())
      this.transformElem.addChild(vertexElem)
      return vertexElem
    })

    const zoom = StageViewport.zoom.value
    const size = 6 / zoom

    vertexElem.hitTest = vertexElem.eventHandle.hitPoint(xy, size * 5)

    vertexElem.draw = (ctx, path2d) => {
      if (!this.show.value) return

      path2d.roundRect(-size / 2, -size / 2, size, size, 1 / zoom)
      ctx.lineWidth = 2 / zoom
      ctx.strokeStyle = hslBlueColor(65)
      ctx.fillStyle = 'white'
      ctx.translate(xy.x, xy.y)
      ctx.rotate(radianfy(this.transformOBB.rotation))
      ctx.stroke(path2d)
      ctx.fill(path2d)
    }
  }

  private setupRotation(startXY: IXY) {
    const spread = 10
    const { beforeOperate, afterOperate, setGeometry } = OperateGeometry

    const mouseover = (e: ElemMouseEvent) => {
      if (!e.hovered) return EditorCursor.setCursor('select')
      return EditorCursor.setCursor('resize', this.transformOBB.rotation)
    }

    const mousedown = (e: ElemMouseEvent) => {
      e.stopPropagation()

      Drag.onStart(() => {
        beforeOperate.dispatch(['rotation'])
      })
        .onMove(({ shift }) => {
          shift = StageViewport.toSceneShift(shift)
          const { rotation } = OperateGeometry.geometry
          setGeometry('rotation', rotation - shift.y * rsin(rotation))
        })
        .onDestroy(() => {
          afterOperate.dispatch()
        })
    }

    const rotate = this.rotateElems.getSet('rotate', () => {
      const rotate = new Elem('transform-rotate')
      this.transformElem.addChild(rotate)
      rotate.on('hover', mouseover)
      rotate.on('mousedown', mousedown)
      return rotate
    })

    const angle = this.transformOBB.rotation - 45
    const sin = (rsin(angle) * 30) / getZoom()
    const cos = (rcos(angle) * 30) / getZoom()
    const endXY = xy_plus(startXY, xy_(cos, sin))

    rotate.hitTest = rotate.eventHandle.hitPoint(endXY, 10 / getZoom())

    rotate.draw = (ctx, path2d) => {
      if (!this.show.value) return

      const size = 6 / getZoom()
      ctx.lineWidth = 1 / getZoom()
      ctx.strokeStyle = hslBlueColor(65)
      ctx.fillStyle = 'white'
      path2d.moveTo(startXY.x, startXY.y)
      path2d.lineTo(endXY.x, endXY.y)
      path2d.roundRect(endXY.x - size / 2, endXY.y - size / 2, size, size, 1 / getZoom())
      ctx.stroke(path2d)
      ctx.fill(path2d)
    }
  }
}

export const StageWidgetTransform = new StageWidgetTransformService()
