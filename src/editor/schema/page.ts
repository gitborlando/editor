import { autobind } from '~/shared/decorator'
import { createSignal } from '~/shared/signal'
import { Delete } from '~/shared/utils/normal'
import { SchemaDefault } from './default'
import { SchemaNode } from './node'
import { type IPage } from './type'

@autobind
export class SchemaPageService {
  inited = createSignal(false)
  pages = createSignal(<IPage[]>[])
  currentId = createSignal('')
  currentPage = createSignal(<IPage>null!)
  isPageFirstRendered = createSignal(false)
  initHook() {
    SchemaNode.afterFlushDirty.hook(() => {
      if (this.isPageFirstRendered.value === true) return
      this.isPageFirstRendered.dispatch(true)
    })
    this.currentId.hook((id) => {
      this.currentPage.dispatch(this.find(id))
    })
  }
  add() {
    const page = SchemaDefault.page()
    this.pages.value.push(page)
    this.select(page.id)
  }
  delete(id: string) {
    if (this.pages.value.length <= 1) return
    this.find(id)?.childIds.forEach((id) => {
      Delete(SchemaNode.nodeMap, id)
    })
    Delete(this.pages.value, (page) => page.id === id)
    if (id === this.currentId.value) this.select(this.pages.value[0].id)
  }
  find(id: string) {
    return this.pages.value.find((page) => page.id === id)
  }
  select(id: string) {
    this.currentId.dispatch(id)
    if (this.inited.value === false) {
      this.inited.dispatch(true)
    }
    this.isPageFirstRendered.dispatch(false)
  }
}

export const SchemaPage = new SchemaPageService()
