import { autobind } from '../decorator'

export const hookerMap = new Map<any, (((...args: any) => void) | undefined)[]>()

@autobind
export class Hooker<T extends any[]> {
  constructor() {}
  hook(hook: (...args: T) => void, index?: number) {
    let hooks = hookerMap.get(this)
    if (!hooks) hookerMap.set(this, (hooks = []))
    index !== undefined ? (hooks[index] = hook) : hooks.push(hook)
  }
  dispatch(...args: T) {
    hookerMap.get(this)?.forEach((hook) => hook?.(...args))
  }
  unHook(hook: number | ((...args: T) => void)) {
    let hooks = hookerMap.get(this) || []
    if (typeof hook === 'number') {
      hooks[hook] = undefined
    } else {
      hooks = hooks.filter((i) => i !== hook)
    }
    hookerMap.set(this, hooks)
  }
}

export function createHooker<T extends any[]>() {
  return new Hooker<T>()
}
