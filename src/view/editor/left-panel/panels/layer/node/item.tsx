import { FC, SVGProps, useCallback } from 'react'
import { Editor } from '~/editor/editor/editor'
import { OperateNode } from '~/editor/operate/node'
import { Schema } from '~/editor/schema/schema'
import { IIrregular, INode } from '~/editor/schema/type'
import { StageSelect } from '~/editor/stage/interact/select'
import { UILeftPanelLayer } from '~/editor/ui-state/left-panel/layer'
import { Drag } from '~/global/event/drag'
import { Menu } from '~/global/menu'
import Immui from '~/shared/immui/immui'
import { useAutoSignal, useHookSignal } from '~/shared/signal/signal-react'
import { hslBlueColor } from '~/shared/utils/color'
import { stopPropagation } from '~/shared/utils/event'
import { IrregularUtils } from '~/shared/utils/irregular'
import { iife, noopFunc } from '~/shared/utils/normal'
import { useMemoComp } from '~/shared/utils/react'
import { SchemaUtil } from '~/shared/utils/schema'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { CompositeInput } from '~/view/ui-utility/widget/compositeInput'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

type INodeItemComp = {
  id: string
  indent: number
  ancestors: string[]
}

export const NodeItemComp: FC<INodeItemComp> = ({ id, indent, ancestors }) => {
  const { nodeIdsInSearch, singleNodeExpanded, setNodeExpanded } = UILeftPanelLayer
  const { nodeMoveDropDetail, nodeMoveStarted, nodeMoveEnded, enterReName } = UILeftPanelLayer
  const node = Schema.find<INode>(id)
  const { expand } = OperateNode.getNodeRuntime(id)
  const selected = OperateNode.selectIds.value.has(id)
  const subSelected = ancestors.some((i) => OperateNode.selectIds.value.has(i)) && !selected
  const searched = nodeIdsInSearch.value.has(id)
  const isContainerNode = SchemaUtil.isById(id, 'nodeParent')
  const children = SchemaUtil.getChildren(id)
  const hovered = useAutoSignal(false)
  const { classes, css, cx, theme } = useStyles({
    selected,
    subSelected,
    nodeMoving: !!nodeMoveStarted.value.moveId,
  })
  useHookSignal(OperateNode.selectIds)
  useHookSignal(nodeIdsInSearch)
  useHookSignal(hovered, (isHover) => {
    isHover ? OperateNode.hover(id) : OperateNode.unHover(id)
  })
  const handleMouseDown = () => {
    StageSelect.onPanelSelect(id)
    if (!enterReName.value) {
      Drag.onStart(() => nodeMoveStarted.dispatch({ moveId: id }))
        .onMove(noopFunc)
        .onDestroy(() => nodeMoveEnded.dispatch())
    }
  }
  const makeMenu = () => {
    const { nodeReHierarchyGroup, nodeGroup } = Editor.commands
    Menu.menuOptions.dispatch([nodeReHierarchyGroup, nodeGroup])
  }

  const ExpandComp = useMemoComp([expand], ({}) => {
    return (
      <Flex
        layout='c'
        onMouseDown={stopPropagation()}
        onClick={() => {
          setNodeExpanded(id, !expand)
          singleNodeExpanded.dispatch(!expand)
        }}
        style={{ width: 8, cursor: 'pointer' }}>
        {children.length > 0 && (
          <Icon size={8} scale={8 / 9} rotate={expand ? 90 : 0}>
            {Asset.editor.leftPanel.node.collapse}
          </Icon>
        )}
      </Flex>
    )
  })

  const IconComp: FC<{}> = useCallback(({}) => {
    const PathSvgComp = useMemoComp<SVGProps<SVGSVGElement>>([], (props) => {
      const instantNode = Schema.find<IIrregular>(node.id)
      const d = IrregularUtils.getNodeSvgPath(instantNode)
      useHookSignal(Editor.onReviewSchema, ({ path }, update) => {
        if (Immui.pathMatcher(path, `/${node.id}/points`)) update()
      })
      return (
        <svg width='20' height='20' viewBox='0 0 20 20' {...props}>
          <path d={d} stroke='currentColor' strokeWidth={1} style={{ fill: 'none' }} />
        </svg>
      )
    })
    return (
      <Flex layout='c' sidePadding={6}>
        <Icon size={12} scale={12 / 10}>
          {iife(() => {
            if (node.type === 'frame') return Asset.editor.node.frame
            if (node.type === 'text') return Asset.editor.node.text
            if (node.type === 'vector') {
              if (node.vectorType === 'irregular') return PathSvgComp
              return Asset.editor.node[node.vectorType as keyof typeof Asset.editor.node]
            }
          })}
        </Icon>
      </Flex>
    )
  }, [])

  const LabelComp = useMemoComp([searched, id], ({}) => {
    return (
      <Flex
        layout='h'
        style={{ width: '100%' }}
        className={cx(searched && classes.searched)}
        onDoubleClick={() => enterReName.dispatch(id)}>
        {enterReName.value === id ? (
          <CompositeInput
            type='text'
            needLabelDrag={false}
            needStepHandler={false}
            className={cx(classes.input, css({ padding: 0 }))}
            value={node.name}
            onNewValueApply={(value) => {
              node.name = value
              // Schema.afterReName.dispatch({ id: node.id, name: value })
            }}
            afterOperate={() => enterReName.dispatch('')}
            styles={{ needHover: false }}
          />
        ) : (
          <div>{node.name}</div>
        )}
      </Flex>
    )
  })

  const DropAreaComp = useMemoComp([subSelected, expand, selected], ({}) => {
    const dropInFront = useAutoSignal(false)
    const dropInSide = useAutoSignal(false)
    const dropBehind = useAutoSignal(false)
    dropInFront.intercept((value) => !subSelected && value)
    dropInSide.intercept((value) => {
      if (SchemaUtil.isById(id, 'nodeParent') && expand && selected) return false
      return value
    })
    dropBehind.intercept((value) => {
      if (SchemaUtil.isById(id, 'nodeParent') && expand && selected) return false
      return !subSelected && value
    })
    useHookSignal(dropInFront, (value) => {
      if (value === true) nodeMoveDropDetail.value = { id, type: 'before' }
    })
    useHookSignal(dropInSide, (value) => {
      if (value === true) nodeMoveDropDetail.value = { id, type: 'in' }
    })
    useHookSignal(dropBehind, (value) => {
      if (value === true) nodeMoveDropDetail.value = { id, type: 'after' }
    })

    return (
      <Flex
        layout='v'
        className={classes.dropArea}
        style={{
          ...(!nodeMoveStarted.value.moveId && { pointerEvents: 'none' }),
          ...(dropInSide.value && { ...theme.default$.active.boxShadow }),
        }}>
        <Flex className='dropLayer' onHover={dropInFront.dispatch}>
          {dropInFront.value && (
            <Flex className='dropLine' style={{ paddingLeft: indent * 16 + 16 }}></Flex>
          )}
        </Flex>
        {isContainerNode && <Flex className='dropLayer' onHover={dropInSide.dispatch}></Flex>}
        <Flex layout='v' className='dropLayer' onHover={dropBehind.dispatch}>
          {dropBehind.value && (
            <Flex className='dropLine' style={{ bottom: 0, paddingLeft: indent * 16 + 16 }}></Flex>
          )}
        </Flex>
      </Flex>
    )
  })

  return (
    <Flex layout='v' style={{ width: '100%' }} onHover={hovered.dispatch} onContextMenu={makeMenu}>
      <Flex layout='h' className={classes.NodeItem} onMouseDown={handleMouseDown}>
        <Flex className={css({ width: indent * 16 })}></Flex>
        <ExpandComp />
        <IconComp />
        <LabelComp />
        <DropAreaComp />
      </Flex>
    </Flex>
  )
}

type INodeItemCompStyle = {
  selected: boolean
  subSelected: boolean
  nodeMoving: boolean
} /* & Required<Pick<INodeItemComp>> */ /* & Pick<INodeItemComp> */

const useStyles = makeStyles<INodeItemCompStyle>()((t, { selected, subSelected, nodeMoving }) => ({
  NodeItem: {
    ...t.rect('100%', 32, 'no-radius', 'white'),
    minWidth: '100%',
    fontSize: 12,
    paddingInline: 6,
    ...(selected && { ...t.default$.select.background }),
    ...(subSelected && { backgroundColor: hslBlueColor(97) }),
    ...(!nodeMoving && t.default$.hover.border),
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
    '& .dropLayer': {
      ...t.rect('100%', '100%'),
    },
    '& .dropLine': {
      ...t.rect('100%', 2, 'no-radius', hslBlueColor(50)),
      ...t.absolute(),
      pointerEvents: 'none',
    },
  },
}))

NodeItemComp.displayName = 'NodeItemComp'
