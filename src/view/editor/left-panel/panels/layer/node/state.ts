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
  nodeInfoChanged = Signal.create()

  private nodeExpandedMap = createCache<string, boolean>()

  getNodeExpanded(id: string) {
    return this.nodeExpandedMap.get(id)
  }

  getAllNodeExpanded() {
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
      finder: YState.find<V1.Node>,
      callback: ({ id }) => void this.nodeExpandedMap.set(id, expanded),
    })()
    this.nodeInfoChanged.dispatch()
  }

  getNodeInfoList() {
    const nodeInfoList: EditorLPLayerNodeInfo[] = []
    SchemaHelper.createCurrentPageTraverse({
      finder: YState.find<V1.Node>,
      callback: ({ id, ancestors }) => {
        nodeInfoList.push({ id, indent: ancestors.length, ancestors })
        return !!this.nodeExpandedMap.get(id)
      },
    })()
    return nodeInfoList
  }
}

export const EditorLPLayerNodeState = makeObservable(
  new EditorLPLayerNodeStateService(),
)
