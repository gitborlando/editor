import { Flex, Icon } from '@gitborlando/widget'
import { FC, memo } from 'react'
import { UILeftPanelLayer } from 'src/editor/ui-state/left-panel/layer'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { Button } from 'src/view/ui-utility/widget/button'

type INodeHeaderComp = {}

export const NodeHeaderComp: FC<INodeHeaderComp> = memo(({}) => {
  const { allNodeExpanded, searchSlice } = UILeftPanelLayer
  const isCollapsed = allNodeExpanded.value === 'collapsed'
  useHookSignal(allNodeExpanded)
  useHookSignal(searchSlice)

  return (
    <Flex layout='h' className='shrink-0 px-10 wh-100%-32 bg-white'>
      <input
        className='wh-100%-32 bg-white labelFont outline-none border-none'
        placeholder='搜索'
        value={searchSlice.value}
        onChange={(e) => {
          searchSlice.dispatch(e.target.value)
        }}></input>
      <Button
        type='icon'
        style={{ marginLeft: 'auto' }}
        onClick={() => allNodeExpanded.dispatch(isCollapsed ? 'expanded' : 'collapsed')}>
        <Icon
          className='wh-16'
          style={{ rotate: isCollapsed ? '0deg' : '180deg' }}
          url={Assets.editor.leftPanel.node.collapse}
        />
      </Button>
    </Flex>
  )
})
