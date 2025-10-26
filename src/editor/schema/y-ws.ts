import { HocuspocusProvider } from '@hocuspocus/provider'
import autobind from 'class-autobind-decorator'
import { Awareness } from 'y-protocols/awareness.js'
import * as Y from 'yjs'

@autobind
class YWSService {
  yWS!: HocuspocusProvider
  awareness!: Awareness

  init(fileId: string, document: Y.Doc) {
    this.yWS = new HocuspocusProvider({
      url: 'ws://localhost:1234',
      name: fileId,
      document,
    })
    this.awareness = this.yWS.awareness!
  }
}

export const YWS = new YWSService()
