import CanvasKitInit, { Canvas, CanvasKit, Surface } from 'canvaskit-wasm'
import CanvasKitWasmUrl from 'canvaskit-wasm/bin/canvaskit.wasm?url'
import { makeObservable, observable } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { autobind } from '~/shared/decorator'
import { LoopService, injectLoop } from '../loop'

@autobind
@injectable()
export class CKService {
  @observable initialized = false
  htmlCanvas!: HTMLCanvasElement
  surface!: Surface
  canvas!: Canvas
  canvasKit!: CanvasKit
  needFlush = false
  constructor(@injectLoop private Loop: LoopService) {
    makeObservable(this)
  }
  setRef(canvas: HTMLCanvasElement) {
    this.htmlCanvas = canvas
    this.initialize()
  }
  async initialize() {
    this.canvasKit = await CanvasKitInit({ locateFile: () => CanvasKitWasmUrl })
    this.surface = this.canvasKit.MakeWebGLCanvasSurface(this.htmlCanvas)!
    this.canvas = this.surface.getCanvas()
    this.Loop.thirdStage.hook(() => {
      // if (!this.needFlush) return
      setTimeout(() => {
        this.canvas.scale(0.05, 0.05)
      }, 2000)
      this.surface.flush()
      this.needFlush = false
    })
    // this.canvas.scale(1, 1)
    this.initialized = true
  }
}

export const injectCK = inject(CKService)
