import autoBind from 'auto-bind'
import { makeObservable } from 'mobx'
import { Delete } from '../utils'
import { SchemaService } from './schema'
import { IPage } from './type'

export class SchemaPage {
  pages: IPage[] = []
  currentId: string = ''
  constructor(private schema: SchemaService) {
    autoBind(this)
    makeObservable(this, {
      pages: true,
      currentId: true,
    })
  }
  setPages(pages: IPage[]) {
    this.pages = pages
  }
  add() {
    this.pages.push(this.schema.default.page())
  }
  delete(id: string) {
    if (this.pages.length <= 1) return
    this.find(id)?.childIds.forEach((id) => Delete(this.schema.node.map, id))
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
