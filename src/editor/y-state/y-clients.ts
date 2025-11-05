import { XY } from '@gitborlando/geo'
import { Is } from '@gitborlando/utils'
import { listen } from '@gitborlando/utils/browser'
import autobind from 'class-autobind-decorator'
import equal from 'fast-deep-equal'
import { StageViewport } from 'src/editor/stage/viewport'
import { YSync } from 'src/editor/y-state/y-sync'
import { UserService } from 'src/global/service/user'

export type NeedUndoClientState = {
  selectIds: Record<string, boolean>
  selectPageId: string
}

@autobind
class YClientsService {
  clientId!: number

  @observable client!: V1.Client
  @observable others: V1.Clients = {}
  @observable observingClientId?: number

  @computed get selectIdList() {
    return Object.keys(this.client.selectIdMap)
  }
  @computed get allSelectIdMap() {
    return {
      ...this.client.selectIdMap,
      ...Object.values(this.others).reduce((acc, client) => {
        return { ...acc, ...client.selectIdMap }
      }, {}),
    }
  }
  @computed get observingClient() {
    const others = this.others
    if (!this.observingClientId) return
    return others[this.observingClientId]
  }

  afterSelect$ = Signal.create<void>()

  init() {
    this.client = {
      selectIdMap: {},
      selectPageId: YState.state.meta.pageIds[0],
      cursor: new XY(0, 0),
      color: COLOR.random(),
      zoom: StageViewport.zoom,
      offset: StageViewport.offset,
      userId: UserService.userId,
      userName: UserService.userName,
      userAvatar: UserService.avatar,
    }
    YSync.inited$.hook(() => {
      this.syncClient()
      this.subscribeOthers()
    })
    YUndo.initClientUndo()
    this.onMouseMove()
  }

  select(id: string) {
    if (this.client.selectIdMap[id]) return
    this.client.selectIdMap[id] = true

    const name = YState.state[id].name
    YUndo.track({ type: 'client', description: `选中节点 ${name}` })
  }

  unSelect(id: string) {
    if (!this.client.selectIdMap[id]) return
    delete this.client.selectIdMap[id]

    const name = YState.state[id].name
    YUndo.track({ type: 'client', description: `取消选中节点 ${name}` })
  }

  clearSelect() {
    if (Is.empty(this.client.selectIdMap)) return
    this.client.selectIdMap = {}
  }

  selectPage(id: string) {
    this.client.selectPageId = id
    YUndo.track({
      type: 'client',
      description: `选择页面 ${YState.state[id].name}`,
    })
  }

  getClientById(id: number) {
    return this.others[id]
  }

  private syncClient() {
    const clientKeys = Object.keys(this.client) as (keyof V1.Client)[]
    const commonKeys = clientKeys.filter((key) => key !== 'selectIdMap')

    commonKeys.forEach((key) => {
      reaction(
        () => this.client[key],
        (value) => {
          YSync.awareness.setLocalStateField(key, toJS(value))
        },
      )
    })

    this.afterSelect$.hook(() => {
      YSync.awareness.setLocalStateField(
        'selectIdMap',
        toJS(this.client.selectIdMap),
      )
    })

    YSync.awareness.setLocalState(toJS(this.client))
  }

  private subscribeOthers() {
    let prev: V1.Clients = this.others
    YSync.awareness.on('update', () => {
      const states = YSync.awareness.getStates()
      states.delete(this.clientId)
      const others = Object.fromEntries(states.entries()) as V1.Clients
      if (!equal(prev, others)) {
        this.others = others
        prev = others
      }
    })
  }

  private onMouseMove() {
    listen('mousemove', (e) => (this.client.cursor = XY.client(e)))
  }
}

export const YClients = makeObservable(new YClientsService())

export function getSelectIdMap() {
  return YClients.client.selectIdMap
}

export function getSelectIds() {
  return YClients.selectIdList
}

export function getAllSelectIdMap() {
  return YClients.allSelectIdMap
}

export function getSelectPageId() {
  return YClients.client.selectPageId
}
