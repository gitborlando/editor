export class Disposer {
  private disposeList: (() => void)[] = []

  push(dispose: () => void) {
    this.disposeList.push(dispose)
  }

  delete(index: number) {
    this.disposeList.splice(index, 1)
  }

  dispose() {
    this.disposeList.forEach((dispose) => dispose())
  }
}

export function createDisposer() {
  return new Disposer()
}
