import { observable, observe, runInAction } from 'mobx'

const a = observable({ a: 1, b: 2 })
const a2 = observable({ a: 1, b: 2 })

observe(a, (ctx) => {
  if (ctx.type !== 'update') return ctx
  console.log(ctx.newValue, ctx.oldValue)
  return ctx
})

runInAction(() => {
  a.a = 123
  a.b = 1234
})

console.log('1 --', a.a, a.b)
