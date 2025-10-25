type ID = string

type Patch = {
  type: 'add' | 'remove' | 'replace'
  path: string
  keys: (string | number)[]
  value?: any
  oldValue?: any
}

type NestPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<NestPartial<U>>
    : T[P] extends object
      ? NestPartial<T[P]>
      : T[P]
}
