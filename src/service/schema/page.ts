import autoBind from 'auto-bind'
import { makeObservable } from 'mobx'
import { Delete } from '~/helper/utils'
import { EditorService } from '../editor/editor'
import { SchemaService } from './schema'
import { IPage } from './type'

export class SchemaPage {
  pages: IPage[] = []
  currentPageId: string = ''
  public constructor(private schema: SchemaService, private editor: EditorService) {
    autoBind(this)
    makeObservable(this, {
      pages: true,
      currentPageId: true,
    })
  }
  setPages(pages: IPage[]) {
    this.pages = pages
  }
  newPage() {
    this.pages.push(this.schema.default.page())
  }
  find(id: string) {
    return this.pages.find((page) => page.id === id)
  }
  select(id: string) {
    this.currentPageId = id
  }
  delete(id: string) {
    if (this.pages.length <= 1) return
    this.find(id)?.childIds.forEach((id) => Delete(this.schema.nodeMap, id))
    Delete(this.pages, (page) => page.id === id)
    this.select(this.pages[0].id)
  }
}
