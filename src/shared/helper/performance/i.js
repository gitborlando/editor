const obj = {}

for (let i = 0; i < 100000; i++) {
  obj['a' + i] = 'b' + i
}

const s = new Date().getTime()

// for (let i = 0; i < 100000; i++) {
//   const a = obj['a' + i]
// } 23 ms

// for (let i = 0; i < 100000; i++) {
//   'frame:1sjvhuvhnsuivnuisvn'.startsWith('frame')
// } 2ms

console.log(new Date().getTime() - s + 'ms')
