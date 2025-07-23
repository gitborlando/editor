const set = new Set(['a', 'b', 'c', 'd', 'e', 'f'])

let s = performance.now()
for (let i = 0; i < 130000; i++) {
  if (set.has('a')) {
  }
}
console.log('time: ', performance.now() - s)

// 大概消耗 0.7s
