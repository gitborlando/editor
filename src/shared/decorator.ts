import autoBindMethods from 'class-autobind-decorator'
import { reaction, runInAction, when } from 'mobx'
import { stringPathProxy, withNewFunction } from './utils/normal'

export const autobind = autoBindMethods

// const rawCache = createCache<Function>()
// const key = (target: any, name: string) => `${target.constructor.name}.${name}`

// export function SaveRaw(target: any, name: string, descriptor: PropertyDescriptor) {
//   rawCache.set(key(target, name), descriptor.value)
//   return descriptor
// }

export function Watch(...chains: string[]) {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
      reaction(
        () => new Function('$this', `with($this){return [${chains}].map(()=>{})}`)(this),
        () => originalMethod.apply(this, args),
        { fireImmediately: true }
      )
    }
    return descriptor
  }
}

export function WatchNext(...chains: string[]) {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
      chains.forEach((chain) => {
        if (chain.endsWith('?hook')) {
          stringPathProxy(this)[chain.slice(0, -5)].hook(originalMethod.bind(this))
        } else {
          reaction(
            () => stringPathProxy(this)[chain],
            () => originalMethod.apply(this, args),
            { fireImmediately: false }
          )
        }
      })
    }
    return descriptor
  }
}

export function Hook(...chains: string[]) {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
      chains.forEach((chain) => {
        stringPathProxy(this)[chain].hook(originalMethod.bind(this, args))
      })
    }
    return descriptor
  }
}

export function When(chain: string) {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
      when(() => stringPathProxy(this)[chain]).then(() => originalMethod.apply(this, args))
    }
    return descriptor
  }
}

export function Wrap(before: string, after: string) {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
      withNewFunction(before)(this)
      originalMethod.apply(this, args)
      withNewFunction(after)(this)
    }
    return descriptor
  }
}

export function WrapToggle(toggle: string) {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
      withNewFunction(toggle + ' = true')(this)
      originalMethod.apply(this, args)
      withNewFunction(toggle + ' = false')(this)
    }
    return descriptor
  }
}

export function RunInAction(target: any, name: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  descriptor.value = function (...args: any[]) {
    runInAction(() => originalMethod.apply(this, args))
  }
  return descriptor
}
