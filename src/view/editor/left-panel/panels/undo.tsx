import { objectKey } from '@gitborlando/utils'
import { FC } from 'react'
import { YUndo } from 'src/editor/schema/y-undo'

export const UndoComp: FC<{}> = observer(({}) => {
  return (
    <G style={{ alignContent: 'flex-start' }} gap={0}>
      {YUndo.stack.map((item, i) => (
        <div
          key={objectKey(item)}
          style={{
            width: '100%',
            height: 'fit-content',
            borderBottom: '1px solid #E3E3E3',
            backgroundColor: YUndo.next === i ? 'blue' : '#FFFFFF',
          }}>
          {`[${item.type}] ${item.description}`}
        </div>
      ))}
    </G>
  )
})
