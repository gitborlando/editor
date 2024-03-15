import autobind from 'class-autobind-decorator'
//@ts-ignore
import Vault from 'vault-storage/vault'

@autobind
export class IDBStore<T> {
  [key: string]: T
  constructor(name: string) {
    const vault = new Vault(name)
    return new Proxy(this, {
      async get(_, key) {
        return await vault.getItem(<string>key)
      },
      set(_, key, value) {
        vault.setItem(<string>key, value)
        return true
      },
      deleteProperty(_, key) {
        vault.removeItem(<string>key)
        return true
      },
    })
  }
}

export function createIDBStore<T>(name: string) {
  return new IDBStore<T>(name)
}
