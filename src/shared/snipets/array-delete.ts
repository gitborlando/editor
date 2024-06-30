const arr = ['a', 'b', 'c', 'd']
arr.forEach((item, i) => {
  arr.splice(i, 1)
})

console.log(arr)

// const arr2 = ['a', 'b', 'c', 'd']
// for (let i = 0; i < arr2.length; i++) {
//   arr2.splice(i, 1)
// }

// console.log(arr2)

// const arr3 = ['a', 'b', 'c', 'd']
// while (arr3.length) {
//   arr3.splice(arr3.indexOf(arr3[0]), 1)
// }

// console.log(arr3)

// const arr4 = ['a', 'b', 'c', 'd']
// for (let i = arr4.length - 1; i >= 0; i--) {
//   arr4.splice(i, 1)
// }

// console.log(arr4)
