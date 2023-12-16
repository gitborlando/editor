import { Cull } from '@pixi-essentials/cull'
import { makeObservable, observable } from 'mobx'
import * as PIXI from 'pixi.js'
import { inject, injectable } from 'tsyringe'
import { autobind } from '~/shared/decorator'
import { createHooker } from '~/shared/hooker'

export * as PIXI from 'pixi.js'

@autobind
@injectable()
export class PixiService {
  @observable initialized = false
  container!: HTMLDivElement
  app!: PIXI.Application
  isForbidEvent = false
  duringTicker = createHooker()
  constructor() {
    makeObservable(this)
  }
  get stage() {
    return this.app.stage
  }
  setContainer(container: HTMLDivElement) {
    this.container = container
    this.initPixiApp(container)
    this.cull()
    this.app.ticker.add(this.duringTicker.dispatch)
    this.initialized = true
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
  private initPixiApp(container: HTMLDivElement) {
    this.app = new PIXI.Application({
      backgroundColor: '#EBECED',
      resizeTo: container,
      antialias: true,
      resolution: window.devicePixelRatio,
      eventMode: 'passive',
      eventFeatures: {
        move: true,
        globalMove: false,
        click: true,
        wheel: true,
      },
    })
    container.appendChild(this.app.view as any)
    this.stage.sortableChildren = true
  }
  private cull() {
    const cull = new Cull({ recursive: true, toggle: 'renderable' })
    cull.add(this.app.stage)
    this.app.renderer.on('prerender', () => {
      cull.cull(this.app.renderer.screen)
    })
  }
}

export const injectPixi = inject(PixiService)
