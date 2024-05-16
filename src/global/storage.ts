import autobind from 'class-autobind-decorator'
import { toJS } from 'mobx'
import { createSignal } from '~/shared/signal/signal'
import { createCache } from '~/shared/utils/cache'
import { iife } from '~/shared/utils/normal'

type IStorageItem = {
  type: 'normal' | 'map' | 'set'
  value: any
}

@autobind
class StorageService {
  inited = createSignal(false)
  private storage = createCache<string, IStorageItem>()
  private key = 'storage'
  init() {
    this.load()
    this.inited.dispatch()
  }
  set<T>(key: string, value: T) {
    const item = iife(() => {
      if (value instanceof Set) return <IStorageItem>{ type: 'set', value: [...value] }
      if (value instanceof Map) return <IStorageItem>{ type: 'map', value: toJS(value) }
      return <IStorageItem>{ type: 'normal', value: value }
    })
    this.storage.set(key, item)
    this.store()
  }
  get<T>(key: string) {
    const item = this.storage.get(key)
    if (!item) return
    if (item.type === 'set') return new Set(item.value) as T
    if (item.type === 'map') return new Map(Object.entries(item.value)) as T
    return item.value as T
  }
  private store() {
    localStorage.setItem(this.key, JSON.stringify(this.storage.toObject()))
  }
  private load() {
    const settingStr = localStorage.getItem(this.key)
    if (settingStr === null) return
    this.storage.fromObject(JSON.parse(settingStr))
  }
}

export const Storage = new StorageService()

export function createStorageItem<T>(key: string, init: T) {
  const signal = createSignal<T>(init)
  signal.hook((newValue) => Storage.set(key, newValue))
  const setting = Storage.get<T>(key)
  if (setting !== undefined) {
    signal.value = setting
  } else {
    Storage.set(key, init)
  }
  return signal
}
