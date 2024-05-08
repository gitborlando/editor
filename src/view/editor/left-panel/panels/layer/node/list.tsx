import { FC, memo } from 'react'
import { UILeftPanelLayer } from '~/editor/ui-state/left-panel/layer'
import { EventWheel } from '~/global/event/wheel'
import { useHookSignal } from '~/shared/signal/signal-react'
import { useAnimationFrame } from '~/shared/utils/react'
import { ScrollComp } from '~/view/editor/left-panel/panels/layer/node/scroll'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { NodeItemComp } from './item'

type INodeListComp = {}

export const NodeListComp: FC<INodeListComp> = memo(({}) => {
  const { classes } = useStyles({})
  const {
    nodeViewHeight,
    nodeListHeight,
    nodeScrollHeight,
    nodeScrollShift,
    inViewNodeInfo,
    calcNodeListChange2,
  } = UILeftPanelLayer
  useHookSignal(inViewNodeInfo)
  useHookSignal(EventWheel.duringWheel, ({ direction }) => {
    nodeScrollHeight.dispatch(nodeScrollHeight.value + direction * 24)
  })
  useAnimationFrame(calcNodeListChange2)

  return (
    <Flex layout='v' className={classes.NodeList} style={{ height: nodeViewHeight.value }}>
      <Flex
        layout='v'
        className={classes.list}
        style={{ transform: `translateY(-${nodeScrollShift.value}px)` }}
        onWheel={EventWheel.onWheel}>
        {[...inViewNodeInfo.value].map(({ id, indent, ancestors }) => {
          return <NodeItemComp key={id} id={id} indent={indent} ancestors={ancestors} />
        })}
      </Flex>
      {nodeListHeight.value > nodeViewHeight.value && (
        <ScrollComp
          viewHeight={nodeViewHeight.value}
          contentHeight={nodeListHeight.value}
          scrollHeight={nodeScrollHeight.value}
          hookScroll={nodeScrollHeight.dispatch}
        />
      )}
    </Flex>
  )
})

type INodeListCompStyle = {} /* & Required<Pick<INodeListComp>> */ /* & Pick<INodeListComp> */

const useStyles = makeStyles<INodeListCompStyle>()((t) => ({
  NodeList: {
    ...t.rect('100%', '100%'),
    overflow: 'hidden',
  },
  list: {
    ...t.rect('100%', '100%'),
  },
}))

NodeListComp.displayName = 'NodeListComp'
