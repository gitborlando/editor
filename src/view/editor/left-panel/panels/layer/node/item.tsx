import { FC, SVGProps, useCallback } from 'react'
import { editorCommands } from '~/editor/editor/command'
import { OperateNode } from '~/editor/operate/node'
import { Schema } from '~/editor/schema/schema'
import { IIrregular, INode } from '~/editor/schema/type'
import { StageSelect } from '~/editor/stage/interact/select'
import { UILeftPanelLayer } from '~/editor/ui-state/left-panel/layer'
import { Drag } from '~/global/event/drag'
import { Menu } from '~/global/menu'
import { useAutoSignal, useHookSignal } from '~/shared/signal/signal-react'
import { hslBlueColor } from '~/shared/utils/color'
import { stopPropagation } from '~/shared/utils/event'
import { IrregularUtils } from '~/shared/utils/irregular'
import { cx, iife, noopFunc } from '~/shared/utils/normal'
import { useMatchPatch, useMemoComp } from '~/shared/utils/react'
import { SchemaUtil } from '~/shared/utils/schema'
import Asset from '~/view/ui-utility/assets'
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
    const { nodeReHierarchyGroup, nodeGroup } = editorCommands
    Menu.menuOptions.dispatch([nodeReHierarchyGroup, nodeGroup])
  }

  const ExpandComp = useMemoComp([expand], ({}) => {
    return (
      <Flex
        className='lay-c'
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
        style={{ width: '100%' }}
        className={cx([searched, 'lay-h text-[hsl(217,100,50)]'])}
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
              className='wh-100%-2 bg-hslb50 absolute pointer-events-none'
              style={{ paddingLeft: indent * 16 + 16 }}></Flex>
          )}
        </Flex>
        {isContainerNode && <Flex className='wh-100%' onHover={dropInSide.dispatch}></Flex>}
        <Flex className='lay-v wh-100%' onHover={dropBehind.dispatch}>
          {dropBehind.value && (
            <Flex
              className='wh-100%-2 bg-hslb50 absolute pointer-events-none'
              style={{ bottom: 0, paddingLeft: indent * 16 + 16 }}></Flex>
          )}
        </Flex>
      </Flex>
    )
  })

  const nodeItemCss = cx(
    ['lay-h wh-100%-32 layer-floor:bg-white min-w-100% text-12 px-6 d-hover-border'],
    [!!nodeMoveStarted.value.moveId, ''],
    [subSelected, 'bg-hslb97'],
    [selected, 'bg-hslb94']
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
