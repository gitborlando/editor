import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { stopPropagation } from '@gitborlando/utils/browser'
import { Icon } from '@gitborlando/widget'
import { ChevronRight } from 'lucide-react'
import { EditorCommand } from 'src/editor/editor/command'
import { SchemaHelper } from 'src/editor/schema/helper'
import { StageSelect } from 'src/editor/stage/interact/select'
import { ContextMenu } from 'src/global/context-menu'
import {
  EditorLPLayerNodeInfo,
  EditorLPLayerNodeState,
} from 'src/view/editor/left-panel/panels/layer/node/state'
import { useSelectIdMap } from 'src/view/hooks/schema/use-y-client'

export const EditorLeftPanelLayerNodeItemComp: FC<{
  nodeInfo: EditorLPLayerNodeInfo
}> = observer(({ nodeInfo }) => {
  const { id, indent, ancestors } = nodeInfo
  const { toggleNodeExpanded, getNodeExpanded } = EditorLPLayerNodeState
  const node = YState.findSnap<V1.Node>(id)
  const isParent = SchemaHelper.isNodeParent(node)
  const expanded = getNodeExpanded(id)
  const selected = useSelectIdMap()[id]
  const subSelected = ancestors.some((ancestor) => useSelectIdMap()[ancestor])

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: false })

  const handleToggleExpand = stopPropagation(() => {
    toggleNodeExpanded(id, !expanded)
  })
  const handleSelect = () => {
    StageSelect.onPanelSelect(id)
  }
  const handleDoubleClick = () => {
    StageSelect.onPanelSelect(id)
    toggleNodeExpanded(id, true)
  }
  const handleContextMenu = (e: React.MouseEvent) => {
    ContextMenu.context = { id }
    ContextMenu.menus = [EditorCommand.nodeGroup]
    ContextMenu.openMenu(e)
  }

  return (
    <G
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        paddingLeft: 8 + indent * 12,
      }}
      gap={4}
      {...attributes}
      horizontal='auto auto 1fr auto'
      center
      data-selected={selected}
      data-sub-selected={subSelected}
      data-dragging={isDragging}
      className={cls()}
      onClick={handleSelect}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}>
      <Lucide
        size={14}
        icon={ChevronRight}
        x-if={isParent}
        onClick={handleToggleExpand}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}
      />
      {!isParent && <G style={{ width: 12, height: 12 }} />}
      <Icon
        url={
          Assets.editor.node[node.type as keyof typeof Assets.editor.node]
        }></Icon>
      <G className={cls('name')} {...listeners} style={{ flex: 1, minWidth: 0 }}>
        {node.name || '未命名'}
      </G>
    </G>
  )
})

const cls = classes(css`
  width: 100%;
  height: 32px;
  cursor: pointer;
  ${styles.needBorder}
  ${styles.textLabel}
  ${styles.borderHoverPrimary}
  &[data-selected='true'] {
    ${styles.bgPrimary}
  }
  &[data-sub-selected='true'] {
    background-color: var(--color-bg-half);
  }
  &[data-dragging='true'] {
    opacity: 0.5;
  }
  &-indent {
    flex: 1;
    min-width: 0;
    gap: 4px;
  }
  &-expand {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  &-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &-check {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--color);
  }
`)
