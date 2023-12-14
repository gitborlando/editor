import autoBindMethods from 'class-autobind-decorator'
import { reaction, runInAction, when } from 'mobx'

const proxyThis = ($this: any) => {
  function get(_: any, key: any) {
    return new Function('$this', `with($this){return ${<string>key}}`)($this)
  }
  return new Proxy({}, { get })
}

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
          proxyThis(this)[chain.slice(0, -5)].hook(originalMethod.bind(this))
        } else {
          reaction(
            () => proxyThis(this)[chain],
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
      proxyThis(this)[chain].hook(originalMethod.bind(this), index)
    }
    return descriptor
  }
}

export function When(chain: string) {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
      when(() => proxyThis(this)[chain]).then(() => originalMethod.apply(this, args))
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
