import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal/signal'
import { SchemaDefault } from '../schema/default'
import { Schema } from '../schema/schema'
import { ID, IPage } from '../schema/type'
import { OperateNode } from './node'

@autobind
class OperatePageService {
  curPage = createSignal<IPage>()
  selectedPage!: IPage
  selectedPageId!: ID
  private lastPage!: IPage
  initHook() {
    Schema.inited.hook(() => {
      const firstPage = Schema.find<IPage>(Schema.meta.pageIds[0])
      this.curPage.value = this.lastPage = firstPage
      Schema.itemReset(Schema.client, ['selectPageId'], firstPage.id)
      Schema.nextSchema()
    })
    Schema.reviewSchema('/client/selectPageId', () => {
      this.selectedPage = Schema.find<IPage>(Schema.client.selectPageId)
      this.selectedPageId = Schema.client.selectPageId
    })
    Schema.schemaChanged.hook(() => {
      const selectPageId = Schema.client.selectPageId
      const currentPage = Schema.find<IPage>(selectPageId)
      if (!this.lastPage) return (this.lastPage = currentPage)
      if (this.lastPage === currentPage) return
      this.curPage.dispatch((this.lastPage = currentPage))
    })
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
