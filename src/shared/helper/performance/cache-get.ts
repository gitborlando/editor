import { timeFor } from '~/shared/utils/normal'

const str = 'sdhvuishdvuidhvidf'

const map = { [str]: str + 'abc' }

timeFor(10000, () => {
  str + 'abc'
})

timeFor(10000, () => {
  map[str]
})
