export type ILoopArrayCallbackData<T> = {
  cur: T
  last: T
  next: T
  index: number
  array: T[]
  at: {
    first: boolean
    end: boolean
    middle: boolean
  }
}

export class LoopArray<T> {
  constructor(public array: T[]) {}
  forEach(callback: (data: ILoopArrayCallbackData<T>) => void) {
    for (let index = 0; index < this.array.length; index++) {
      const current = this.array[index]
      const left = index === 0 ? this.array.length - 1 : index - 1
      const right = index === this.array.length - 1 ? 0 : index + 1
      callback({
        cur: current,
        last: this.array[left],
        next: this.array[right],
        index,
        array: this.array,
        at: this.getPosition(index),
      })
    }
    return this
  }
  reduce<I>(callback: (data: ILoopArrayCallbackData<T> & { init: I }) => I, init: I) {
    this.array.forEach((current, index) => {
      const left = index === 0 ? this.array.length - 1 : index - 1
      const right = index === this.array.length - 1 ? 0 : index + 1
      init = callback({
        cur: current,
        last: this.array[left],
        next: this.array[right],
        index,
        init,
        array: this.array,
        at: this.getPosition(index),
      })
    })
    return init
  }
  toRaw() {
    return this.array
  }
  private getPosition(index: number) {
    const first = index === 0
    const end = index === this.array.length - 1
    const middle = !first && !end
    return { first, end, middle }
  }
  static From<T>(array: T[]) {
    return new LoopArray<T>(array)
  }
}
