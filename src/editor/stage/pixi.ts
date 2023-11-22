import * as PIXI from 'pixi.js'
import { autoBind } from '~/helper/decorator'
import { EE } from '~/helper/event-emitter'

export * as PIXI from 'pixi.js'

@autoBind
export class PixiService {
  private _container: HTMLDivElement | null = null
  private _app: PIXI.Application | null = null
  get container() {
    return this._container!
  }
  get app() {
    return this._app!
  }
  get stage() {
    return this.app.stage
  }
  setContainer(container: HTMLDivElement) {
    this._container = container
    this.initPixiApp(container)
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
    this._app = new PIXI.Application({
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
