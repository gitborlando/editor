import { FC, useCallback } from 'react'
import { SchemaNode } from '~/editor/schema/node'
import { SchemaUtil } from '~/editor/schema/util'
import { StageSelect } from '~/editor/stage/interact/select'
import { ILeftPanelNodeStatus, UILeftPanelLayer } from '~/editor/ui-state/left-panel/layer'
import { Drag } from '~/global/drag'
import { Signal } from '~/shared/signal'
import { useAutoSignal, useHookSignal } from '~/shared/signal-react'
import { hslBlueColor } from '~/shared/utils/color'
import { noopFunc, stopPropagation } from '~/shared/utils/normal'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

type INodeItemComp = ILeftPanelNodeStatus & {
  id: string
}

export const NodeItemComp: FC<INodeItemComp> = ({ id, expanded, indent, ancestors }) => {
  const {
    nodeIdsInSearch,
    singleNodeExpanded,
    nodeIdsInView,
    setNodeExpanded,
    nodeMoveDropDetail,
    nodeMoveStarted,
    nodeMoveEnded,
  } = UILeftPanelLayer
  const node = SchemaNode.find(id)
  const selected = SchemaNode.selectIds.value.has(id)
  const subSelected = ancestors.some((i) => SchemaNode.selectIds.value.has(i)) && !selected
  const searched = nodeIdsInSearch.value.has(id)
  const isContainerNode = SchemaUtil.isContainerNode(id)
  const childIds = SchemaUtil.getChildIds(id)
  const hovered = useAutoSignal(false)
  const enterEdit = useAutoSignal(false)
  const duringEdit = useAutoSignal(false)
  const dropInFront = useAutoSignal(false)
  const dropInSide = useAutoSignal(false)
  const dropBehind = useAutoSignal(false)
  dropInFront.intercept((value) => !subSelected && value)
  dropInSide.intercept((value) => {
    if (SchemaUtil.isContainerNode(id) && expanded && selected) return false
    return value
  })
  dropBehind.intercept((value) => {
    if (SchemaUtil.isContainerNode(id) && expanded && selected) return false
    return !subSelected && value
  })
  useHookSignal(nodeIdsInView.hook)
  useHookSignal(() =>
    hovered.hook((isHover) => {
      isHover ? SchemaNode.hover(id) : SchemaNode.unHover(id)
      SchemaNode.hoverIds.dispatch()
      if (isHover && nodeMoveStarted.value.moveId) {
        if (dropInFront.value === true) nodeMoveDropDetail.value = { id, type: 'before' }
        if (dropInSide.value === true) nodeMoveDropDetail.value = { id, type: 'in' }
        if (dropBehind.value === true) nodeMoveDropDetail.value = { id, type: 'after' }
      }
    })
  )
  useHookSignal((forceUpdate) =>
    SchemaNode.beforeDelete.hook(({ parentId }) => {
      if (parentId === id) forceUpdate()
      if (SchemaUtil.isPage(parentId)) forceUpdate()
    })
  )
  const handleMouseDown = useCallback(() => {
    StageSelect.onPanelSelect(id)
    Drag.onStart(() => nodeMoveStarted.dispatch({ moveId: id }))
      .onMove(noopFunc)
      .onDestroy(() => nodeMoveEnded.dispatch())
  }, [])
  useHookSignal(() => {
    nodeMoveEnded.hook(() => (nodeMoveStarted.value.moveId = ''))
  })
  const { classes, css, cx } = useStyles({ selected, subSelected, dropInSide })
  return (
    <Flex layout='v' className={css({ width: '100%' })} onHover={hovered.dispatch}>
      <Flex layout='h' className={classes.NodeItem} onMouseDown={handleMouseDown}>
        <Flex className={css({ width: indent * 16 })}></Flex>
        <Flex
          layout='c'
          onMouseDown={stopPropagation}
          onClick={() => {
            setNodeExpanded(id, !expanded)
            singleNodeExpanded.dispatch(!expanded)
          }}
          style={{ width: 8, cursor: 'pointer' }}>
          {childIds.length > 0 && (
            <Icon size={8} scale={8 / 9} rotate={expanded ? 90 : 0}>
              {Asset.editor.leftPanel.node.collapse}
            </Icon>
          )}
        </Flex>
        <Flex layout='c' sidePadding={6}>
          <Icon size={12} scale={12 / 10}>
            {(() => {
              if (node.type === 'frame') return Asset.editor.node.frame
              if (node.type === 'vector') {
                if (node.vectorType === 'rect') return Asset.editor.node.rect
                if (node.vectorType === 'triangle') return Asset.editor.node.triangle
              }
            })()}
          </Icon>
        </Flex>
        <Flex layout='h' justify='space-between' style={{ width: '100%' }}>
          <Flex
            layout='h'
            className={cx(searched && classes.searched)}
            onDoubleClick={() => enterEdit.dispatch(true)}>
            {enterEdit.value ? (
              <input
                ref={(el) => {
                  el?.focus()
                  el?.setSelectionRange(0, node.name.length)
                }}
                className={classes.input}
                value={node.name}
                onChange={(e) => {
                  node.name = e.target.value
                  duringEdit.dispatch()
                }}
                onBlur={() => enterEdit.dispatch(false)}></input>
            ) : (
              <div>{node.name}</div>
            )}
          </Flex>
          {hovered.value && (
            <Button onMouseDown={stopPropagation} onClick={() => SchemaNode.delete(id)}>
              <Icon size={12}>{Asset.editor.shared.delete}</Icon>
            </Button>
          )}
        </Flex>
      </Flex>
      <Flex
        layout='v'
        className={classes.dropArea}
        style={{ ...(!nodeMoveStarted.value.moveId && { pointerEvents: 'none' }) }}>
        {dropInFront.value && (
          <Flex
            className='dropLine'
            style={{ paddingLeft: indent * 16 + 16, transform: 'translateY(-0.5px)' }}>
            <Flex className='line'></Flex>
          </Flex>
        )}
        <Flex className='dropLayer' onHover={dropInFront.dispatch}></Flex>
        {isContainerNode && <Flex className='dropLayer' onHover={dropInSide.dispatch}></Flex>}
        <Flex layout='v' className='dropLayer' onHover={dropBehind.dispatch}></Flex>
        {dropBehind.value && (
          <Flex
            className='dropLine'
            style={{ bottom: 0, paddingLeft: indent * 16 + 16, transform: 'translateY(0.5px)' }}>
            <Flex className='line'></Flex>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}

type INodeItemCompStyle = {
  selected: boolean
  subSelected: boolean
  dropInSide: Signal<boolean>
} /* & Required<Pick<INodeItemComp>> */ /* & Pick<INodeItemComp> */

const useStyles = makeStyles<INodeItemCompStyle>()((t, { selected, subSelected, dropInSide }) => ({
  NodeItem: {
    ...t.rect('100%', 32, 'no-radius', 'white'),
    minWidth: '100%',
    fontSize: 12,
    paddingInline: 6,
    ...(selected && { ...t.default$.select.background }),
    // ...(subSelected && { backgroundColor: '#F4EFFF' }),
    ...(subSelected && { backgroundColor: hslBlueColor(97) }),
    ...t.default$.hover.border,
  },
  input: {
    ...t.rect('100%', 'fit-content', 'no-radius', 'transparent'),
    fontSize: 12,
    outline: 'none',
    border: 'none',
  },
  searched: {
    ...t.default$.active.font,
  },
  dropArea: {
    ...t.rect('100%', 32),
    ...t.absolute(),
    ...(dropInSide.value && { ...t.default$.active.border }),
    '& .dropLayer': {
      ...t.rect('100%', '100%'),
    },
    '& .dropLine': {
      ...t.rect('100%', 1),
      pointerEvents: 'none',
      '& .line': {
        ...t.rect('100%', 1, 'no-radius', hslBlueColor(50)),
      },
    },
  },
}))

NodeItemComp.displayName = 'NodeItemComp'
