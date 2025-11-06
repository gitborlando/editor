import { Plus } from 'lucide-react'
import { IconButton } from 'src/view/component/button'
import {
  OpFieldComp,
  OpFieldHeaderComp,
} from 'src/view/editor/right-panel/operate/components/op-field'

export const EditorRPOperateStrokeComp: FC<{}> = ({}) => {
  return null
  return (
    <OpFieldComp>
      <OpFieldHeaderComp
        title='描边'
        headerSlot={<IconButton icon={<Lucide icon={Plus} />} onClick={() => {}} />}
      />
    </OpFieldComp>
  )
}
