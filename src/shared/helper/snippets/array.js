const s = performance.now()
let array = new Array(10000).fill('').map((_, i) => i)
for (let i = 0; i < 1; i++) {
  const j = array.findIndex((k) => k === i)
  //array.splice(j, 1)
  array = array.filter((j) => j !== i)
}
console.log(performance.now() - s)
