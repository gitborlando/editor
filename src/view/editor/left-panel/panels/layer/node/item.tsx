import { Flex, Icon } from '@gitborlando/widget'
import { FC, SVGProps, useCallback } from 'react'
import { EditorCommand } from 'src/editor/editor/command'
import { OperateNode } from 'src/editor/operate/node'
import { Schema } from 'src/editor/schema/schema'
import { IIrregular, INode } from 'src/editor/schema/type'
import { getSelectIdMap } from 'src/editor/schema/y-clients'
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
import { Assets } from 'src/view/assets/assets'
import { CompositeInput } from 'src/view/ui-utility/widget/compositeInput'

type INodeItemComp = {
  id: string
  indent: number
  ancestors: string[]
}

export const NodeItemComp: FC<INodeItemComp> = ({ id, indent, ancestors }) => {
  const { nodeIdsInSearch, singleNodeExpanded, setSingleNodeExpanded } =
    UILeftPanelLayer
  const { nodeMoveDropDetail, nodeMoveStarted, nodeMoveEnded, enterReName } =
    UILeftPanelLayer
  const node = Schema.find<INode>(id)
  const expand = UILeftPanelLayer.getNodeExpanded(id)
  const selected = getSelectIdMap()[id]
  const subSelected = ancestors.some((i) => getSelectIdMap()[i]) && !selected
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
        layout='c'
        className=''
        onMouseDown={stopPropagation()}
        onClick={() => {
          setSingleNodeExpanded(id, !expand)
          singleNodeExpanded.dispatch(!expand)
        }}
        style={{ width: 8, cursor: 'pointer' }}>
        {children.length > 0 && (
          <Icon
            className='wh-8'
            style={{ scale: (8 / 9).toString(), rotate: expand ? '90deg' : '0deg' }}
            url={Assets.editor.leftPanel.node.collapse}
          />
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
          <path
            d={d}
            stroke='currentColor'
            strokeWidth={1}
            style={{ fill: 'none' }}
          />
        </svg>
      )
    })
    return (
      <Flex layout='c' className='px-6'>
        <Icon
          className='wh-12'
          style={{ scale: (12 / 10).toString() }}
          url={iife(() => {
            if (node.type === 'frame') return Assets.editor.node.frame
            if (node.type === 'text') return Assets.editor.node.text
            if (node.type === 'irregular') return PathSvgComp as any
            if (node.type === 'group') return null as any
            return Assets.editor.node[node.type as keyof typeof Assets.editor.node]
          })}
        />
      </Flex>
    )
  }, [])

  const LabelComp = useMemoComp([searched, id], ({}) => {
    return (
      <Flex
        style={{ width: '100%' }}
        className={cx([searched, 'text-hsl50'])}
        layout='h'
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
    // dropInFront.intercept((value) => !subSelected && value)
    // dropInSide.intercept((value) => {
    //   if (SchemaUtil.isById(id, 'nodeParent') && expand && selected) return false
    //   return value
    // })
    // dropBehind.intercept((value) => {
    //   if (SchemaUtil.isById(id, 'nodeParent') && expand && selected) return false
    //   return !subSelected && value
    // })
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
        className='wh-100%-32 absolute'
        style={{
          ...(!nodeMoveStarted.value.moveId && { pointerEvents: 'none' }),
          ...(dropInSide.value && {
            boxShadow: 'inset 0 0 0px 0.7px ' + hslBlueColor(50),
          }),
        }}>
        <Flex className='wh-100%' onHover={dropInFront.dispatch}>
          {dropInFront.value && (
            <Flex
              className='wh-100%-2 bg-hsl50 absolute pointer-events-none'
              style={{ paddingLeft: indent * 16 + 16 }}></Flex>
          )}
        </Flex>
        {isContainerNode && (
          <Flex className='wh-100%' onHover={dropInSide.dispatch}></Flex>
        )}
        <Flex layout='v' className='wh-100%' onHover={dropBehind.dispatch}>
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
    ['wh-100%-32 layer-floor:bg-white min-w-100% text-12 px-6 d-hover-border'],
    [!!nodeMoveStarted.value.moveId, ''],
    [subSelected, 'bg-hsl97'],
    [selected, 'bg-hsl94'],
  )

  return (
    <Flex
      layout='v'
      className='w-100% pointer'
      onHover={hovered.dispatch}
      onContextMenu={makeMenu}>
      <Flex layout='h' className={nodeItemCss} onMouseDown={handleMouseDown}>
        <Flex style={{ width: indent * 16 }}></Flex>
        <ExpandComp />
        <IconComp />
        <LabelComp />
        <DropAreaComp />
      </Flex>
    </Flex>
  )
}
