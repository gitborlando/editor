import autoBind from 'auto-bind'
import Konva from 'konva'
import { autorun, makeObservable } from 'mobx'
import { EE } from '~/helper/event-emitter'
import { listen } from '~/helper/utils'
import { EditorService } from '../editor'
import { StageDraw } from './draw/draw'
import { IStageStatusType, StageStatus } from './status/status'

export class StageService {
  zoom = 1
  cursor = 'auto'
  offset = { x: 0, y: 0 }
  bound = { width: 0, height: 0, left: 240, right: 240, top: 48 }
  konvaLayers: Konva.Layer[] = [new Konva.Layer(), new Konva.Layer()]
  mainLayer = this.konvaLayers[0]
  transformer = new Konva.Transformer()
  status: StageStatus
  draw: StageDraw
  private _instance: Konva.Stage | null = null
  get instance() {
    return this._instance!
  }
  constructor(private editor: EditorService) {
    autoBind(this)
    makeObservable(this, {
      cursor: true,
      bound: true,
      offset: true,
      zoom: true,
    })
    this.setStageBound()
    this.konvaLayers[1].add(this.transformer)
    this.status = new StageStatus(this, this.editor)
    this.draw = new StageDraw(this, this.editor)
    this.autoCursor()
  }
  setInstance(stage: Konva.Stage) {
    if (this._instance) return
    this._instance = stage
    this.instance.add(this.mainLayer).add(this.konvaLayers[1])
    EE.emit('stage-instance-exist')
    window.addEventListener('mousewheel', (event) => {
      const step = event.wheelDelta > 0 ? 0.1 : -0.1
      this.setZoom(this.zoom + step)
      // if (this.instance.scale() + step >= 0.1) {
      //   this.instance.scale.x += step
      //   this.instance.scale.y += step
      // }
    })
  }
  setStatus(status: IStageStatusType = 'select') {
    this.status.setStatus(status)
    return this
  }
  setCursor(cursor: string = 'auto') {
    this.cursor = cursor
    return this
  }
  setOffset(x: number, y: number) {
    this.offset = { x, y }
    return this
  }
  setZoom(zoom: number) {
    this.zoom = zoom
    this.instance.scaleX(this.instance.scaleX() * zoom)
    this.instance.scaleY(this.instance.scaleY() * zoom)
    console.log(this.instance.scaleX())
    // zoom at a special point of the stage
    // this.instance.x(this.instance.x() - this.instance.width() * 0.05)
    // this.instance.y(this.instance.y() - this.instance.height() * 0.05)
    return this
  }
  autoCursor() {
    autorun(() => {
      this.status.status === 'select' && this.setCursor('auto')
      this.status.status === 'dragStage' && this.setCursor('grab')
      this.status.status === 'create' && this.setCursor('crosshair')
    })
  }
  absoluteXY({ x, y }: { x: number; y: number }) {
    return {
      x: x * this.zoom - this.offset.x,
      y: y * this.zoom - this.offset.y,
    }
  }
  absoluteShift({ x, y }: { x: number; y: number }) {
    return {
      x: x * this.zoom,
      y: y * this.zoom,
    }
  }
  private setStageBound() {
    const setStageBound = () => {
      this.bound = {
        ...this.bound,
        width: window.innerWidth - this.bound.left - this.bound.right,
        height: window.innerHeight - this.bound.top + 1,
      }
    }
    setStageBound()
    listen('resize', setStageBound)
  }
}
