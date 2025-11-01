import { objectKey } from '@gitborlando/utils'
import Scrollbars from 'react-custom-scrollbars-2'
import { Text } from 'src/view/component/text'

export const UndoComp: FC<{}> = observer(({}) => {
  const { next, stack } = YUndo

  return (
    <G gap={0}>
      <Scrollbars>
        {stack.map((item, i) => (
          <G
            className={styles()}
            key={objectKey(item)}
            style={{
              color: next === i + 1 ? 'rgba(0, 100, 255)' : '#000000',
              backgroundColor: next === i + 1 ? 'rgba(0, 100, 255, 0.1)' : '#FFFFFF',
            }}>
            <Text>{`[${item.type}] ${item.description}`}</Text>
          </G>
        ))}
      </Scrollbars>
    </G>
  )
})

const styles = classes(css`
  width: 100%;
  height: 32px;
  align-content: center;
  padding-left: 8px;
`)
