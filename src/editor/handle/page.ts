import autobind from 'class-autobind-decorator'
import { SchemaCreator } from '../schema/creator'
import { IPage } from '../schema/type'

@autobind
class HandlePageService {
  addPage(page = SchemaCreator.page()) {
    YState.set(`${page.id}`, page)
    YState.push('meta.pageIds', page.id)
    YState.next()

    YUndo.untrackScope(() => YClients.selectPage(page.id))
    YUndo.track({ type: 'all', description: '添加并选中页面' })
  }

  removePage(page: IPage) {
    if (YState.state.meta.pageIds.length === 1) return

    YState.delete(`${page.id}`)
    const index = YState.state.meta.pageIds.indexOf(page.id)
    YState.delete(`meta.pageIds.${index}`)
    YState.next()

    YUndo.untrackScope(() => YClients.selectPage(YState.state.meta.pageIds[0]))
    YUndo.track({ type: 'all', description: '删除页面' })
  }
}

export const HandlePage = new HandlePageService()
