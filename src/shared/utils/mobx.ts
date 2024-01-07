import { IAutorunOptions, IReactionPublic, autorun, reaction, runInAction } from 'mobx'
import { useEffect } from 'react'
import { editorServices } from '~/ioc'
import { INoopFunc, stringPathProxy } from './normal'

export function watchNext(target: () => any) {
  return {
    hook: (callback: INoopFunc) => reaction(target, callback, { fireImmediately: false }),
  }
}

export function makeAction<T extends any>(callback?: (...args: T[]) => void) {
  return (...args: T[]) => {
    runInAction(() => callback?.(...args))
  }
}

export function useAutoRun(view: (r: IReactionPublic) => any, opts?: IAutorunOptions) {
  useEffect(() => {
    const disposer = autorun(view, opts)
    return () => disposer()
  }, [])
}

export function useWatchNext(
  stringPath: string,
  callback: INoopFunc,
  option?: { fireImmediately: boolean }
): void
export function useWatchNext(
  stateFunc: () => any,
  callback: INoopFunc,
  option?: { fireImmediately: boolean }
): void
export function useWatchNext(
  target: string | (() => any),
  callback: INoopFunc,
  option?: { fireImmediately: boolean }
) {
  useEffect(() => {
    target =
      typeof target === 'string' ? () => stringPathProxy(editorServices)[<string>target] : target
    const disposer = reaction(target, callback, {
      fireImmediately: option?.fireImmediately || false,
    })
    return () => disposer()
  }, [])
}
