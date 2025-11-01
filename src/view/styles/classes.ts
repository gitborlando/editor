import { LinariaClassName } from '@linaria/core'

export function classes(linaria: LinariaClassName) {
  return (...classes: string[]) => {
    return classes.length ? cx(...classes.map((c) => `${linaria}-${c}`)) : linaria
  }
}
