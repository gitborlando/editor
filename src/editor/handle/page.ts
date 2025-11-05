import autobind from 'class-autobind-decorator'
import { SchemaCreator } from '../schema/creator'
import { IPage } from '../schema/type'

@autobind
class HandlePageService {
  addPage(page = SchemaCreator.page()) {
    YState.set(`${page.id}`, page)
    YState.insert('meta.pageIds', page.id)
    YState.next()

    YUndo.untrack(() => YClients.selectPage(page.id))
    YUndo.track({ type: 'all', description: '添加并选中页面' })
  }

  removePage(page: IPage) {
    if (YState.state.meta.pageIds.length === 1) return

    YState.delete(`${page.id}`)
    YState.delete(`meta.pageIds.${YState.state.meta.pageIds.indexOf(page.id)}`)
    YState.next()

    YUndo.untrack(() => YClients.selectPage(YState.state.meta.pageIds[0]))
    YUndo.track({ type: 'all', description: '删除页面' })
  }

  devLogPageSchema(id: ID) {
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

export const HandlePage = new HandlePageService()
