import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal'
import { hslBlueColor } from '~/shared/utils/color'
import { macro_StringMatch } from '~/shared/utils/macro'

type ISettingKey = keyof Omit<SettingService, 'key' | 'inited' | 'init'>

@autobind
export class SettingService {
  private key = 'setting'
  inited = createSignal(false)
  color = createSignal(hslBlueColor(65))
  switchBarPosition = createSignal(<'left' | 'top'>'top')
  init() {
    this.load()
    this.autoStore()
    this.inited.dispatch()
  }
  private autoStore() {
    this.getSettingKeys().forEach((settingKey) => {
      this[settingKey].hook(this.store)
    })
  }
  private load() {
    const settingStr = localStorage.getItem(this.key)
    if (settingStr === null) return
    const setting = JSON.parse(settingStr)
    Object.entries(setting).forEach(([key, value]) => {
      this[key as ISettingKey].value = value as any
    })
  }
  private store() {
    const setting = Object.fromEntries(this.getSettingKeys().map((key) => [key, this[key].value]))
    localStorage.setItem(this.key, JSON.stringify(setting))
  }
  private getSettingKeys() {
    return Object.keys(this)
      .filter((key) => !macro_StringMatch`key|inited`(key))
      .map((key) => key as ISettingKey)
  }
}

export const Setting = new SettingService()
