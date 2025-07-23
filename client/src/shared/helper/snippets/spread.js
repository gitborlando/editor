const a = {}
for (let i = 0; i < 15; i++) {
  a['a' + i] = i
}

function t(a, g) {
  const b = {}
  b.a = a.a
  b.b = a.b
  b.c = a.c
  b.d = a.d
  b.e = a.e
  b.f = a.f
  b.g = g
  return b
}

// const s = performance.now()
// for (let i = 0; i < 20 * 10000; i++) {
//   // const b = t(a, 8)
//   // const b = {}
//   // b['a0'] = 1
//   // b['a1'] = 1
//   // b['a2'] = 2
//   // b['a3'] = 3
//   // b['a4'] = 4
//   // b['a5'] = 5
//   // b['a6'] = 6
//   // b['a7'] = 7
//   // b['a8'] = 8
//   // b['a9'] = 9
//   // b['a10'] = 10
//   // b['a11'] = 11
//   // b['a12'] = 12
//   // b['a13'] = 13 // 2.3s
//   // const b = { ...a, a0: 1 } // 4.4s
// }
// console.log('t ', performance.now() - s)

// const c = { x: 1, y: 2 }
// const d = { x: 1, y: 2 }

// function plus(c, d) {
//   c.x = c.x + d.x
//   c.y = c.y + d.y
// }

// const s = performance.now()
// for (let i = 0; i < 20 * 10000; i++) {
//   // c.x = c.x + d.x
//   // c.y = c.y + d.y // 0/6s - 0.9s
//   plus(c, d) // 1.4-1.5s
// }
// console.log('t ', performance.now() - s)
