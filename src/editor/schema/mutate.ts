import { SchemaDiff } from './diff'
import { ISchemaItem } from './type'

export const MutateSchemaItem = {
  get<T>(item: ISchemaItem, keyPath: string | (string | number)[]): T {
    const keys = Array.isArray(keyPath) ? keyPath : (keyPath.split(/\.|\//) as (string | number)[])

    let current: any = item
    for (const key of keys) {
      if (!current) console.log('SchemaPatchError at get function')
      current = current[key]
    }

    return current as T
  },
  add<T>(item: ISchemaItem, keyPath: string | (string | number)[], value: T): void {
    const keys = Array.isArray(keyPath) ? keyPath : (keyPath.split(/\.|\//) as (string | number)[])

    let current: any = item
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current) console.log('SchemaPatchError at add function')
      current = current[key]
    }

    if (!current) console.log('SchemaPatchError at add function')
    const lastKey = keys[keys.length - 1]
    current[lastKey] = value

    SchemaDiff.atomAddDiff(`${item.id}/${keys.join('/')}`, value)
  },
  reset<T>(item: ISchemaItem, keyPath: string | (string | number)[], value: T): void {
    const keys = Array.isArray(keyPath) ? keyPath : (keyPath.split(/\.|\//) as (string | number)[])

    let current: any = item
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current) console.log('SchemaPatchError at replace function')
      current = current[key]
    }

    if (!current) console.log('SchemaPatchError at replace function')
    const lastKey = keys[keys.length - 1]
    const oldValue = current[lastKey]
    current[lastKey] = value

    SchemaDiff.atomReplaceDiff(`${item.id}/${keys.join('/')}`, value, oldValue)
  },
  delete(item: ISchemaItem, keyPath: string | (string | number)[]): void {
    const keys = Array.isArray(keyPath) ? keyPath : (keyPath.split(/\.|\//) as (string | number)[])

    let current: any = item
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!current) console.log('SchemaPatchError at remove function')
      current = current[key]
    }

    if (!current) console.log('SchemaPatchError at remove function')
    const lastKey = keys[keys.length - 1]
    const oldValue = current[lastKey]
    if (Array.isArray(current)) current.splice(<any>lastKey, 1)
    else delete current[lastKey]

    SchemaDiff.atomRemoveDiff(`${item.id}/${keys.join('/')}`, oldValue)
  },
}
