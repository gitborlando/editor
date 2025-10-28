import { flushFuncs, NoopFunc } from '@gitborlando/utils'

export function collectDisposer(...disposers: NoopFunc[]) {
  return () => flushFuncs(disposers)
}
