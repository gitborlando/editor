import { v4 } from 'uuid'
import { macro_StringMatch } from '~/shared/macro/string-match'
import { GlobalThis, timeRecord } from '~/shared/utils'
GlobalThis.ids = <string[]>[]

if (!GlobalThis.ids.length) {
  for (let i = 0; i < 50000; i++) {
    GlobalThis.ids.push(v4())
  }
}

const set = new Set(['transform', 'marquee'])
const tt = macro_StringMatch`id === transform | marquee`

const log = timeRecord()
;(<string[]>GlobalThis.ids).forEach((id) => {
  // if (['transform', 'marquee'].some((i) => i === id)) {
  // } // 6 ` 7
  // if (set.has(id)) {
  // } // 11 ~ 13
  // if (id.match(/transform|marquee/)) {
  // } // 17 ~ 18
  // if (id === 'transform' || id === 'marquee') {
  // } // 1.1 ~ 1.2
  // if (tt(id)) {
  // } // 1.2 ~ 1.7
})
// log('t')
