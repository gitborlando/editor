import { createCache } from '~/shared/cache'

const cache = createCache()

export function macro_StringMatch(_input: TemplateStringsArray) {
  const input = _input[0]
  const test: any = cache.getSet(input, () => {
    const right = input.trimStart().trimEnd().split('|')
    return new Function(
      '$$$__left',
      right.reduce((all, i) => {
        return all + `if($$$__left === '${i}')return true;`
      }, '')
    )
  })

  return (left: string) => test(left)
}

export function macro_Match(_input: TemplateStringsArray) {
  const input = _input[0]
  const test: any = cache.getSet(input, () => {
    const right = input.trimStart().trimEnd().split('|')
    return new Function(
      '$$$__left',
      right.reduce((all, i) => {
        return `if($$$__left === ${i})return true;` + all
      }, 'return false;')
    )
  })

  return (left: any) => test(left)
}
