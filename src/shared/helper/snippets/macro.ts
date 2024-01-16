import { nanoid } from 'nanoid'
import { timeRecord } from '~/shared/utils/dev'
import { macro_StringMatch } from '~/shared/utils/macro'
import { This } from '~/shared/utils/normal'
This.ids = <string[]>[]

if (!This.ids.length) {
  for (let i = 0; i < 50000; i++) {
    This.ids.push(nanoid())
  }
}

const set = new Set(['transform', 'marquee'])
const tt = macro_StringMatch`id === transform | marquee`

const log = timeRecord()
;(<string[]>This.ids).forEach((id) => {
  // if (['transform', 'marquee'].some((i) => i === id)) {
  // } // 6 ~ 7
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
