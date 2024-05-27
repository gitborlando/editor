import { FC, memo } from 'react'
import { UILeftPanelLayer } from 'src/editor/ui-state/left-panel/layer'
import { useHookSignal } from 'src/shared/signal/signal-react'
import Asset from 'src/view/ui-utility/assets'
import { Button } from 'src/view/ui-utility/widget/button'
import { Flex } from 'src/view/ui-utility/widget/flex'
import { Icon } from 'src/view/ui-utility/widget/icon'

type INodeHeaderComp = {}

export const NodeHeaderComp: FC<INodeHeaderComp> = memo(({}) => {
  const { allNodeExpanded, searchSlice } = UILeftPanelLayer
  const isCollapsed = allNodeExpanded.value === 'collapsed'
  useHookSignal(allNodeExpanded)
  useHookSignal(searchSlice)

  return (
    <Flex className='lay-h shrink-0 px-10 wh-100%-32 bg-white'>
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
        <Icon size={16} rotate={isCollapsed ? 0 : 180}>
          {Asset.editor.leftPanel.page.collapse}
        </Icon>
      </Button>
    </Flex>
  )
})
