import { inject, injectable } from 'tsyringe'
import { SchemaDefaultService, injectSchemaDefault } from '~/editor/schema/default'
import { SchemaNodeService, injectSchemaNode } from '~/editor/schema/node'
import { IRect } from '~/editor/schema/type'
import { Watch, When, autobind } from '~/shared/decorator'
import { macroStringMatch } from '~/shared/macro/string-match'

@autobind
@injectable()
export class StageTransformService {
  readonly id = <const>'transform'
  transformNode: IRect
  constructor(
    @injectSchemaNode private SchemaNode: SchemaNodeService,
    @injectSchemaDefault private SchemaDefault: SchemaDefaultService
  ) {
    this.transformNode = this.SchemaDefault.rect({ id: this.id })
    this.initialize()
  }
  @When('SchemaNode.initialized')
  private initialize() {
    this.SchemaNode.add(this.transformNode)
    this.autoSetTransformNode()
  }
  @Watch('SchemaNode.selectChange')
  private autoSetTransformNode() {
    const selectIds = this.SchemaNode.selectIds
    if (selectIds.size === 1) {
      const node = this.SchemaNode.find([...selectIds][0])
      Object.entries(node).forEach(([key, value]) => {
        if (macroStringMatch`x|y|pivotX|pivotY|centerX|centerY|width|height|rotation`(key)) {
          ;(this.transformNode as any)[key] = value
        }
      })
    } else {
    }
    this.SchemaNode.collectDirty(this.id)
  }
}

export const injectStageTransform = inject(StageTransformService)
