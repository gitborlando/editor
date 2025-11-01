import { createCache } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import { SchemaHelper } from 'src/editor/schema/helper'

export type EditorLPLayerNodeInfo = {
  id: string
  indent: number
  ancestors: string[]
}

@autobind
class EditorLPLayerNodeStateService {
  allExpanded = false

  nodeInfoList: EditorLPLayerNodeInfo[] = []
  nodeExpandedMap = createCache<string, boolean>()
  nodeInfoChanged = Signal.create()

  getNodeExpanded(id: string) {
    return this.nodeExpandedMap.get(id)
  }

  getAllNodeExpanded() {
    console.log(this.nodeExpandedMap.cache)
    for (const expanded of this.nodeExpandedMap.values()) {
      if (expanded) return true
    }
    return false
  }

  toggleNodeExpanded(id: string, expanded: boolean) {
    this.nodeExpandedMap.set(id, expanded)
    this.nodeInfoChanged.dispatch()
  }

  toggleAllNodeExpanded(expanded: boolean) {
    SchemaHelper.createCurrentPageTraverse({
      finder: YState.findSnap<V1.Node>,
      callback: ({ id }) => void this.nodeExpandedMap.set(id, expanded),
    })()
    this.nodeInfoChanged.dispatch()
  }

  getNodeInfoList() {
    this.nodeInfoList.length = 0
    SchemaHelper.createCurrentPageTraverse({
      finder: YState.findSnap<V1.Node>,
      callback: ({ id, ancestors }) => {
        this.nodeInfoList.push({ id, indent: ancestors.length, ancestors })
        return !!this.nodeExpandedMap.get(id)
      },
    })()
    return this.nodeInfoList
  }
}

export const EditorLPLayerNodeState = makeObservable(
  new EditorLPLayerNodeStateService(),
)
