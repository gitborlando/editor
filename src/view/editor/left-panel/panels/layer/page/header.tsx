import { FC, memo } from 'react'
import { OperatePage } from '~/editor/operate/page'
import { UILeftPanelLayer } from '~/editor/ui-state/left-panel/layer'
import { useHookSignal } from '~/shared/signal/signal-react'
import { useMatchPatch } from '~/shared/utils/react'
import Asset from '~/view/ui-utility/assets'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

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
    <Flex className='lay-h shrink-0 wh-100%-32 bg-white px-6'>
      <Flex className='lay-c labelFont pl-6'>{OperatePage.currentPage.name}</Flex>
      <Button type='icon' style={{ marginLeft: 'auto' }} onClick={newPage}>
        <Icon className='path-fill-#393939' size={16}>
          {Asset.editor.leftPanel.page.add}
        </Icon>
      </Button>
      <Button type='icon' onClick={() => allPageExpanded.dispatch(!allPageExpanded.value)}>
        <Icon className='path-fill-#393939' size={16} rotate={allPageExpanded.value ? 180 : 0}>
          {Asset.editor.leftPanel.page.collapse}
        </Icon>
      </Button>
    </Flex>
  )
})
