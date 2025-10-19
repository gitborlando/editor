import { Is } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import { YUndo } from 'src/editor/schema/y-undo'
import { UserService } from 'src/global/service/user'
import { proxy, Snapshot, snapshot, subscribe } from 'valtio'
import { bind } from 'valtio-yjs'
import * as Y from 'yjs'

@autobind
class YClientsService {
  doc!: Y.Doc
  snap!: Snapshot<V1.Clients>
  proxy!: V1.Clients

  get client() {
    return this.proxy[UserService.userId]
  }

  constructor() {
    this.bind()
  }

  init() {
    this.proxy[UserService.userId] = {
      userId: UserService.userId,
      selectIds: {},
      selectPageId: YState.snap.meta.pageIds[0],
    }
    YUndo.initClientUndo(this.doc.getMap('clients'))
  }

  select(id: string) {
    if (this.client.selectIds[id]) return
    this.client.selectIds[id] = true
    YUndo.track({ type: 'client', description: `选中节点 ${id}` })
  }

  unSelect(id: string) {
    if (!this.client.selectIds[id]) return
    delete this.client.selectIds[id]
    YUndo.track({ type: 'client', description: `取消选中节点 ${id}` })
  }

  clearSelect() {
    if (Is.empty(this.client.selectIds)) return
    this.client.selectIds = {}
    YUndo.track({ type: 'client', description: `清空选中节点` })
  }

  selectPage(id: string) {
    this.client.selectPageId = id
    const page = YState.state[id]
    YUndo.track({ type: 'client', description: `选择页面 ${page.name}` })
  }

  private bind() {
    this.doc = new Y.Doc()
    this.proxy = proxy({})
    bind(this.proxy, this.doc.getMap('clients'))
    subscribe(this.proxy, () => {
      this.snap = snapshot(this.proxy)
    })
  }
}

export const YClients = new YClientsService()
