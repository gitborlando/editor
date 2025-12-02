import { createCache } from '@gitborlando/utils'
import { IMatrixTuple } from 'src/editor/math'
import { StageViewport } from 'src/editor/stage/viewport'
import { getSelectPageId } from 'src/editor/y-state/y-clients'
import { SchemaCreator } from '../schema/creator'

class HandlePageService {
  pageSceneMatrix = createCache<ID, IMatrixTuple>()

  subscribe() {
    return Disposer.collect(this.memoPageSceneMatrix(), this.onSwitchPage())
  }

  addPage(page = SchemaCreator.page()) {
    YState.set(`${page.id}`, page)
    YState.insert('meta.pageIds', page.id)
    YState.next()

    YUndo.untrack(() => YClients.selectPage(page.id))
    YUndo.track({ type: 'all', description: '添加并选中页面' })
  }

  removePage(page: V1.Page) {
    if (YState.state.meta.pageIds.length === 1) return

    YState.delete(`${page.id}`)
    YState.delete(`meta.pageIds.${YState.state.meta.pageIds.indexOf(page.id)}`)
    YState.next()

    YUndo.untrack(() => YClients.selectPage(YState.state.meta.pageIds[0]))
    YUndo.track({ type: 'all', description: '删除页面' })
  }

  private onSwitchPage() {
    return reaction(
      () => YClients.client.selectPageId,
      (pageId) => {
        const matrix = this.pageSceneMatrix.getSet(pageId, () =>
          Matrix.identity().tuple(),
        )
        StageViewport.sceneMatrix = Matrix.of(...matrix)
      },
    )
  }

  private memoPageSceneMatrix() {
    return reaction(
      () => StageViewport.sceneMatrix,
      (matrix) => {
        this.pageSceneMatrix.set(getSelectPageId(), matrix.tuple())
      },
    )
  }

  DEV_logPageSchema(id: ID) {
    const curPage = YState.find<V1.Page>(id)
    const nodes: Record<ID, V1.SchemaItem> = {}
    const findNodes = (id: string) => {
      const node = YState.find<V1.SchemaItem>(id)
      nodes[node.id] = node
      if ('childIds' in node) {
        node.childIds.map(YState.find).forEach((node) => (nodes[node.id] = node))
      }
    }
    curPage.childIds.forEach(findNodes)

    console.log({
      meta: YState.state.meta,
      page: curPage,
      ...nodes,
    })
  }
}

export const HandlePage = autoBind(new HandlePageService())
