function withNewFunction(body) {
  return new Function('target', `with(target){${body}}`)
}

function ObjectGetSet(obj, keys, value) {
  let key
  let l = keys.length
  for (let i = 0; i < l; i++) {
    key = keys[i]
    if (value !== undefined && i === keys.length - 1) {
      obj[key] = value
    }
    obj = obj[key]
  }

  return obj
}

const obj = { a: { b: [1, 2, 3] } }
const f = new Function('obj', `return obj['a']['b'][0]`)

let s = performance.now()
for (let i = 0; i < 100000; i++) {
  ObjectGetSet(obj, ['a'])
}
console.log(performance.now() - s + 'ms')

// s = performance.now()
// for (let i = 0; i < 100000; i++) {
//   new Function('obj', `return obj['a']['b'][${i}]`)(obj)
// }
// console.log(performance.now() - s + 'ms')

s = performance.now()
for (let i = 0; i < 100000; i++) {
  obj['a']
}

console.log(performance.now() - s + 'ms')
