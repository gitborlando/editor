import { objEntries } from '../utils/normal'

class NewOldRecord<T> {
  current: T
  last: T
  constructor(_new: T, _old: T) {
    this.current = _new
    this.last = _old
  }
  get shift() {
    return <number>this.current - <number>this.last
  }
}

type IMomentChange<T extends Record<string, any>, K extends keyof T = keyof T> = Record<
  K,
  NewOldRecord<T[K]>
>

class MomentChange<T extends Record<string, any>, K extends keyof T = keyof T> {
  record = <IMomentChange<T>>{}
  changedKeys = new Set<K>()
  constructor(initData: T) {
    this.reset(initData)
  }
  reset(initData: T) {
    objEntries(initData, (key, val) => {
      this.record[key] = new NewOldRecord<T[K]>(<T[K]>val, <T[K]>val)
    })
  }
  update<V extends T[K] = T[K]>(key: K, newValue: V) {
    this.record[key].current = newValue
    this.changedKeys.add(key)
  }
  endCurrent() {
    Object.values(this.record).forEach((change) => (change.last = change.current))
    this.changedKeys.clear()
  }
}

export function createMomentChange<T extends Record<string, any>>(initData: T) {
  return new MomentChange<T>(initData)
}
