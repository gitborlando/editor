import { autobind } from '../decorator'
import { Hooker, hookerMap } from './hooker'

@autobind
export class ValueHooker<T = any> extends Hooker<[T]> {
  constructor(public value: T) {
    super()
  }
  dispatch(value: T) {
    this.value = value
    hookerMap.get(this)?.forEach((hook) => hook?.([value]))
  }
}

export function createValueHooker<T = any>(value: T) {
  return new ValueHooker<T>(value)
}
