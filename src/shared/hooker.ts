import { autobind } from './decorator'

export const hookerMap = new Map<any, (((...args: any) => void) | undefined)[]>()

@autobind
export class Hooker<T extends any[]> {
  private newArgs: T = [] as unknown as T
  private oldArgs: T = [] as unknown as T
  constructor(args?: T) {
    this.newArgs = args ?? this.newArgs
  }
  get args() {
    return this.newArgs
  }
  hook(hook: (...args: T) => void, index?: number) {
    let hooks = hookerMap.get(this)
    if (!hooks) hookerMap.set(this, (hooks = []))
    index !== undefined ? (hooks[index] = hook) : hooks.push(hook)
  }
  dispatch(...args: T) {
    this.oldArgs = this.newArgs
    this.newArgs = args
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
  hookOnce(hook: (...args: T) => void) {
    const once = (...args: T) => {
      hook(...args)
      this.unHook(once)
    }
    this.hook(once)
  }
}

export function createHooker<T extends any[]>(args?: T) {
  return new Hooker<T>(args)
}
