import { IReactionOptions, IReactionPublic, reaction, runInAction } from 'mobx'

export type IXY = { x: number; y: number }
export type IBound = IXY & { width: number; height: number }
export type ICursor = 'auto' | 'n-resize' | 'e-resize' | 'grab' | (string & {})

export function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`
}

export function Delete<T>(object: Record<string, T>, key: string): void
export function Delete<T>(target: T[], find: string | ((value: T) => void)): void
export function Delete<T>(target: Record<string, T> | T[], filter: string | ((value: T) => void)) {
  if (Array.isArray(target)) {
    const index =
      typeof filter === 'function'
        ? target.findIndex(filter)
        : target.findIndex((i) => i === filter)
    index >= 0 && target.splice(index, 1)
  } else {
    delete target[filter as string]
  }
}

export function hierarchyUp<T>(target: T[], filter: string | ((value: T) => void)) {
  const index =
    typeof filter === 'function' ? target.findIndex(filter) : target.findIndex((i) => i === filter)
  if (index <= 0) return
  ;[target[index - 1], target[index]] = [target[index], target[index - 1]]
}
export function hierarchyDown<T>(target: T[], filter: string | ((value: T) => void)) {
  const index =
    typeof filter === 'function' ? target.findIndex(filter) : target.findIndex((i) => i === filter)
  if (index >= target.length - 1) return
  ;[target[index], target[index + 1]] = [target[index + 1], target[index]]
}

export function makeAction<T extends any>(callback?: (...args: T[]) => void) {
  return (...args: T[]) => {
    runInAction(() => callback?.(...args))
  }
}

export function pipe<T>(raw: T) {
  return {
    to: (...funcs: ((arg: T) => T)[]) => {
      return funcs.reduce((res, func) => (res = func(res)), raw)
    },
  }
}

export function cullNegatives<T>(..._values: (T | undefined | null | false)[]) {
  const values: T[] = []
  _values.forEach((i) => {
    if (i !== undefined && i !== false && i !== null && !Number.isNaN(i)) values.push(i)
  })
  return values
}

export function watch(expression: (r: IReactionPublic) => any) {
  return {
    then: (
      effect: (arg: any, prev: any, r: IReactionPublic) => void,
      opts?: IReactionOptions<any, boolean> | undefined
    ) => {
      reaction(expression, effect, { fireImmediately: true, ...opts })
    },
  }
}
