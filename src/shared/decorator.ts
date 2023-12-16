import autoBindMethods from 'class-autobind-decorator'
import { reaction, runInAction, when } from 'mobx'
import { stringPathProxy, withNewFunction } from './utils'

export const autobind = autoBindMethods

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

export function Hook(chain: string, index?: number) {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
      stringPathProxy(this)[chain].hook(originalMethod.bind(this), index)
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

export function Before_After(before: string, after: string) {
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

export function Before_After_Toggle(toggle: string) {
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
