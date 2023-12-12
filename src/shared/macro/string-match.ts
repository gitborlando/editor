import { MultiCache } from '~/shared/multi-cache'

const cache = MultiCache.GetOrNew('macro-string-match')

export function macroStringMatch(_input: TemplateStringsArray) {
  const input = _input[0]
  const test = cache.getSet(input, () => {
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

// const right = <string[]>[]
// let str = ''
// for (let _i = 0; _i < input.length; _i++) {
//   const i = input[_i]
//   if (i === ' ') continue
//   if (i === '=' && input[_i + 1] === '=' && input[_i + 2] === '=') {
//     _i += 2
//     str = ''
//     continue
//   }
//   if (i === '|') {
//     right.push(str)
//     str = ''
//     continue
//   }
//   if (_i === input.length - 1) {
//     right.push(str + i)
//   }
//   str += i
// }
