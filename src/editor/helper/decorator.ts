import autoBindMethods from 'class-autobind-decorator'
import { reaction, runInAction, when } from 'mobx'

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

export function When(chain: string) {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = function (...args: any[]) {
      when(() => new Function('$this', `with($this){return ${chain}}`)(this)).then(() =>
        originalMethod.apply(this, args)
      )
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
