import autobind from 'class-autobind-decorator'
import { cloneDeep } from 'lodash-es'
import { createSignal } from '~/shared/signal'
import { Record, recordSignalContext } from '../record'
import { StageDraw } from '../stage/draw/draw'
import { StageElement } from '../stage/element'
import { type IPage } from './type'
import { SchemaUtil } from './util'

@autobind
export class SchemaPageService {
  pages = createSignal<IPage[]>([])
  currentId = createSignal('')
  currentPage = createSignal<IPage>(null!)
  afterAdd = createSignal<IPage>()
  afterDelete = createSignal<IPage>()
  initHook() {
    this.currentId.hook((id) => {
      this.currentPage.dispatch(this.find(id))
      StageElement.clearAll()
      SchemaUtil.traverse(({ id }) => {
        StageDraw.collectRedraw(id)
      })
    })
    this.afterAdd.hook(
      (page) => {
        this.select(page.id)
        Record.endAction('新建页面并选中')
      },
      ['after:addToNodeMap']
    )
    this.afterDelete.hook((page) => {
      if (page.id === this.currentId.value) {
        this.select(this.pages.value[0].id)
      }
    })
  }
  add(page: IPage) {
    delete page.DELETE
    this.pages.dispatch((pages) => pages.push(page))
    Record.startAction()
    this.recordAddPage(page)
  }
  delete(page: IPage) {
    if (this.pages.value.length <= 1) return
    page.DELETE = true
    this.pages.dispatch()
  }
  find(id: string) {
    return this.pages.value.find((page) => page.id === id)
  }
  select(id: string) {
    if (this.currentId.value === id) return
    this.currentId.dispatch(id)
    this.recordSelectPage()
  }
  private recordSelectPage() {
    if (recordSignalContext()) return
    if (!this.currentId.oldValue) return
    Record.push({
      description: '选择页面',
      detail: {
        previous: this.currentPage.oldValue.name,
        current: this.currentPage.value.name,
      },
      undo: () => this.select(this.currentId.oldValue),
      redo: () => this.select(this.currentId.newValue),
    })
  }
  private recordAddPage(page: IPage) {
    if (recordSignalContext()) return
    Record.push({
      description: '添加页面',
      detail: cloneDeep(page),
      undo: () => this.delete(page),
      redo: () => this.add(page),
    })
  }
}

export const SchemaPage = new SchemaPageService()
