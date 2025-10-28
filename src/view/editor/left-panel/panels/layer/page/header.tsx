import { Flex } from '@gitborlando/widget'
import { ChevronDown, Plus } from 'lucide-react'
import { FC, memo } from 'react'
import { HandlePage } from 'src/editor/handle/page'
import { UILeftPanelLayer } from 'src/editor/ui-state/left-panel/layer'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { useMatchPatch } from 'src/shared/utils/react'
import { useSelectPage } from 'src/view/hooks/schema/use-y-state'
import { Button } from 'src/view/ui-utility/widget/button'

type IPageHeaderComp = {}

export const PageHeaderComp: FC<IPageHeaderComp> = memo(({}) => {
  const { allPageExpanded } = UILeftPanelLayer
  useHookSignal(allPageExpanded)
  useMatchPatch('/client/selectPageId')
  const selectPage = useSelectPage()
  const newPage = () => {
    if (allPageExpanded.value === false) {
      allPageExpanded.dispatch(true)
    }
    // OperatePage.addPage()
    HandlePage.addPage()
  }

  return (
    <Flex layout='h' className='shrink-0 wh-100%-32 bg-white px-6'>
      <Flex layout='c' className='labelFont pl-6'>
        {selectPage.name}
      </Flex>
      <Button type='icon' style={{ marginLeft: 'auto' }} onClick={newPage}>
        <Plus size={16} className='text-#393939' />
      </Button>
      <Button
        type='icon'
        onClick={() => allPageExpanded.dispatch(!allPageExpanded.value)}>
        <ChevronDown
          size={16}
          className='text-#393939'
          style={{ rotate: allPageExpanded.value ? '0deg' : '180deg' }}
        />
      </Button>
    </Flex>
  )
})
