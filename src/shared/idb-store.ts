import autobind from 'class-autobind-decorator'
//@ts-ignore
import Vault from 'vault-storage/vault'

@autobind
export class IDBStore<T> {
  vault: any
  constructor(name: string) {
    this.vault = new Vault(name)
  }
  async length() {
    return await this.vault.length()
  }
  async get(key: string): Promise<T> {
    return await this.vault.getItem(key)
  }
  set(key: string, value: T) {
    this.vault.setItem(key, value)
  }
  delete(key: string) {
    this.vault.removeItem(key)
  }
  async getMeta(key: string) {
    return await this.vault.getItemMeta(key)
  }
}

export function createIDBStore<T>(name: string) {
  return new IDBStore<T>(name)
}
