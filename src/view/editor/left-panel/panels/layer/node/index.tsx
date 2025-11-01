import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  DropAnimation,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState } from 'react'
import { UILeftPanelLayer } from 'src/editor/ui-state/left-panel/layer'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { EditorLPLayerState } from 'src/view/editor/left-panel/panels/layer/state'
import { EditorLeftPanelLayerNodeHeaderComp } from './header'
import { EditorLeftPanelLayerNodeItemComp } from './item'
import { EditorLeftPanelLayerNodeListComp } from './list'

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
}

export const EditorLeftPanelLayerNodeComp: FC<{}> = observer(({}) => {
  const { inViewNodeInfo, nodeMoveStarted, nodeMoveDropDetail } = UILeftPanelLayer
  const [activeId, setActiveId] = useState<string | null>(null)

  useHookSignal(inViewNodeInfo)
  useHookSignal(nodeMoveStarted)
  useHookSignal(nodeMoveDropDetail)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const nodeInfoArray = Array.from(inViewNodeInfo.value)
  const items = nodeInfoArray.map((info) => info.id)

  const handleDragStart = (event: any) => {
    const { active } = event
    setActiveId(active.id)
    nodeMoveStarted.dispatch({ moveId: active.id })
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    setActiveId(null)

    if (!over) {
      nodeMoveStarted.dispatch({ moveId: '' })
      return
    }

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) {
      nodeMoveStarted.dispatch({ moveId: '' })
      return
    }

    const activeNodeInfo = nodeInfoArray.find((info) => info.id === activeId)
    const overNodeInfo = nodeInfoArray.find((info) => info.id === overId)

    if (!activeNodeInfo || !overNodeInfo) {
      nodeMoveStarted.dispatch({ moveId: '' })
      return
    }

    const activeIndex = nodeInfoArray.indexOf(activeNodeInfo)
    const overIndex = nodeInfoArray.indexOf(overNodeInfo)

    let dropType: 'before' | 'in' | 'after' = 'before'

    if (overNodeInfo.indent < activeNodeInfo.indent) {
      dropType = 'in'
    } else if (
      overIndex < activeIndex &&
      overNodeInfo.indent === activeNodeInfo.indent
    ) {
      dropType = 'before'
    } else if (
      overIndex > activeIndex &&
      overNodeInfo.indent === activeNodeInfo.indent
    ) {
      dropType = 'after'
    }

    nodeMoveDropDetail.dispatch({ type: dropType, id: overId })
    UILeftPanelLayer.nodeMoveEnded.dispatch()
    nodeMoveStarted.dispatch({ moveId: '' })
  }

  const handleDragCancel = () => {
    setActiveId(null)
    nodeMoveStarted.dispatch({ moveId: '' })
  }

  const activeNodeInfo = activeId
    ? nodeInfoArray.find((info) => info.id === activeId)
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <G
          vertical='auto 1fr'
          className={cls()}
          style={{ height: innerHeight - 48 - EditorLPLayerState.pagePanelHeight }}>
          <EditorLeftPanelLayerNodeHeaderComp />
          <EditorLeftPanelLayerNodeListComp />
        </G>
      </SortableContext>
      <DragOverlay dropAnimation={dropAnimationConfig}>
        {activeNodeInfo && (
          <G style={{ opacity: 0.8 }}>
            <EditorLeftPanelLayerNodeItemComp nodeInfo={activeNodeInfo} />
          </G>
        )}
      </DragOverlay>
    </DndContext>
  )
})

const cls = classes(css`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`)
