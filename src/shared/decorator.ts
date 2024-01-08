import autoBindMethods from 'class-autobind-decorator'
import { stringPathProxy, withNewFunction } from './utils/normal'

export const autobind = autoBindMethods

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
