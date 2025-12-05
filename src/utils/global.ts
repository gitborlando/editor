export function T<T extends any>(target: any): T {
  return target as T
}

export function ProdLog(...args: any[]) {
  if (import.meta.env.PROD) console.log(...args)
}
