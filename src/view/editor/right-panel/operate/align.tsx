import { Flex, Icon } from '@gitborlando/widget'
import { FC, memo } from 'react'
import { OperateAlign } from 'src/editor/operate/align'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { Assets } from 'src/view/assets/assets'
import { Button } from 'src/view/ui-utility/widget/button'

type IAlignComp = {}

export const AlignComp: FC<IAlignComp> = memo(({}) => {
  const { alignTypes, canAlign, currentAlign } = OperateAlign
  useHookSignal(canAlign)

  return (
    <Flex layout='h' className='shrink-0 justify-around wh-100%-36 borderBottom'>
      {alignTypes.map((type) => (
        <Button
          key={type}
          disabled={!canAlign.value}
          onClick={() => currentAlign.dispatch(type)}>
          <Icon
            className={`wh-16 ${canAlign.value ? '' : 'path-fill-#E6E6E6'}`}
            url={Assets.editor.rightPanel.operate.align[type]}
          />
        </Button>
      ))}
    </Flex>
  )
})
