import { makeObservable, observable } from 'mobx'
import * as PIXI from 'pixi.js'
import { inject, injectable } from 'tsyringe'
import { autobind } from '~/helper/decorator'
import { EE } from '~/helper/event-emitter'

export * as PIXI from 'pixi.js'

@autobind
@injectable()
export class PixiService {
  @observable initialized = false
  container!: HTMLDivElement
  app!: PIXI.Application
  constructor() {
    makeObservable(this)
  }
  get stage() {
    return this.app.stage
  }
  setContainer(container: HTMLDivElement) {
    this.container = container
    this.initPixiApp(container)
    this.initialized = true
    EE.emit('pixi-stage-initialized')
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
  }
}

export const injectPixi = inject(PixiService)
