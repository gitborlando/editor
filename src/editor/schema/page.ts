import { computed, makeObservable, observable, when } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { autobind } from '~/shared/decorator'
import { createHooker } from '~/shared/hooker'
import { Delete } from '~/shared/utils'
import { SchemaDefaultService, injectSchemaDefault } from './default'
import { SchemaNodeService, injectSchemaNode } from './node'
import { type IPage } from './type'

@autobind
@injectable()
export class SchemaPageService {
  @observable pages: IPage[] = []
  @observable currentId = ''
  @observable initialized = false
  isPageFirstRendered = createHooker<[boolean]>([false])
  constructor(
    @injectSchemaDefault private SchemaDefault: SchemaDefaultService,
    @injectSchemaNode private SchemaNode: SchemaNodeService
  ) {
    makeObservable(this)
    this.initialize()
  }
  private initialize() {
    when(() => !!this.currentId).then(() => (this.initialized = true))
    this.SchemaNode.afterFlushDirty.hook(() => {
      if (this.isPageFirstRendered.args[0] === true) return
      this.isPageFirstRendered.dispatch(true)
    })
  }
  @computed get currentPage() {
    return this.find(this.currentId)!
  }
  setPages(pages: IPage[]) {
    this.pages = pages
  }
  add() {
    const page = this.SchemaDefault.page()
    this.pages.push(page)
    this.select(page.id)
  }
  delete(id: string) {
    if (this.pages.length <= 1) return
    this.find(id)?.childIds.forEach((id) => {
      Delete(this.SchemaNode.nodeMap, id)
    })
    Delete(this.pages, (page) => page.id === id)
    if (id === this.currentId) this.select(this.pages[0].id)
  }
  find(id: string) {
    return this.pages.find((page) => page.id === id)
  }
  select(id: string) {
    this.currentId = id
    this.isPageFirstRendered.dispatch(false)
  }
}

export const injectSchemaPage = inject(SchemaPageService)
