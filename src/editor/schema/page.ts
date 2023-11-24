import { makeObservable, observable, when } from 'mobx'
import { inject, injectable } from 'tsyringe'
import { autobind } from '~/helper/decorator'
import { watch } from '~/helper/utils'
import { Delete } from '../utils'
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
    @injectSchemaDefault private schemaDefaultService: SchemaDefaultService,
    @injectSchemaNode private schemaNodeService: SchemaNodeService
  ) {
    makeObservable(this)
    when(() => !!this.currentId).then(() => {
      this.initialized = true
      watch(() => this.currentId).then(() => {
        this.currentPage = this.find(this.currentId)!
      })
    })
  }
  setPages(pages: IPage[]) {
    this.pages = pages
  }
  add() {
    this.pages.push(this.schemaDefaultService.page())
  }
  delete(id: string) {
    if (this.pages.length <= 1) return
    this.find(id)?.childIds.forEach((id) => {
      Delete(this.schemaNodeService.nodeMap, id)
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
}

export const injectSchemaPage = inject(SchemaPageService)
