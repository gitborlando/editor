type ID = string

type Patch = {
  type: 'add' | 'remove' | 'replace'
  path: string
  keys: (string | number)[]
  value?: any
  oldValue?: any
}
