import { useEffect, useRef, useState } from 'react'
import { IHookOption, Signal, createSignal } from './signal'
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
  option: IHookOption = {}
) {
  const [_, setState] = useState({})
  const forceUpdate = () => setState({})
  useEffect(() => {
    return signal.hook(option, (value) => {
      callback ? callback(value, forceUpdate) : forceUpdate()
    })
  }, [])
}

type ICallback<T> = (value: T, forceUpdate: INoopFunc) => any
export function useHookSignal2<T>(signal: Signal<T>): void
export function useHookSignal2<T>(signal: Signal<T>, option?: IHookOption): void
export function useHookSignal2<T>(signal: Signal<T>, callback: ICallback<T>): void
export function useHookSignal2<T>(
  signal: Signal<T>,
  option: IHookOption,
  callback: ICallback<T>
): void
export function useHookSignal2<T>(
  signal: Signal<T>,
  option?: IHookOption | ICallback<T>,
  callback?: ICallback<T>
) {
  const [_, setState] = useState({})
  const forceUpdate = () => setState({})
  useEffect(() => {
    if (callback) {
      return signal.hook(option as IHookOption, (value) => {
        callback(value, forceUpdate)
      })
    }
    if (typeof option === 'function') {
      return signal.hook({}, (value) => {
        option(value, forceUpdate)
      })
    }
    return signal.hook(option || {}, forceUpdate)
  }, [])
}
