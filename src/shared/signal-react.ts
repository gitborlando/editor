import { DependencyList, useEffect, useRef, useState } from 'react'
import { Signal, createSignal } from './signal'
import { INoopFunc } from './utils/normal'

export function useSignal<T extends any>(init?: T): Signal<T> {
  const signal = useRef(createSignal(init))
  return signal.current
}

export function useAutoSignal<T extends any>(init?: T): Signal<T> {
  const signal = useRef(createSignal(init))
  useHookSignal(signal.current)
  return signal.current
}

export function useHookSignal<T>(
  signal: Signal<T>,
  callback?: (arg: T, forceUpdate: INoopFunc) => any,
  deps: DependencyList = []
) {
  const [_, setState] = useState({})
  const forceUpdate = () => setState({})
  useEffect(() => {
    return signal.hook((value) => {
      callback ? callback(value, forceUpdate) : forceUpdate()
    })
  }, deps)
}
