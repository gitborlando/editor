import { useTransition } from 'react'

export function transition<T extends any[]>(func: (...args: T) => any) {
  const [_, startTransition] = useTransition()
  return (...args: T) => startTransition(() => func(...args))
}
