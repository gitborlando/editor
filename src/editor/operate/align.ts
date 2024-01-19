import autobind from 'class-autobind-decorator'
import { createSignal } from '~/shared/signal'
import { SchemaNode } from '../schema/node'
import { SchemaUtil } from '../schema/util'
import { StageSelect } from '../stage/interact/select'

const alignTypes = <const>[
  'alignLeft',
  'alignCenter',
  'alignRight',
  'verticalTop',
  'verticalCenter',
  'verticalBottom',
]

@autobind
export class OperateAlignService {
  alignTypes = alignTypes
  canSetAlign = createSignal(false)
  initHook() {
    StageSelect.afterSelect.hook(() => {
      if (SchemaNode.selectNodes.length === 0) return this.canSetAlign.dispatch(false)
      if (SchemaNode.selectNodes.length > 1) return this.canSetAlign.dispatch(true)
      if (SchemaNode.selectNodes.length === 1)
        if (SchemaUtil.isContainerNode(SchemaNode.selectNodes[0])) {
          return this.canSetAlign.dispatch(true)
        }
    })
  }
}

export const OperateAlign = new OperateAlignService()
