import autobind from 'class-autobind-decorator'
import { xy_ } from 'src/editor/math/xy'
import { SchemaDefault } from '../schema/default'
import { Schema } from '../schema/schema'
import { ID, IPage } from '../schema/type'
import { OperateNode } from './node'

@autobind
class OperatePageService {
  get currentPage() {
    return Schema.find<IPage>(Schema.client.selectPageId)
  }

  selectPage(id: ID) {
    Schema.itemReset(Schema.client, ['selectPageId'], id)
    OperateNode.clearSelect()
    OperateNode.commitSelect()
    Schema.commitOperation(`选择页面 ${id}`)
  }

  addPage(page = SchemaDefault.page()) {
    Schema.addItem(page)
    Schema.itemAdd(Schema.meta, ['pageIds', Schema.meta.pageIds.length], page.id)
    Schema.itemAdd(Schema.client, ['viewport', page.id], { zoom: 1, xy: xy_(0, 0) })
    this.selectPage(page.id)
    Schema.finalOperation('添加页面')
  }

  removePage(page: IPage) {
    Schema.removeItem(page)
    Schema.itemDelete(Schema.meta, ['pageIds', Schema.meta.pageIds.indexOf(page.id)])
    Schema.finalOperation('移除页面')
  }
}

export const OperatePage = new OperatePageService()
