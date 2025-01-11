import { FC, SVGProps, useCallback } from 'react'
import { EditorCommand } from 'src/editor/editor/command'
import { OperateNode } from 'src/editor/operate/node'
import { Schema } from 'src/editor/schema/schema'
import { IIrregular, INode } from 'src/editor/schema/type'
import { StageSelect } from 'src/editor/stage/interact/select'
import { UILeftPanelLayer } from 'src/editor/ui-state/left-panel/layer'
import { Drag } from 'src/global/event/drag'
import { Menu } from 'src/global/menu'
import { useAutoSignal, useHookSignal } from 'src/shared/signal/signal-react'
import { hslBlueColor } from 'src/shared/utils/color'
import { stopPropagation } from 'src/shared/utils/event'
import { IrregularUtils } from 'src/shared/utils/irregular'
import { cx, iife, noopFunc } from 'src/shared/utils/normal'
import { useMatchPatch, useMemoComp } from 'src/shared/utils/react'
import { SchemaUtil } from 'src/shared/utils/schema'
import Asset from 'src/view/ui-utility/assets'
import { CompositeInput } from 'src/view/ui-utility/widget/compositeInput'
import { Flex } from 'src/view/ui-utility/widget/flex'
import { Icon } from 'src/view/ui-utility/widget/icon'

type INodeItemComp = {
  id: string
  indent: number
  ancestors: string[]
}

export const NodeItemComp: FC<INodeItemComp> = ({ id, indent, ancestors }) => {
  const { nodeIdsInSearch, singleNodeExpanded, setSingleNodeExpanded } = UILeftPanelLayer
  const { nodeMoveDropDetail, nodeMoveStarted, nodeMoveEnded, enterReName } = UILeftPanelLayer
  const node = Schema.find<INode>(id)
  const expand = UILeftPanelLayer.getNodeExpanded(id)
  const selected = Schema.client.selectIds.includes(id)
  const subSelected = ancestors.some((i) => Schema.client.selectIds.includes(i)) && !selected
  const searched = nodeIdsInSearch.value.has(id)
  const isContainerNode = SchemaUtil.isById(id, 'nodeParent')
  const children = SchemaUtil.getChildren(id)
  const hovered = useAutoSignal(false)

  useHookSignal(nodeIdsInSearch)
  useHookSignal(hovered, (isHover) => {
    isHover && OperateNode.hoverId$.dispatch(id)
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
    const { nodeReHierarchyGroup, nodeGroup } = EditorCommand
    Menu.context = { id }
    Menu.menuOptions.dispatch([nodeReHierarchyGroup, nodeGroup])
  }

  useMatchPatch(`/client/selectIds`)

  const ExpandComp = useMemoComp([expand], ({}) => {
    return (
      <Flex
        className='lay-c'
        onMouseDown={stopPropagation()}
        onClick={() => {
          setSingleNodeExpanded(id, !expand)
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
      useMatchPatch(`/${node.id}/points`)
      return (
        <svg width='20' height='20' viewBox='0 0 20 20' {...props}>
          <path d={d} stroke='currentColor' strokeWidth={1} style={{ fill: 'none' }} />
        </svg>
      )
    })
    return (
      <Flex className='lay-c px-6'>
        <Icon size={12} scale={12 / 10}>
          {iife(() => {
            if (node.type === 'frame') return Asset.editor.node.frame
            if (node.type === 'text') return Asset.editor.node.text
            if (node.type === 'irregular') return PathSvgComp
            if (node.type === 'group') return () => null
            return Asset.editor.node[node.type as keyof typeof Asset.editor.node]
          })}
        </Icon>
      </Flex>
    )
  }, [])

  const LabelComp = useMemoComp([searched, id], ({}) => {
    return (
      <Flex
        style={{ width: '100%' }}
        className={cx([searched, 'lay-h text-hsl50'])}
        onDoubleClick={() => enterReName.dispatch(id)}>
        {enterReName.value === id ? (
          <CompositeInput
            type='text'
            needLabelDrag={false}
            needStepHandler={false}
            className='p-0 wh-100%-fit bg-transparent outline-none border-none text-12'
            value={node.name}
            onNewValueApply={(value) => {
              node.name = value
              // Schema.afterReName.dispatch({ id: node.id, name: value })
            }}
            afterOperate={() => enterReName.dispatch('')}
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
        className='lay-v wh-100%-32 absolute'
        style={{
          ...(!nodeMoveStarted.value.moveId && { pointerEvents: 'none' }),
          ...(dropInSide.value && { boxShadow: 'inset 0 0 0px 0.7px ' + hslBlueColor(50) }),
        }}>
        <Flex className='wh-100%' onHover={dropInFront.dispatch}>
          {dropInFront.value && (
            <Flex
              className='wh-100%-2 bg-hsl50 absolute pointer-events-none'
              style={{ paddingLeft: indent * 16 + 16 }}></Flex>
          )}
        </Flex>
        {isContainerNode && <Flex className='wh-100%' onHover={dropInSide.dispatch}></Flex>}
        <Flex className='lay-v wh-100%' onHover={dropBehind.dispatch}>
          {dropBehind.value && (
            <Flex
              className='wh-100%-2 bg-hsl50 absolute pointer-events-none'
              style={{ bottom: 0, paddingLeft: indent * 16 + 16 }}></Flex>
          )}
        </Flex>
      </Flex>
    )
  })

  const nodeItemCss = cx(
    ['lay-h wh-100%-32 layer-floor:bg-white min-w-100% text-12 px-6 d-hover-border'],
    [!!nodeMoveStarted.value.moveId, ''],
    [subSelected, 'bg-hsl97'],
    [selected, 'bg-hsl94']
  )

  return (
    <Flex className='lay-v w-100% pointer' onHover={hovered.dispatch} onContextMenu={makeMenu}>
      <Flex className={nodeItemCss} onMouseDown={handleMouseDown}>
        <Flex style={{ width: indent * 16 }}></Flex>
        <ExpandComp />
        <IconComp />
        <LabelComp />
        <DropAreaComp />
      </Flex>
    </Flex>
  )
}
