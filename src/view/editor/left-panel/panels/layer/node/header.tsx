import { FC } from 'react'
import { UILeftPanelLayer } from '~/editor/ui-state/left-panel/layer'
import { useHookSignal } from '~/shared/signal/signal-react'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

type INodeHeaderComp = {}

export const NodeHeaderComp: FC<INodeHeaderComp> = ({}) => {
  const { classes, cx } = useStyles({})
  const { allNodeExpanded, searchSlice } = UILeftPanelLayer
  const isCollapsed = allNodeExpanded.value === 'collapsed'
  useHookSignal(allNodeExpanded)
  useHookSignal(searchSlice)
  return (
    <Flex layout='h' shrink={0} className={cx(classes.NodeHeader, 'px-6')}>
      <input
        className={classes.input}
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
}

type INodeHeaderCompStyle = {} /* & Required<Pick<INodeHeaderComp>> */ /* & Pick<INodeHeaderComp> */

const useStyles = makeStyles<INodeHeaderCompStyle>()((t) => ({
  NodeHeader: {
    ...t.rect('100%', 32, 'no-radius', 'white'),
  },
  input: {
    ...t.rect('100%', 32, 'no-radius', 'white'),
    ...t.labelFont,
    outline: 'none',
    border: 'none',
  },
}))

NodeHeaderComp.displayName = 'NodeHeaderComp'
