import { useEffect, useRef, useState } from 'react'
import { INoopFunc } from '../utils/normal'
import { IHookOption, Signal, createSignal } from './signal'

export function useSignal<T extends any>(init?: T): Signal<T> {
  const signal = useRef(createSignal(init))
  return signal.current
}

export function useAutoSignal<T extends any>(init?: T, id?: string): Signal<T> {
  const signal = useRef(createSignal(init))
  useHookSignal(signal.current)
  return signal.current
}

type ICallback<T> = (value: T, forceUpdate: INoopFunc) => any
export function useHookSignal<T>(signal: Signal<T>): T
export function useHookSignal<T>(signal: Signal<T>, option: IHookOption): T
export function useHookSignal<T>(signal: Signal<T>, callback: ICallback<T>): T
export function useHookSignal<T>(signal: Signal<T>, option: IHookOption, callback: ICallback<T>): T
export function useHookSignal<T>(
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

  return signal.value
}
