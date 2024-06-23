import autobind from 'class-autobind-decorator'
import hotkeys from 'hotkeys-js'
import { AABB, OBB } from 'src/editor/math/obb'
import { xy_, xy_from } from 'src/editor/math/xy'
import { OperateNode } from 'src/editor/operate/node'
import { Schema } from 'src/editor/schema/schema'
import { IIrregular, IPoint } from 'src/editor/schema/type'
import { Elem, ElemHitUtil } from 'src/editor/stage/render/elem'
import { StageScene } from 'src/editor/stage/render/scene'
import { Surface } from 'src/editor/stage/render/surface'
import { StageMarquee } from 'src/editor/stage/render/widget/marquee'
import { StageTransform } from 'src/editor/stage/render/widget/transform'
import { StageViewport, getZoom } from 'src/editor/stage/viewport'
import { Drag } from 'src/global/event/drag'
import { createSignal } from 'src/shared/signal/signal'
import { COLOR, hslBlueColor } from 'src/shared/utils/color'
import { IXY } from 'src/shared/utils/normal'

@autobind
class StageVectorEditService {
  container = new Elem('vector-edit', 'widgetNode')
  editingElem!: Elem

  intoEditNodeId!: string
  node!: IIrregular
  points: IPoint[] = []

  selectedIndexes = createSignal(new Set<number>())
  selectedHandleIndex = createSignal(0)

  initHook() {
    StageScene.widgetRoot.addChild(this.container)

    OperateNode.intoEditNodeId.hook((id) => {
      if (id === '') {
        this.destroy()
        StageTransform.show.dispatch(true)
        return
      }
      this.intoEditNodeId = id
      this.update()
      StageTransform.show.dispatch(false)
    })

    Schema.onMatchPatch('/?/points/...', () => this.update())
    StageViewport.zoom$.hook(() => this.update())

    this.selectedIndexes.hook((newIndexes, oldIndexes) => {
      const updateElem = (index: number) => {
        Surface.collectDirty(this.container.children[index])
      }
      newIndexes.forEach((index) => !oldIndexes.has(index) && updateElem(index))
      oldIndexes.forEach((index) => !newIndexes.has(index) && updateElem(index))
      this.update()
    })
  }

  private update() {
    this.node = Schema.find<IIrregular>(this.intoEditNodeId)
    if (!this.node) return

    this.destroy()

    this.points = this.node.points
    this.points.forEach((point, index) => {
      this.makePoint(xy_from(point), index)
    })
  }

  private destroy() {
    const traverse = (elem: Elem) => {
      Surface.collectDirty(elem)
      elem.children.forEach(traverse)
      elem.children = []
    }
    traverse(this.container)
  }

  makePoint(xy: IXY, index: number) {
    const zoom = getZoom()
    const size = 8 / zoom
    const hovered = createSignal(false)

    const pointElem = new Elem('vector-editor-point-' + index, 'widgetNode', this.container)

    pointElem.obb = new OBB(this.node.x + xy.x, this.node.y + xy.y, size, size, this.node.rotation)

    pointElem.draw = (ctx, path2d) => {
      const selected = this.selectedIndexes.value.has(index)
      const fillColor = selected || hovered.value ? hslBlueColor(60) : COLOR.white
      const lineColor = selected || hovered.value ? COLOR.white : hslBlueColor(60)
      const rate = selected ? 1.4 : 1

      ctx.translate(pointElem.obb.x, pointElem.obb.y)
      path2d.ellipse(0, 0, (size / 2) * rate, (size / 2) * rate, 0, 0, Math.PI * 2)
      ctx.lineWidth = rate / zoom
      ctx.strokeStyle = lineColor
      ctx.fillStyle = fillColor
      ctx.stroke(path2d)
      ctx.fill(path2d)
    }

    pointElem.hitTest = ElemHitUtil.HitPoint(xy_(0, 0), size * 2)

    pointElem.addEvent('hover', (e) => {
      hovered.dispatch(e.hovered)
      Surface.collectDirty(pointElem)
    })

    const afterReset = () => {
      Schema.finalOperation('编辑 point xy')
    }

    const resetPointXY = (index: number, shift: IXY) => {
      const xy = xy_from(this.node.points[index])
      Schema.itemReset(this.node, ['points', index, 'x'], xy.x + shift.x)
      Schema.itemReset(this.node, ['points', index, 'y'], xy.y + shift.y)
      // if (handleLeft) shiftHandleLeft(shift)
      // if (handleRight) shiftHandleRight(shift)
      Schema.commitOperation('编辑 point xy')
      Schema.nextSchema()
    }

    pointElem.addEvent('mousedown', (e) => {
      e.stopPropagation()

      if (!this.selectedIndexes.value.has(index)) {
        if (!hotkeys.shift) this.selectedIndexes.value.clear()
        this.selectedIndexes.dispatch((indexes) => indexes.add(index))
      }

      Drag.onSlide(({ delta }) => {
        delta = StageViewport.toSceneShift(delta!)
        this.selectedIndexes.value.forEach((index) => {
          resetPointXY(index, delta)
        })
      })
    })
  }

  startMarqueeSelect() {
    StageMarquee.duringMarquee.hook(() => {
      this.container.children.forEach((elem, i) => {
        this.selectedIndexes.dispatch((indexes) => {
          const collide = AABB.Collide(StageMarquee.marqueeElem.aabb, elem.aabb)
          collide ? indexes.add(i) : indexes.delete(i)
        })
      })
    })
    StageMarquee.startMarquee()
  }

  // private resetNodePoint(keys: ISchemaPropKey[], value: any) {
  //   Schema.itemReset(this.node, ['points', index, ...keys], value)
  // }
}

export const StageVectorEdit = new StageVectorEditService()
