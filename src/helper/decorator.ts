import autoBindMethods from 'class-autobind-decorator'
import { autorun } from 'mobx'
import { delay, inject } from 'tsyringe'

export const autobind = autoBindMethods

export function auto(target: any, name: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  descriptor.value = function (...args: any[]) {
    autorun(() => originalMethod.apply(this, args))
  }
  return descriptor
}

export function delayInject(service: any) {
  return inject(delay(() => service))
}