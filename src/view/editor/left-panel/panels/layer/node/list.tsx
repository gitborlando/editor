import { useVirtualizer } from '@tanstack/react-virtual'
import Scrollbars from 'react-custom-scrollbars-2'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { EditorLeftPanelLayerNodeItemComp } from 'src/view/editor/left-panel/panels/layer/node/item'
import { EditorLPLayerNodeState } from 'src/view/editor/left-panel/panels/layer/node/state'

export const EditorLeftPanelLayerNodeListComp: FC<{}> = observer(({}) => {
  const scrollBarsRef = useRef<Scrollbars>(null)
  useHookSignal(EditorLPLayerNodeState.nodeInfoChanged)

  const nodeInfoList = EditorLPLayerNodeState.getNodeInfoList()
  const virtualizer = useVirtualizer({
    count: nodeInfoList.length,
    overscan: 20,
    estimateSize: () => 32,
    getItemKey: (index) => nodeInfoList[index].id,
    getScrollElement: () =>
      scrollBarsRef.current?.container?.firstElementChild || null,
  })

  return (
    <Scrollbars ref={scrollBarsRef} className={cls()}>
      <G style={{ height: nodeInfoList.length * 32 }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const nodeInfo = nodeInfoList[virtualItem.index]
          return (
            <G
              className={cls('item')}
              key={virtualItem.key}
              data-index={virtualItem.index}
              style={{ transform: `translateY(${virtualItem.start}px)` }}>
              <EditorLeftPanelLayerNodeItemComp nodeInfo={nodeInfo} />
            </G>
          )
        })}
      </G>
    </Scrollbars>
  )
})

const cls = classes(css`
  &-item {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 32px;
  }
`)
