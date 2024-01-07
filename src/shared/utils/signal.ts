import { DependencyList, useEffect, useRef, useState } from 'react'
import { Signal, createSignal } from '../signal'
import { INoopFunc } from './normal'

export function useSignal<T extends any>(init?: T): Signal<T> {
  const signal = useRef(createSignal(init))
  return signal.current
}

export function useAutoSignal<T extends any>(init?: T): Signal<T> {
  const signal = useRef(createSignal(init))
  useHookSignal(signal.current.hook)
  return signal.current
}

export function useHookSignal(
  callback: Signal<any> | ((forceUpdate: INoopFunc) => any),
  deps: DependencyList = []
) {
  const [_, setState] = useState({})
  const forceUpdate = () => setState({})
  useEffect(() => {
    if (callback instanceof Signal) return callback.hook(forceUpdate)
    return callback(forceUpdate)
  }, deps)
}
