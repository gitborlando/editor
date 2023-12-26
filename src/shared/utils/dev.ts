export function timeRecord() {
  let all = 0
  let start = performance.now()
  return {
    every: (text?: any) => {
      const shift = performance.now() - start
      all += shift
      text && console.log(text, shift)
      start = performance.now()
      return shift
    },
    all: (text?: any) => {
      const shift = performance.now() - start
      all += shift
      console.log(text, all)
    },
  }
}

export function Log<T>(someThing: T, label: string = '') {
  console.log(label, someThing)
  return someThing
}

let count = 0
export function once(fn: () => void, _count = 1) {
  if (count >= _count) return
  fn()
  count++
}
export function onceLog(...args: any[]) {
  once(() => console.log(...args), 1)
}
