import { useVirtualizer } from '@tanstack/react-virtual'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { EditorLeftPanelLayerNodeItemComp } from 'src/view/editor/left-panel/panels/layer/node/item'
import { EditorLPLayerNodeState } from 'src/view/editor/left-panel/panels/layer/node/state'

export const EditorLeftPanelLayerNodeListComp: FC<{}> = observer(({}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  useHookSignal(EditorLPLayerNodeState.nodeInfoChanged)

  const nodeInfoList = EditorLPLayerNodeState.getNodeInfoList()
  const virtualizer = useVirtualizer({
    count: nodeInfoList.length,
    overscan: 20,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 32,
    getItemKey: (index) => nodeInfoList[index].id,
  })

  return (
    <G ref={scrollRef} className={cls()}>
      <G style={{ height: nodeInfoList.length * 32 }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const nodeInfo = nodeInfoList[virtualItem.index]
          return (
            <G
              className={cls('item')}
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{ transform: `translateY(${virtualItem.start}px)` }}>
              <EditorLeftPanelLayerNodeItemComp nodeInfo={nodeInfo} />
            </G>
          )
        })}
      </G>
    </G>
  )
})

const cls = classes(css`
  width: 100%;
  position: relative;
  overflow-y: auto;
  min-height: 0;
  &-item {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 32px;
  }
`)
