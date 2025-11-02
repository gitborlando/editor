import { HocuspocusProvider } from '@hocuspocus/provider'
import autobind from 'class-autobind-decorator'
import { Awareness } from 'y-protocols/awareness.js'
import * as Y from 'yjs'

export type AwarenessUpdateEvent = {
  added: number[]
  removed: number[]
  updated: number[]
}

@autobind
class YSyncService {
  inited$ = Signal.create(false)

  provider!: HocuspocusProvider
  awareness!: Awareness

  async init(fileId: string, document: Y.Doc) {
    this.provider = new HocuspocusProvider({
      url: 'ws://localhost:1234', // 'ws://8.134.131.253:1234',
      name: fileId,
      document,
    })
    this.awareness = this.provider.awareness!

    this.inited$.dispatch(true)
  }
}

export const YSync = new YSyncService()
