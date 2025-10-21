import { XY } from '@gitborlando/geo'
import { Is } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import { YUndo } from 'src/editor/schema/y-undo'
import { globalCache } from 'src/global/cache'
import { proxy, snapshot, subscribe } from 'valtio'
import { bind } from 'valtio-yjs'
import * as Y from 'yjs'

@autobind
class YClientsService {
  othersSnap!: V1.Clients
  others!: V1.Clients

  doc!: Y.Doc
  clientId!: number
  client!: V1.Client
  clientSnap!: V1.Client

  initClient() {
    this.client = proxy({
      selectIds: {},
      selectPageId: YState.snap.meta.pageIds[0],
      cursor: new XY(0, 0),
    })
    this.doc = new Y.Doc()
    bind(this.client, this.doc.getMap('client'))
    subscribe(this.client, () => {
      this.clientSnap = snapshot(this.client)
    })
    YUndo.initClientUndo(this.doc.getMap('client'))
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
}

export const YClients = new YClientsService()

export function getSelectIds() {
  const selectIds = globalCache.getSet(
    'selectIds',
    () => Object.keys(YClients.clientSnap.selectIds),
    [YClients.clientSnap.selectIds],
  )
  return t<string[]>(selectIds)
}
