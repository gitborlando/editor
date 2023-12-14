import { autobind } from '~/shared/decorator'

type IOptimizeCacheName = 'draw-path' | 'OBB' | (string & {})

const optimizeCacheMap = new Map<string, OptimizeCache<any>>()

@autobind
export class OptimizeCache<T> {
  cache = new Map<string, any>()
  constructor(public readonly name: string) {}
  get(id: string) {
    return this.cache.get(id) as T
  }
  set(id: string, value: T) {
    this.cache.set(id, value)
    return value
  }
  delete(id: string) {
    this.cache.delete(id)
  }
  getSet(id: string, fn: () => T) {
    let value = this.cache.get(id)
    if (value) return value as T
    value = fn()
    this.cache.set(id, value)
    return value as T
  }
  depose() {
    this.cache.clear()
  }
  static GetOrNew<T>(cacheName: IOptimizeCacheName): OptimizeCache<T> {
    let cache = optimizeCacheMap.get(cacheName)
    if (cache) return cache
    cache = new OptimizeCache(cacheName)
    optimizeCacheMap.set(cacheName, cache)
    return cache
  }
}
