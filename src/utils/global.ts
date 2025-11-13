export function T<T extends any>(target: any): T {
  return target as T
}
