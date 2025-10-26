import { XY } from '@gitborlando/geo'
import { Is } from '@gitborlando/utils'
import { listen } from '@gitborlando/utils/browser'
import autobind from 'class-autobind-decorator'
import { YUndo } from 'src/editor/schema/y-undo'
import { YWS } from 'src/editor/schema/y-ws'
import { globalCache } from 'src/global/cache'
import { UserService } from 'src/global/service/user'
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
      userId: UserService.userId,
      userName: UserService.userName,
      selectIds: {},
      selectPageId: YState.snap.meta.pageIds[0],
      cursor: new XY(0, 0),
    })
    this.others = proxy({})
    this.doc = new Y.Doc()
    bind(this.client, this.doc.getMap('client'))
    this.clientSnap = snapshot(this.client)
    subscribe(this.client, () => (this.clientSnap = snapshot(this.client)))
    YUndo.initClientUndo(this.doc.getMap('client'))

    this.subscribeClient()
    YWS.inited$.hook(() => {
      this.subscribeOthers()
    })

    this.onMouseMove()
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
  }

  selectPage(id: string) {
    this.client.selectPageId = id
    const page = YState.state[id]
    YUndo.track({ type: 'client', description: `选择页面 ${page.name}` })
  }

  private subscribeClient() {
    subscribe(this.client, () => {
      this.clientSnap = snapshot(this.client)
      if (YWS.inited$.value) {
        YWS.awareness.setLocalState(this.clientSnap)
      }
    })
  }

  private subscribeOthers() {
    YWS.awareness.on('update', () => {
      const states = YWS.awareness.getStates()
      for (const [id, client] of states) {
        if (id === this.clientId) continue
        this.others[id] = client as V1.Client
      }
    })
    subscribe(this.others, () => {
      this.othersSnap = snapshot(this.others)
      console.log('othersSnap: ', this.othersSnap)
    })
  }

  private onMouseMove() {
    listen('mousemove', (e) => (this.client.cursor = XY.client(e)))
  }
}

export const YClients = new YClientsService()

export function getSelectIdMap() {
  return YClients.clientSnap.selectIds
}

export function getSelectIds() {
  const selectIds = globalCache.getSet(
    'selectIds',
    () => Object.keys(YClients.clientSnap.selectIds),
    [YClients.clientSnap.selectIds],
  )
  return t<string[]>(selectIds)
}

export function getAllSelectIdMap() {
  const allSelectIdMap = globalCache.getSet(
    'allSelectIdMap',
    () => {
      const allSelectMap = {}
      Object.assign(allSelectMap, YClients.clientSnap.selectIds)
      for (const [_, client] of Object.entries(YClients.othersSnap || {})) {
        Object.assign(allSelectMap, client.selectIds)
      }
      return allSelectMap
    },
    [YClients.othersSnap, YClients.clientSnap],
  )
  return t<Record<string, boolean>>(allSelectIdMap)
}
