import autobind from 'class-autobind-decorator'
import { UserService } from 'src/global/data/user'
import { proxy, Snapshot, snapshot, subscribe } from 'valtio'
import { bind } from 'valtio-yjs'
import * as Y from 'yjs'

@autobind
class YClientsService {
  clientsDoc!: Y.Doc
  clients!: Snapshot<V1.Clients>
  clientsProxy!: V1.Clients

  get client() {
    return this.clients[UserService.userId]
  }

  get clientProxy() {
    return this.clientsProxy[UserService.userId]
  }

  get selectIds() {
    return this.client.selectIds
  }

  get selectPageId() {
    return this.client.selectPageId
  }

  constructor() {
    this.initClients()
    subscribe(this.clientsProxy, () => {
      this.clients = snapshot(this.clientsProxy)
    })
    this.init()
  }

  init() {
    this.clientsProxy[UserService.userId] = {
      userId: UserService.userId,
      selectIds: {},
      selectPageId: '',
    }
  }

  select(id: string) {
    // if (this.selectIds[id]) return
    this.clientProxy.selectIds[id] = true
  }

  unSelect(id: string) {
    // if (!this.selectIds[id]) return
    console.log('id: ', id)
    Reflect.deleteProperty(this.clientProxy.selectIds, id)
  }

  clearSelect() {
    this.clientProxy.selectIds = {}
  }

  private initClients() {
    this.clientsDoc = new Y.Doc()
    this.clientsProxy = proxy({})
    bind(this.clientsProxy, this.clientsDoc.getMap('clients'))
  }
}

export const YClients = new YClientsService()
