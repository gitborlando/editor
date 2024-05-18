import { FC, memo } from 'react'
import { UILeftPanelLayer } from '~/editor/ui-state/left-panel/layer'
import { EventWheel } from '~/global/event/wheel'
import { useHookSignal } from '~/shared/signal/signal-react'
import { useAnimationFrame } from '~/shared/utils/react'
import { ScrollComp } from '~/view/editor/left-panel/panels/layer/node/scroll'
import { Flex } from '~/view/ui-utility/widget/flex'
import { NodeItemComp } from './item'

type INodeListComp = {}

export const NodeListComp: FC<INodeListComp> = memo(({}) => {
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
    <Flex className='lay-v wh-100% of-hidden relative' style={{ height: nodeViewHeight.value }}>
      <Flex
        className='lay-v wh-100%'
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
