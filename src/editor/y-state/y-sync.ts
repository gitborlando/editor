import { HocuspocusProvider } from '@hocuspocus/provider'
import { Awareness } from 'y-protocols/awareness.js'
import * as Y from 'yjs'

class YSyncService {
  inited$ = Signal.create(false)

  provider!: HocuspocusProvider
  awareness!: Awareness

  init(fileId: string, document: Y.Doc) {
    this.provider = new HocuspocusProvider({
      url: 'ws://8.134.131.253:1234', //'ws://localhost:1234',
      name: fileId,
      document,
    })
    this.awareness = this.provider.awareness!

    const disposer = Disposer.collect(YClients.syncSelf(), YClients.syncOthers())
    return disposer
  }
}

export const YSync = autoBind(new YSyncService())
