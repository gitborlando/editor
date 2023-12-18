import { objEntries } from '../utils'

class NewOldRecord<T> {
  new: T
  old: T
  constructor(_new: T, _old: T) {
    this.new = _new
    this.old = _old
  }
  get shift() {
    return <number>this.new - <number>this.old
  }
}

type IMomentChange<T extends Record<string, any>, K extends keyof T = keyof T> = Record<
  K,
  NewOldRecord<T[K]>
>

class MomentChange<T extends Record<string, any>, K extends keyof T = keyof T> {
  record = <IMomentChange<T>>{}
  changedKeys = new Set<K>()
  reset(initData: T) {
    objEntries(initData, (key, val) => {
      this.record[key] = new NewOldRecord<T[K]>(<T[K]>val, <T[K]>val)
    })
  }
  update<V extends T[K] = T[K]>(key: K, newValue: V) {
    this.record[key].new = newValue
    this.changedKeys.add(key)
  }
  endCurrent() {
    Object.values(this.record).forEach((change) => (change.old = change.new))
    this.changedKeys.clear()
  }
}

export function createMomentChange<T extends Record<string, any>>() {
  return new MomentChange<T>()
}
