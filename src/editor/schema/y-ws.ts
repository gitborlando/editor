import { HocuspocusProvider } from '@hocuspocus/provider'
import autobind from 'class-autobind-decorator'
import * as Y from 'yjs'

@autobind
class YWSService {
  yWS!: HocuspocusProvider

  init(fileId: string, document: Y.Doc) {
    this.yWS = new HocuspocusProvider({
      url: 'ws://localhost:1234',
      name: fileId,
      document,
    })
  }
}

export const YWS = new YWSService()
