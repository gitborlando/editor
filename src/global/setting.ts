import autobind from 'class-autobind-decorator'
import { toJS } from 'mobx'
import { createCache } from '~/shared/cache'
import { createSignal } from '~/shared/signal/signal'
import { iife } from '~/shared/utils/normal'

type ISetting = {
  type: 'normal' | 'map' | 'set'
  value: any
}

@autobind
class SettingService {
  inited = createSignal(false)
  private settings = createCache<string, ISetting>()
  private key = 'setting'
  init() {
    this.load()
    this.inited.dispatch()
  }
  set<T>(key: string, value: T) {
    const setting = iife(() => {
      if (value instanceof Set) return <ISetting>{ type: 'set', value: [...value] }
      if (value instanceof Map) return <ISetting>{ type: 'map', value: toJS(value) }
      return <ISetting>{ type: 'normal', value: value }
    })
    this.settings.set(key, setting)
    this.store()
  }
  get<T>(key: string) {
    const setting = this.settings.get(key)
    if (!setting) return
    if (setting.type === 'set') return new Set(setting.value) as T
    if (setting.type === 'map') return new Map(Object.entries(setting.value)) as T
    return setting.value as T
  }
  private store() {
    localStorage.setItem(this.key, JSON.stringify(this.settings.toObject()))
  }
  private load() {
    const settingStr = localStorage.getItem(this.key)
    if (settingStr === null) return
    this.settings.fromObject(JSON.parse(settingStr))
  }
}

export const Setting = new SettingService()

export function createSetting<T>(key: string, init: T) {
  const signal = createSignal<T>(init)
  signal.hook((newValue) => Setting.set(key, newValue))
  const setting = Setting.get<T>(key)
  if (setting !== undefined) {
    signal.value = setting
  } else {
    Setting.set(key, init)
  }
  return signal
}
