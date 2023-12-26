import { IAutorunOptions, IReactionPublic, autorun, reaction, runInAction } from 'mobx'
import { useEffect } from 'react'
import { editorServices } from '~/ioc'
import { INoopFunc, stringPathProxy } from './normal'

export function watchNext(stringPath: string) {
  return {
    hook: (callback: INoopFunc) => {
      reaction(() => stringPathProxy(editorServices)[stringPath], callback, {
        fireImmediately: false,
      })
    },
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
