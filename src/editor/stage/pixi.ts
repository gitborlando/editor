import { Cull } from '@pixi-essentials/cull'
import autobind from 'class-autobind-decorator'
import * as PIXI from 'pixi.js'
import { createSignal } from '~/shared/signal'
import Asset from '~/view/ui-utility/assets'

export * as PIXI from 'pixi.js'

@autobind
export class PixiService {
  inited = createSignal(false)
  htmlContainer!: HTMLDivElement
  app!: PIXI.Application
  sceneStage = new PIXI.Container()
  isForbidEvent = false
  duringTicker = createSignal()
  setContainer(div: HTMLDivElement) {
    this.htmlContainer = div
    this.initPixiApp()
    this.cull()
    this.app.ticker.add(this.duringTicker.dispatch)
    PIXI.Assets.addBundle('fonts', [
      { alias: 'textFoscscscnt1', src: Asset.editor.font.华光钢铁直黑中黑 },
    ])
    // Load the font bundle
    PIXI.Assets.loadBundle('fonts').then(() => {
      this.inited.dispatch(true)
    })
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
  private initPixiApp() {
    this.app = new PIXI.Application({
      backgroundColor: '#F5F5F5' /* '#F7F8FA' */ /* '#F1F2F6' */,
      resizeTo: this.htmlContainer,
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
    this.htmlContainer.appendChild(this.app.view as any)
    this.sceneStage.setParent(this.app.stage)
    this.app.stage.sortableChildren = true
    this.sceneStage.sortableChildren = true
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
