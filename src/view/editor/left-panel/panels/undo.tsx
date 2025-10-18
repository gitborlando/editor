import { objectKey } from '@gitborlando/utils'
import { FC } from 'react'
import { YUndo } from 'src/editor/schema/y-undo'
import { Text } from 'src/view/component/text'

export const UndoComp: FC<{}> = observer(({}) => {
  return (
    <G style={{ alignContent: 'flex-start' }} gap={0}>
      {YUndo.stack.map((item, i) => (
        <G
          key={objectKey(item)}
          style={{
            width: '100%',
            height: 32,
            alignContent: 'center',
            paddingLeft: 8,
            color: YUndo.next === i + 1 ? 'rgba(0, 100, 255)' : '#000000',
            backgroundColor: YUndo.next === i + 1 ? 'rgba(0, 100, 255, 0.1)' : '#FFFFFF',
          }}>
          <Text>{`[${item.type}] ${item.description}`}</Text>
        </G>
      ))}
    </G>
  )
})
