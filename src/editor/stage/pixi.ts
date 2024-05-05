import { Cull } from '@pixi-essentials/cull'
import autobind from 'class-autobind-decorator'
import * as PIXI from 'pixi.js'
import { createSignal, mergeSignal } from '~/shared/signal/signal'

export * as PIXI from 'pixi.js'

@autobind
class PixiService {
  inited = createSignal(false)
  htmlContainer!: HTMLDivElement
  app!: PIXI.Application
  sceneStage!: PIXI.Container
  isForbidEvent = false
  duringTicker = createSignal()
  private appReady = createSignal(false)
  private sceneStageReady = createSignal(false)
  initHook() {
    const allReady = mergeSignal(this.appReady, this.sceneStageReady)
    allReady.hook(() => {
      // this.cull()
      this.app.ticker.add(this.duringTicker.dispatch)
      this.inited.dispatch(true)
    })
  }
  setApp(app: PIXI.Application) {
    if (this.app) return
    this.app = app
    app.resizeTo = this.htmlContainer
    this.appReady.dispatch(true)
  }
  setSceneStage(stage: PIXI.Container) {
    if (this.sceneStage) return
    this.sceneStage = stage
    this.sceneStageReady.dispatch(true)
  }
  setHtmlContainer(div: HTMLDivElement) {
    if (this.htmlContainer) return
    this.htmlContainer = div
  }
  addListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions | undefined
  ) {
    this.app.view.addEventListener?.(type, listener, options)
  }
  removeListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions | undefined
  ) {
    this.app.view.removeEventListener?.(type, listener, options)
  }
  private cull() {
    const cull = new Cull({ recursive: true, toggle: 'renderable' })
    cull.add(this.app.stage)
    this.app.renderer.on('prerender', () => {
      cull.cull(this.app.renderer.screen)
    })
  }
}

export const Pixi = new PixiService()
