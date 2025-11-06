import { flushFuncs, NoopFunc } from '@gitborlando/utils'

export function collectDisposer(...disposers: NoopFunc[]) {
  return () => flushFuncs(disposers)
}

export class Disposer {
  private disposers: NoopFunc[] = []

  add = (disposer: NoopFunc) => {
    this.disposers.push(disposer)
  }

  dispose = () => {
    flushFuncs(this.disposers)
  }

  static collect(...disposers: NoopFunc[]) {
    return () => flushFuncs(disposers)
  }
}
