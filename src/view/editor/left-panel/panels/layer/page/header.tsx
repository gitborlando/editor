import { Flex, Icon } from '@gitborlando/widget'
import { FC, memo } from 'react'
import { OperatePage } from 'src/editor/operate/page'
import { UILeftPanelLayer } from 'src/editor/ui-state/left-panel/layer'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { useMatchPatch } from 'src/shared/utils/react'
import { Button } from 'src/view/ui-utility/widget/button'

type IPageHeaderComp = {}

export const PageHeaderComp: FC<IPageHeaderComp> = memo(({}) => {
  const { allPageExpanded } = UILeftPanelLayer
  useHookSignal(allPageExpanded)
  useMatchPatch('/client/selectPageId')

  const newPage = () => {
    if (allPageExpanded.value === false) {
      allPageExpanded.dispatch(true)
    }
    OperatePage.addPage()
  }

  return (
    <Flex layout='h' className='shrink-0 wh-100%-32 bg-white px-6'>
      <Flex layout='c' className='labelFont pl-6'>
        {OperatePage.currentPage.name}
      </Flex>
      <Button type='icon' style={{ marginLeft: 'auto' }} onClick={newPage}>
        <Icon className='wh-16 path-fill-#393939' url={Assets.editor.leftPanel.page.add} />
      </Button>
      <Button type='icon' onClick={() => allPageExpanded.dispatch(!allPageExpanded.value)}>
        <Icon
          className='wh-16 path-fill-#393939'
          style={{ rotate: allPageExpanded.value ? '180deg' : '0deg' }}
          url={Assets.editor.leftPanel.page.collapse}
        />
      </Button>
    </Flex>
  )
})
