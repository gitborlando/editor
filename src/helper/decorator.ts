import autoBindMethods from 'class-autobind-decorator'
import { autorun } from 'mobx'

export const autoBind = autoBindMethods

export function auto(target: any, name: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  descriptor.value = function (...args: any[]) {
    autorun(() => originalMethod.apply(this, args))
  }
  return descriptor
}
