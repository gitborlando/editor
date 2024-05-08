import { ReactNode, Suspense, createElement, useEffect, useTransition } from 'react'
import { IAnyFunc } from './normal'

export function transition<T extends any[]>(func: (...args: T) => any) {
  const [_, startTransition] = useTransition()
  return (...args: T) => startTransition(() => func(...args))
}

export function withSuspense(node: ReactNode) {
  return createElement(Suspense, {}, node)
}

export function useAnimationFrame(callback: IAnyFunc) {
  useEffect(() => {
    const loop = () => {
      callback()
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }, [])
}
