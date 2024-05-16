import { FC, memo } from 'react'
import { IEditorSettings, editorSettings } from '~/editor/editor/settings'
import { useHookSignal } from '~/shared/signal/signal-react'
import { useMemoComp } from '~/shared/utils/react'
import { Flex } from '~/view/ui-utility/widget/flex'

type ISettingComp = {}

export const SettingComp: FC<ISettingComp> = memo(({}) => {
  const commonItemCss = 'wh-100%-40 px-10'
  const { autosave } = useHookSignal(editorSettings)
  const setSetting = (setFunc: (setting: IEditorSettings) => void) => {
    editorSettings.dispatch(setFunc)
  }

  const ToggleItemComp = useMemoComp<{
    label: string
    active: boolean
    toggle: (a: boolean) => void
  }>([], ({ label, active, toggle }) => {
    return (
      <Flex layout='h' className={commonItemCss}>
        <Flex layout='c' className={'normalFont'}>
          {label}
        </Flex>
        <SwitchComp active={active} toggle={toggle} classes={['ml-auto']} />
      </Flex>
    )
  })

  const SwitchComp = useMemoComp<{
    active: boolean
    toggle: (a: boolean) => void
    classes?: string[]
  }>([], ({ active, toggle, classes }) => {
    const activeCss = active ? ['b-1-60', 'ml-auto bg-60'] : ['b-1-#d7d7d7', 'mr-auto bg-#d7d7d7']
    return (
      <Flex
        layout='h'
        className={`wh-40-20-99 px-4 pointer ${activeCss[0]} ${classes?.[0]}`}
        onClick={() => toggle(!active)}>
        <Flex layout='c' className={`wh-12-12-99 pointer ${activeCss[1]} ${classes?.[1]}`}></Flex>
      </Flex>
    )
  })

  return (
    <Flex className={'wh-100%-fit bg-white'}>
      <ToggleItemComp
        label='自动保存'
        active={autosave}
        toggle={(active) => setSetting((setting) => (setting.autosave = active))}
      />
    </Flex>
  )
})

SettingComp.displayName = 'SettingComp'
