import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal'
import { addListener } from '~/shared/utils/event'
import { SchemaDefault } from '../schema/default'
import { Schema } from '../schema/schema'
import { IClient, ID, IPage } from '../schema/type'
import { SchemaUtil } from '../schema/util'
import { StageDraw } from '../stage/draw/draw'
import { StageElement } from '../stage/element'
import { OperateNode } from './node'

@autobind
export class OperateMetaService {
  afterChangePages = createSignal()
  curPage = createSignal<IPage>()
  clients!: Record<string, IClient>
  initHook() {
    Schema.registerListener('selectPage', () => {
      const page = Schema.find<IPage>(Schema.client.selectPageId)
      this.curPage.dispatch(page)
    })
    Schema.registerListener('changePages', () => {
      this.afterChangePages.dispatch()
    })
    Schema.registerListener('syncMouse', (o) => {})
    Schema.afterSetSchema.hook(() => {
      const firstPage = Schema.pages[0]
      Schema.client = this.addClient({ selectPageId: firstPage.id })
      this.curPage.dispatch(firstPage, { isFirstSelect: true })
    })
    this.curPage.hook((_, args) => {
      StageElement.clearAll()
      StageElement.collectReHierarchy(this.curPage.value.id)
      SchemaUtil.traverseCurPageChildIds(({ id, childIds, depth, ancestors }) => {
        OperateNode.setNodeRuntime(id, { ancestors, indent: depth })
        StageDraw.collectRedraw(id)
        if (childIds) StageElement.collectReHierarchy(id)
      })
      if (!args?.isFirstSelect) OperateNode.clearSelect()
    })
    addListener('mousemove', (e) => this.syncMouse(e.clientX, e.clientY))
  }
  addClient(option?: Partial<IClient>) {
    const client = SchemaDefault.client(option)
    Schema.itemAdd(Schema.meta, ['clients', client.id], client)
    Schema.commitOperation('addClient', ['meta'], '添加客户端')
    return client
  }
  selectPage(id: ID) {
    Schema.itemReset(Schema.meta, ['clients', Schema.client.id, 'selectPageId'], id)
    Schema.commitOperation('selectPage', ['meta'], `选择页面 ${id}`)
  }
  addPage(page: IPage) {
    Schema.addItem(page)
    Schema.itemAdd(Schema.meta, ['pageIds', Schema.meta.pageIds.length], page.id)
    Schema.commitOperation('changePages', ['meta', page.id], '添加页面')
  }
  removePage(page: IPage) {
    Schema.removeItem(page)
    Schema.itemDelete(Schema.meta, ['pageIds', Schema.meta.pageIds.indexOf(page.id)])
    Schema.commitOperation('changePages', ['meta', page.id], '移除页面')
  }
  syncMouse(x: number, y: number) {
    Schema.itemReset(Schema.meta, ['clients', Schema.client.id, 'mouse'], { x, y })
    Schema.commitOperation('syncMouse', ['meta'], '同步鼠标位置')
  }
}

export const OperateMeta = new OperateMetaService()
