import { FC, memo, useRef } from 'react'
import { IEditorCommand } from 'src/editor/editor/command'
import { onSettingsChanged } from 'src/editor/editor/settings'
import { IStageCreateType, StageCreate } from 'src/editor/stage/interact/create'
import { StageInteract } from 'src/editor/stage/interact/interact'
import { StageViewport } from 'src/editor/stage/viewport'
import { Menu } from 'src/global/menu'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { stopPropagation } from 'src/shared/utils/event'
import { useMemoComp } from 'src/shared/utils/react'
import Asset from 'src/view/ui-utility/assets'
import { Button } from 'src/view/ui-utility/widget/button'
import { Divide } from 'src/view/ui-utility/widget/divide'
import { Flex } from 'src/view/ui-utility/widget/flex'
import { Icon } from 'src/view/ui-utility/widget/icon'

type IMenuComp = {}

export const MenuComp: FC<IMenuComp> = memo(({}) => {
  const { setRef, xy, menuOptions, closeMenu } = Menu
  useHookSignal(menuOptions)
  useHookSignal(xy)

  const MenuItemComp = useMemoComp<{ item: IEditorCommand }>([], ({ item }) => {
    return (
      <Flex
        id='menu'
        className='lay-h wh-100%-30-2 pointer normalFont px-8 hover:(bg-hslb93)'
        onMouseDown={stopPropagation(() => void item.callback() || closeMenu())}>
        <Flex>{item.name}</Flex>
        <Flex className='ml-auto'>{item.shortcut}</Flex>
      </Flex>
    )
  })

  const DivideComp = useMemoComp([], ({}) => {
    return <Divide direction='h' length='100%' margin={4} bgColor='rgba(0,0,0,0.05)' />
  })

  const MenuOptionsComp = useMemoComp([menuOptions.value], ({}) => {
    return (
      <Flex className='lay-v wh-200-100%'>
        {menuOptions.value.map((group, groupIndex) => {
          const menuGroup = group.map((item, index) => <MenuItemComp key={index} item={item} />)
          if (groupIndex !== menuOptions.value.length - 1)
            menuGroup.push(<DivideComp key={Math.random()} />)
          return menuGroup
        })}
      </Flex>
    )
  })

  const { menuShowTopTab } = useHookSignal(onSettingsChanged)
  const showTopTab = menuShowTopTab && StageViewport.inViewport(xy.value)

  const TopTabComp = useMemoComp([], ({}) => {
    const ref = useRef<HTMLDivElement>(null)
    return (
      <Flex
        ref={ref}
        className='lay-h wh-200-fit pb-2 menu-scroll of-x-auto of-y-hidden'
        onWheel={(e) => {
          ref.current?.scrollTo({ left: ref.current.scrollLeft + e.deltaY, behavior: 'auto' })
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
          StageInteract.currentType.dispatch(type)
          closeMenu()
        }}>
        <Icon size={16}>{Asset.editor.header.stageOperate[type]}</Icon>
      </Button>
    )
  }

  const CreateShapeIcon: FC<{ type: IStageCreateType }> = ({ type }) => {
    const isActive =
      StageInteract.currentType.value === 'create' && StageCreate.currentType.value === type
    return (
      <Button
        active={isActive}
        onMouseDown={(e) => {
          StageInteract.currentType.dispatch('create')
          StageCreate.currentType.dispatch(type)
          closeMenu()
        }}>
        <Icon size={16} className={isActive ? 'path-fill-hslb60' : ''}>
          {Asset.editor.node[type as keyof typeof Asset.editor.node]}
        </Icon>
      </Button>
    )
  }

  return (
    <Flex
      ref={setRef}
      vshow={menuOptions.value.length > 0}
      className='lay-v w-200-fit-2 rounded-3 bg-white p-6 fixed z-999 shadow-4-0-rgba(0,0,0,0.15)'
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
