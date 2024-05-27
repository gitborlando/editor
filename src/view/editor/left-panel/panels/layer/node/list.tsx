import { FC, memo } from 'react'
import { UILeftPanelLayer } from 'src/editor/ui-state/left-panel/layer'
import { EventWheel } from 'src/global/event/wheel'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { ScrollComp } from 'src/view/editor/left-panel/panels/layer/node/scroll'
import { Flex } from 'src/view/ui-utility/widget/flex'
import { NodeItemComp } from './item'

type INodeListComp = {}

export const NodeListComp: FC<INodeListComp> = memo(({}) => {
  const { nodeViewHeight, nodeListHeight, nodeScrollHeight, nodeScrollShift, inViewNodeInfo } =
    UILeftPanelLayer
  useHookSignal(inViewNodeInfo)
  useHookSignal(EventWheel.duringWheel, ({ direction }) => {
    nodeScrollHeight.dispatch(nodeScrollHeight.value + direction * 96)
  })

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
