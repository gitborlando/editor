import { FC, memo } from 'react'
import { Editor } from 'src/editor/editor/editor'
import { Signal } from 'src/shared/signal/signal'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { useMemoComp } from 'src/shared/utils/react'
import { Flex } from 'src/view/ui-utility/widget/flex'

type ISettingComp = {}

export const SettingComp: FC<ISettingComp> = memo(({}) => {
  const { autosave, showFPS, devMode, ignoreUnVisible, menuShowTopTab, needSliceRender } =
    Editor.settings

  useHookSignal(autosave)
  useHookSignal(showFPS)
  useHookSignal(devMode)
  useHookSignal(menuShowTopTab)
  useHookSignal(ignoreUnVisible)
  useHookSignal(needSliceRender)

  const toggle = (signal: Signal<boolean>) => {
    return () => signal.dispatch(!signal.value)
  }

  const ToggleItemComp = useMemoComp<{
    label: string
    active: boolean
    toggle: (a: boolean) => void
  }>([], ({ label, active, toggle }) => {
    return (
      <Flex className={'lay-h wh-100%-40 px-10'}>
        <Flex className={'lay-c normalFont'}>{label}</Flex>
        <SwitchComp active={active} toggle={toggle} classes={['ml-auto']} />
      </Flex>
    )
  })

  const SwitchComp = useMemoComp<{
    active: boolean
    toggle: (a: boolean) => void
    classes?: string[]
  }>([], ({ active, toggle, classes }) => {
    const activeCss = active
      ? ['b-1-#d7d7d7', 'ml-auto bg-hslb70']
      : ['b-1-#d7d7d7', 'mr-auto bg-[#d7d7d7]']
    return (
      <Flex
        className={`lay-h wh-40-20-99 px-4 pointer ${activeCss[0]} ${classes?.[0]}`}
        onClick={() => toggle(!active)}>
        <Flex className={`lay-c wh-12-12-99 ${activeCss[1]} ${classes?.[1]}`}></Flex>
      </Flex>
    )
  })

  return (
    <Flex className={'lay-v wh-100%-fit bg-white'}>
      <ToggleItemComp label='自动保存' active={autosave.value} toggle={toggle(autosave)} />
      <ToggleItemComp label='开发模式' active={devMode.value} toggle={toggle(devMode)} />
      <ToggleItemComp
        label='不渲染不可辨认的节点'
        active={ignoreUnVisible.value}
        toggle={toggle(ignoreUnVisible)}
      />
      <ToggleItemComp
        label='缩放时进行分片渲染优化'
        active={needSliceRender.value}
        toggle={toggle(needSliceRender)}
      />
      <ToggleItemComp
        label='菜单显示工具栏'
        active={menuShowTopTab.value}
        toggle={toggle(menuShowTopTab)}
      />
      <ToggleItemComp label='显示 FPS' active={showFPS.value} toggle={toggle(showFPS)} />
    </Flex>
  )
})
