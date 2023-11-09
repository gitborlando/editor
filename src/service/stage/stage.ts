import autoBind from 'auto-bind'
import Konva from 'konva'
import { autorun, makeAutoObservable } from 'mobx'
import { listen } from '~/helper/utils'
import { EditorService } from '../editor/editor'
import { IStageStatusType, StageStatus } from './status/status'

export class StageService {
  private _instance: Konva.Stage | null = null
  konvaLayers: Konva.Layer[] = [new Konva.Layer(), new Konva.Layer()]
  mainLayer = this.konvaLayers[0]
  transformer = new Konva.Transformer()
  cursor = 'auto'
  bound = { width: 0, height: 0, left: 250, right: 250, top: 45 }
  offset = { x: 0, y: 0 }
  zoom = 1
  Status: StageStatus
  constructor(public editor: EditorService) {
    autoBind(this)
    makeAutoObservable(this)
    this.setStageBound()
    this.konvaLayers[1].add(this.transformer)
    this.Status = new StageStatus(this)
    this.autoCursor()
  }
  get instance() {
    return this._instance!
  }
  get status() {
    return this.Status.status
  }
  setInstance(stage: Konva.Stage) {
    if (this._instance) return
    this._instance = stage
    this.instance.add(this.mainLayer).add(this.konvaLayers[1])
    this.Status.init()
    return this
  }
  setStatus(status: IStageStatusType = 'select') {
    this.Status.setStatus(status)
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
    // zoom at a special point of the stage
    this.instance.x(this.instance.x() - this.instance.width() * 0.05)
    this.instance.y(this.instance.y() - this.instance.height() * 0.05)
    return this
  }
  autoCursor() {
    autorun(() => {
      this.status === 'select' && this.setCursor('auto')
      this.status === 'dragStage' && this.setCursor('grab')
      this.status === 'create' && this.setCursor('crosshair')
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
