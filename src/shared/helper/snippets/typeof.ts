function timeFor(count: number, func: any, name?: string) {
  console.time(name || `${count}`)
  for (let i = 0; i < count; i++) func()
  console.timeEnd(name || `${count}`)
}

timeFor(
  100000,
  () => {
    typeof {} === 'object'
  },
  '100000-typeof',
)
