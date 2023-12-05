import autoBindMethods from 'class-autobind-decorator'
import { runInAction as _runInAction, autorun, reaction } from 'mobx'

export const autobind = autoBindMethods

export function watch(chain: string) {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
      reaction(
        () => new Function('service', `with(service){return ${chain}}`)(this),
        () => originalMethod.apply(this, args),
        { fireImmediately: true }
      )
    }
    return descriptor
  }
}

export function auto(target: any, name: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  descriptor.value = function (...args: any[]) {
    autorun(() => originalMethod.apply(this, args))
  }
  return descriptor
}

export function runInAction(target: any, name: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  descriptor.value = function (...args: any[]) {
    _runInAction(() => originalMethod.apply(this, args))
  }
  return descriptor
}
