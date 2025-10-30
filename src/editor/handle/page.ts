import { Delete } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'
import { SchemaCreator } from '../schema/creator'
import { IPage } from '../schema/type'

@autobind
class HandlePageService {
  addPage(page = SchemaCreator.page()) {
    YState.state[page.id] = page
    YState.state.meta.pageIds.push(page.id)
    // Schema.itemAdd(Schema.client, ['viewport', page.id], { zoom: 1, xy: xy_(0, 0) })

    YUndo.untrackScope(() => YClients.selectPage(page.id))
    YUndo.track({ type: 'all', description: '添加并选中页面' })
  }

  removePage(page: IPage) {
    if (YState.state.meta.pageIds.length === 1) return

    delete YState.state[page.id]
    Delete(YState.state.meta.pageIds, page.id)

    YUndo.untrackScope(() => YClients.selectPage(YState.state.meta.pageIds[0]))
    YUndo.track({ type: 'all', description: '删除页面' })
  }
}

export const HandlePage = new HandlePageService()
