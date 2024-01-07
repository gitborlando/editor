import { toJS } from 'mobx'
import { nanoid } from 'nanoid'
import { delay, inject, injectable } from 'tsyringe'
import { autobind } from '~/shared/decorator'
import { SchemaNodeService } from './node'
import { SchemaPageService } from './page'
import { IMeta, ISchema } from './type'

@autobind
@injectable()
export class SchemaService {
  private meta!: IMeta
  constructor(
    @inject(delay(() => SchemaNodeService)) private SchemaNode: SchemaNodeService,
    @inject(delay(() => SchemaPageService)) private SchemaPage: SchemaPageService
  ) {}
  setMeta(option: Partial<IMeta>) {
    this.meta = { ...this.meta, ...option }
  }
  getSchema() {
    return {
      meta: this.meta,
      nodes: this.SchemaNode.nodeMap,
      pages: toJS(this.SchemaPage.pages),
    }
  }
  setSchema({ meta, nodes, pages }: ISchema) {
    this.meta = meta
    this.SchemaNode.setMap(nodes)
    this.SchemaPage.setPages(pages)
  }
  createId() {
    return this.meta.version + nanoid()
  }
}

export const injectSchema = inject(SchemaService)
