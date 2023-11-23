import { makeObservable, observable } from 'mobx'
import { delay, inject, injectable } from 'tsyringe'
import { autobind } from '~/helper/decorator'
import { Delete } from '../utils'
import { SchemaDefaultService, injectSchemaDefault } from './default'
import { SchemaNodeService, injectSchemaNode } from './node'
import { IPage } from './type'

@autobind
@injectable()
export class SchemaPageService {
  @observable pages: IPage[] = []
  @observable currentId: string = ''
  constructor(
    @injectSchemaDefault private schemaDefaultService: SchemaDefaultService,
    @injectSchemaNode private schemaNodeService: SchemaNodeService
  ) {
    makeObservable(this)
  }
  get initialized() {
    return !!this.currentId
  }
  get currentPage() {
    return this.find(this.currentId)!
  }
  setPages(pages: IPage[]) {
    this.pages = pages
  }
  setCurrentPage(option: Partial<IPage>) {
    Object.assign(this.currentPage, option)
  }
  add() {
    this.pages.push(this.schemaDefaultService.page())
  }
  delete(id: string) {
    if (this.pages.length <= 1) return
    this.find(id)?.childIds.forEach((id) => Delete(this.schemaNodeService.nodeMap, id))
    Delete(this.pages, (page) => page.id === id)
    this.select(this.pages[0].id)
  }
  find(id: string) {
    return this.pages.find((page) => page.id === id)
  }
  select(id: string) {
    this.currentId = id
  }
}

export const injectSchemaPage = inject(SchemaPageService)
export const delayInjectSchemaPage = inject(delay(() => SchemaPageService))
