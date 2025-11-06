type ID = string

type NestPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<NestPartial<U>>
    : T[P] extends object
      ? NestPartial<T[P]>
      : T[P]
}
