import { makeObservable, observable, when } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { Watch, autobind } from '~/editor/helper/decorator'
import { Delete } from '../helper/utils'
import { SchemaDefaultService, injectSchemaDefault } from './default'
import { SchemaNodeService, injectSchemaNode } from './node'
import { type IPage } from './type'

@autobind
@injectable()
export class SchemaPageService {
  @observable pages: IPage[] = []
  @observable currentId = ''
  @observable currentPage!: IPage
  @observable initialized = false
  constructor(
    @injectSchemaDefault private SchemaDefault: SchemaDefaultService,
    @injectSchemaNode private SchemaNode: SchemaNodeService
  ) {
    makeObservable(this)
    when(() => !!this.currentId).then(() => {
      this.autoSetCurrentPage()
      this.initialized = true
    })
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
  }
  @Watch('currentId')
  private autoSetCurrentPage() {
    this.currentPage = this.find(this.currentId)!
  }
}

export const injectSchemaPage = inject(SchemaPageService)
