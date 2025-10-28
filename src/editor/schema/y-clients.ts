import { XY } from '@gitborlando/geo'
import { Is } from '@gitborlando/utils'
import { listen } from '@gitborlando/utils/browser'
import autobind from 'class-autobind-decorator'
import { YSync } from 'src/editor/schema/y-sync'
import { YUndo } from 'src/editor/schema/y-undo'
import { StageViewport } from 'src/editor/stage/viewport'
import { globalCache } from 'src/global/cache'
import { UserService } from 'src/global/service/user'
import { proxy, snapshot, subscribe } from 'valtio'

export type NeedUndoClientState = {
  selectIds: Record<string, boolean>
  selectPageId: string
}

@autobind
class YClientsService {
  othersSnap!: V1.Clients
  others!: V1.Clients

  clientId!: number
  client!: V1.Client
  clientSnap!: V1.Client

  init() {
    this.client = proxy({
      selectIds: {},
      selectPageId: YState.snap.meta.pageIds[0],
      cursor: new XY(0, 0),
      color: COLOR.random(),
      zoom: StageViewport.zoom,
      offset: StageViewport.offset,
      userId: UserService.userId,
      userName: UserService.userName,
    })
    this.subscribeClient()

    this.others = proxy({})
    this.subscribeOthers()

    YUndo.initClientUndo()

    this.onMouseMove()
  }

  select(id: string) {
    if (this.client.selectIds[id]) return
    this.client.selectIds[id] = true

    const name = YState.state[id].name
    YUndo.track({ type: 'client', description: `选中节点 ${name}` })
  }

  unSelect(id: string) {
    if (!this.client.selectIds[id]) return
    delete this.client.selectIds[id]

    const name = YState.state[id].name
    YUndo.track({ type: 'client', description: `取消选中节点 ${name}` })
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
    this.clientSnap = snapshot(this.client)
    subscribe(this.client, () => {
      this.clientSnap = snapshot(this.client)
      if (YSync.inited$.value) {
        YSync.awareness.setLocalState(this.clientSnap)
      }
    })
  }

  private subscribeOthers() {
    YSync.awareness.on('update', () => {
      const states = YSync.awareness.getStates()
      for (const [id, client] of states) {
        if (id === this.clientId) continue
        this.others[id] = client as V1.Client
      }
    })
    subscribe(this.others, () => {
      this.othersSnap = snapshot(this.others)
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

export function getSelectPageId() {
  return YClients.clientSnap.selectPageId
}
