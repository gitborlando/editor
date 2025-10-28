import { Flex, Icon } from '@gitborlando/widget'
import { FC, useRef } from 'react'
import { IEditorCommand } from 'src/editor/editor/command'
import { EditorSetting } from 'src/editor/editor/setting'
import { IStageCreateType, StageCreate } from 'src/editor/stage/interact/create'
import { StageInteract } from 'src/editor/stage/interact/interact'
import { StageViewport } from 'src/editor/stage/viewport'
import { Menu } from 'src/global/menu'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { stopPropagation } from 'src/shared/utils/event'
import { useMemoComp } from 'src/shared/utils/react'
import { Button } from 'src/view/ui-utility/widget/button'
import { Divide } from 'src/view/ui-utility/widget/divide'

type IMenuComp = {}

export const MenuComp: FC<IMenuComp> = observer(({}) => {
  const { setRef, xy, menuOptions, closeMenu } = Menu
  useHookSignal(menuOptions)
  useHookSignal(xy)

  const MenuItemComp = useMemoComp<{ item: IEditorCommand }>([], ({ item }) => {
    return (
      <Flex
        id='menu'
        className='lay-h wh-100%-30 r-2 pointer normalFont px-8 hover:(bg-hsl93)'
        onMouseDown={stopPropagation(() => {
          item.callback()
          closeMenu()
        })}>
        <Flex>{item.name}</Flex>
        <Flex className='ml-auto'>{item.shortcut}</Flex>
      </Flex>
    )
  })

  const DivideComp = useMemoComp([], ({}) => {
    return (
      <Divide direction='h' length='100%' margin={4} bgColor='rgba(0,0,0,0.05)' />
    )
  })

  const MenuOptionsComp = useMemoComp([menuOptions.value], ({}) => {
    return (
      <Flex className='lay-v wh-200-100%'>
        {menuOptions.value.map((group, groupIndex) => {
          const menuGroup = group.map((item, index) => (
            <MenuItemComp key={index} item={item} />
          ))
          if (groupIndex !== menuOptions.value.length - 1)
            menuGroup.push(<DivideComp key={Math.random()} />)
          return menuGroup
        })}
      </Flex>
    )
  })

  const menuShowTopTab = EditorSetting.setting.menuShowTopTab
  const showTopTab = menuShowTopTab && StageViewport.inViewport(xy.value)

  const TopTabComp = useMemoComp([], ({}) => {
    const ref = useRef<HTMLDivElement>(null)
    return (
      <Flex
        ref={ref}
        className='lay-h wh-200-fit pb-2 menu-scroll of-x-auto of-y-hidden'
        onWheel={(e) => {
          ref.current?.scrollTo({
            left: ref.current.scrollLeft + e.deltaY,
            behavior: 'auto',
          })
        }}>
        {(['select', 'move'] as const).map((type) => (
          <StageOperateIcon key={type} type={type} />
        ))}
        <Divide length={16} thickness={0.5} />
        {StageCreate.createTypes.map((type) => (
          <CreateShapeIcon key={type} type={type} />
        ))}
      </Flex>
    )
  })

  const StageOperateIcon: FC<{ type: 'select' | 'move' }> = ({ type }) => {
    return (
      <Button
        onMouseDown={() => {
          StageInteract.interaction = type
          closeMenu()
        }}>
        <Icon className='wh-16' url={Assets.editor.header.stageOperate[type]} />
      </Button>
    )
  }

  const CreateShapeIcon: FC<{ type: IStageCreateType }> = ({ type }) => {
    const isActive =
      StageInteract.interaction === 'create' &&
      StageCreate.currentType.value === type
    return (
      <Button
        active={isActive}
        onMouseDown={(e) => {
          StageInteract.interaction = 'create'
          StageCreate.currentType.dispatch(type)
          closeMenu()
        }}>
        <Icon
          className='wh-16'
          url={Assets.editor.node[type as keyof typeof Assets.editor.node]}
        />
      </Button>
    )
  }

  return (
    <Flex
      ref={setRef}
      vif={menuOptions.value.length > 0}
      className='lay-v wh-200-fit r-2 bg-white p-6 fixed z-999 shadow-0-0-4-0-hsl0/15'
      style={{ left: xy.value.x + 5, top: xy.value.y + 5 }}>
      {menuShowTopTab && showTopTab && (
        <>
          <TopTabComp />
          <DivideComp />
        </>
      )}
      <MenuOptionsComp />
    </Flex>
  )
})
