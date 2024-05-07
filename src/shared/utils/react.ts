import { ReactNode, Suspense, createElement, useTransition } from 'react'

export function transition<T extends any[]>(func: (...args: T) => any) {
  const [_, startTransition] = useTransition()
  return (...args: T) => startTransition(() => func(...args))
}

export function withSuspense(node: ReactNode) {
  return createElement(Suspense, {}, node)
}
