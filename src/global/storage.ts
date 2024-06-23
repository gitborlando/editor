import autobind from 'class-autobind-decorator'
import { createSignal } from 'src/shared/signal/signal'
import { iife, jsonFy, jsonParse } from 'src/shared/utils/normal'

type IStorageItem = {
  type: 'normal' | 'map' | 'set'
  value: any
}

@autobind
class StorageService {
  inited = createSignal(false)

  set<T>(key: string, value: T) {
    const item = iife(() => {
      if (value instanceof Set) return <IStorageItem>{ type: 'set', value: [...value] }
      if (value instanceof Map) return <IStorageItem>{ type: 'map', value: value }
      return <IStorageItem>{ type: 'normal', value: value }
    })
    this.storage(key, item)
  }

  get<T>(key: string) {
    const item = this.storage(key)
    if (!item) return
    if (item.type === 'set') return new Set(item.value) as T
    if (item.type === 'map') return new Map(Object.entries(item.value)) as T
    return item.value as T
  }

  private storage(key: string, value?: any) {
    if (value == undefined) return jsonParse(localStorage.getItem(key)) as unknown as IStorageItem
    localStorage.setItem(key, jsonFy(value)!)
  }
}

export const Storage = new StorageService()

export function createStorageItem<T>(key: string, init: T) {
  const signal = createSignal<T>(init)
  const setting = Storage.get<T>(key)

  if (setting !== undefined) {
    signal.value = setting
  } else {
    Storage.set(key, init)
  }

  signal.hook((newValue) => Storage.set(key, newValue))

  return signal
}
