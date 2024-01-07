import { inject, injectable } from 'tsyringe'
import { iocEditorHooker } from '~/ioc'
import { autobind } from '~/shared/decorator'
import { macro_StringMatch } from '~/shared/macro'
import { Signal, createSignal } from '~/shared/signal'
import { hslBlueColor } from '~/shared/utils/color'

export type ISetting = {
  color: string
}

@autobind
@injectable()
export class SettingService {
  key = 'setting'
  inited = createSignal(false)
  color = createSignal(hslBlueColor(65))
  switchBarPosition = createSignal(<'left' | 'top'>'top')
  constructor() {
    iocEditorHooker.hook(this.init)
  }
  init() {
    this.load()
    this.autoStore()
    this.inited.dispatch()
  }
  private autoStore() {
    this.color.hook(this.storeSetting)
    this.switchBarPosition.hook(this.storeSetting)
  }
  private load() {
    const settingStr = localStorage.getItem(this.key)
    if (settingStr === null) return
    const setting = JSON.parse(settingStr)
    Object.entries(setting).forEach(([key, value]) => {
      ;(this[key as keyof Omit<this, 'key' | 'inited'>] as Signal<any>).value = value
    })
  }
  private storeSetting() {
    const setting = Object.fromEntries(
      Object.entries(this)
        .filter(([key]) => !macro_StringMatch`key|inited`(key))
        .map(([key, signal]) => [key, (<Signal<any>>signal).value])
    )
    localStorage.setItem(this.key, JSON.stringify(setting))
  }
}

export const injectSetting = inject(SettingService)
