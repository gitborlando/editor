import { FC, useEffect } from 'react'
import { UILeftPanelLayer } from '~/editor/ui-state/left-panel/layer'
import { EventWheel } from '~/global/event/wheel'
import { useHookSignal } from '~/shared/signal-react'
import { ScrollComp } from '~/view/editor/left-panel/panels/layer/node/scroll'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { NodeItemComp } from './item'

type INodeListComp = {}

export const NodeListComp: FC<INodeListComp> = ({}) => {
  const { classes } = useStyles({})
  const {
    nodeViewHeight,
    nodeListHeight,
    nodeScrollHeight,
    nodeScrollShift,
    nodeIdsInView,
    getNodeStatus,
    calcNodeListChange,
  } = UILeftPanelLayer
  useHookSignal(nodeIdsInView.hook)
  useHookSignal(() =>
    EventWheel.duringWheel.hook(({ direction }) => {
      nodeScrollHeight.dispatch(nodeScrollHeight.value + direction * 24)
    })
  )
  useEffect(() => calcNodeListChange(), [])
  return (
    <Flex layout='v' className={classes.NodeList} style={{ height: nodeViewHeight.value }}>
      <Flex
        layout='v'
        className={classes.list}
        style={{ transform: `translateY(-${nodeScrollShift.value}px)` }}
        onWheel={EventWheel.onWheel}>
        {[...nodeIdsInView.value].map((id) => {
          return <NodeItemComp key={id} id={id} {...getNodeStatus(id)!} />
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
}

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
