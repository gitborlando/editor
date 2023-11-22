import { makeObservable, observable } from 'mobx'
import { autoBind } from '~/helper/decorator'
import { Delete } from '../utils'
import { SchemaDefaultService } from './default'
import { SchemaNodeService } from './node'
import { IPage } from './type'

@autoBind
export class SchemaPageService {
  @observable pages: IPage[] = []
  @observable currentId: string = ''
  constructor(
    private schemaDefaultService: SchemaDefaultService,
    private schemaNodeService: SchemaNodeService
  ) {
    makeObservable(this)
  }
  setPages(pages: IPage[]) {
    this.pages = pages
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
