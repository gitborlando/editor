import { HocuspocusProvider } from '@hocuspocus/provider'
import autobind from 'class-autobind-decorator'
import { Awareness } from 'y-protocols/awareness.js'
import * as Y from 'yjs'

@autobind
class YWSService {
  inited$ = Signal.create(false)

  provider!: HocuspocusProvider
  awareness!: Awareness

  init(fileId: string, document: Y.Doc) {
    this.provider = new HocuspocusProvider({
      url: 'ws://localhost:1234',
      name: fileId,
      document,
    })
    this.awareness = this.provider.awareness!

    this.inited$.dispatch(true)
  }
}

export const YWS = new YWSService()
