import { Minus, Plus } from 'lucide-react'
import { pascalCase } from 'nano-string-utils'
import { OperateFill } from 'src/editor/operate/fill'
import { IconButton } from 'src/view/component/button'
import {
  OpFieldComp,
  OpFieldContentComp,
  OpFieldHeaderComp,
} from 'src/view/editor/right-panel/operate/components/op-field'
import { EditorRPOperateFillItemComp } from 'src/view/editor/right-panel/operate/fill-item'

export const EditorRPOperateFillComp: FC<{}> = observer(({}) => {
  const { fills, isMultiFills, setFills, newFill } = OperateFill

  const addFill = () => {
    setFills((draft) => {
      draft.push(newFill())
    })
  }

  const deleteFill = (index: number) => {
    setFills((draft) => {
      draft.splice(index, 1)
    })
  }

  return (
    <OpFieldComp>
      <OpFieldHeaderComp
        title={pascalCase(t('noun.fill'))}
        headerSlot={<IconButton icon={<Lucide icon={Plus} />} onClick={addFill} />}
      />
      <OpFieldContentComp x-if={fills.length > 0}>
        {fills.map((fill, index) => (
          <G horizontal='1fr auto' center gap={8} key={index}>
            <EditorRPOperateFillItemComp fill={fill} index={index} />
            <IconButton
              size='small'
              icon={<Lucide icon={Minus} />}
              onClick={() => deleteFill(index)}
            />
          </G>
        ))}
      </OpFieldContentComp>
    </OpFieldComp>
  )
})
