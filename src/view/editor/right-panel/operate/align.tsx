import { Icon } from '@gitborlando/widget'
import { OperateAlign } from 'src/editor/operate/align'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { IconButton } from 'src/view/component/button'

export const AlignComp: FC<{}> = observer(({}) => {
  const { alignTypes, canAlign, currentAlign } = OperateAlign
  useHookSignal(canAlign)

  return (
    <G center horizontal className={cls()}>
      {alignTypes.map((type) => (
        <IconButton
          key={type}
          disabled={!canAlign.value}
          onClick={() => currentAlign.dispatch(type)}>
          <Icon url={Assets.editor.rightPanel.operate.align[type]} />
        </IconButton>
      ))}
    </G>
  )
})

const cls = classes(css`
  height: 40px;
  justify-items: center;
  ${styles.borderBottom}
  & .g-icon {
    width: 16px;
    height: 16px;
  }
`)
