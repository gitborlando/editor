import { inject, injectable } from 'tsyringe'
import { autobind } from '~/shared/decorator'
import { createHooker } from '~/shared/hooker/hooker'
import { SchemaNodeService, injectSchemaNode } from '../schema/node'
import { INode } from '../schema/type'

type IOneTickChange = {
  [K in keyof INode]?: { new: INode[K]; old: INode[K] }
}

@autobind
@injectable()
export class OperateService {
  oneTickChange = <IOneTickChange>{}
  changedProps = new Set<keyof INode>()
  geometryChanged = false
  beforeOperate = createHooker()
  afterOperate = createHooker()
  constructor(@injectSchemaNode private SchemaNode: SchemaNodeService) {
    this.initialize()
  }
  private initialize() {
    this.SchemaNode.afterFlushDirty.hook(() => {
      this.afterOperate.dispatch()
      this.changedProps.clear()
      this.geometryChanged = false
      Object.values(this.oneTickChange).forEach((prop) => (prop.old = prop.new))
    })
  }
}

export const injectOperate = inject(OperateService)
