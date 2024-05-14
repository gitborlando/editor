import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal/signal'
import { addListener } from '~/shared/utils/event'
import { SchemaDefault } from '../schema/default'
import { Schema } from '../schema/schema'
import { IClient, ID, IMeta, IPage } from '../schema/type'
import { OperateNode } from './node'

@autobind
class OperateMetaService {
  curPage = createSignal<IPage>()
  private lastPage!: IPage
  initHook() {
    Schema.inited.hook(() => {
      const firstPage = Schema.find<IPage>(Schema.meta.pageIds[0])
      this.addClient({ selectPageId: firstPage.id })
      this.curPage.value = this.lastPage = firstPage
      //  this.syncMouse()
    })
    Schema.schemaChanged.hook({ beforeAll: true }, () => {
      Schema.meta = Schema.find<IMeta>('meta')
      Schema.client = Schema.meta.clients[Schema.client.id]
    })
    Schema.schemaChanged.hook(() => {
      const selectPageId = Schema.client.selectPageId
      const currentPage = Schema.find<IPage>(selectPageId)
      if (!this.lastPage) return (this.lastPage = currentPage)
      if (this.lastPage === currentPage) return
      this.curPage.dispatch((this.lastPage = currentPage))
    })
  }
  addClient(option?: Partial<IClient>) {
    const client = (Schema.client = SchemaDefault.client(option))
    Schema.itemAdd(Schema.meta, ['clients', client.id], client)
    Schema.finalOperation('添加客户端', { noHistory: true })
  }
  selectPage(id: ID) {
    Schema.itemReset(Schema.meta, ['clients', Schema.client.id, 'selectPageId'], id)
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
  private syncMouse() {
    addListener('mousemove', ({ clientX: x, clientY: y }) => {
      Schema.itemReset(Schema.meta, ['clients', Schema.client.id, 'mouse'], { x, y })
      Schema.commitOperation('同步鼠标位置', { noHistory: true })
      Schema.nextSchema()
    })
  }
}

export const OperateMeta = new OperateMetaService()
