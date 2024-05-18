import { FC, memo } from 'react'
import { OperateAlign } from '~/editor/operate/align'
import { useHookSignal } from '~/shared/signal/signal-react'
import Asset from '~/view/ui-utility/assets'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

type IAlignComp = {}

export const AlignComp: FC<IAlignComp> = memo(({}) => {
  const { alignTypes, canAlign, currentAlign } = OperateAlign
  useHookSignal(canAlign)

  return (
    <Flex className='lay-h shrink-0 justify-around wh-100%-36 borderBottom'>
      {alignTypes.map((type) => (
        <Button key={type} disabled={!canAlign.value} onClick={() => currentAlign.dispatch(type)}>
          <Icon size={16} fill={canAlign.value ? '' : '#E6E6E6'}>
            {Asset.editor.rightPanel.operate.align[type]}
          </Icon>
        </Button>
      ))}
    </Flex>
  )
})