import cx from 'classix'
import { FC } from 'react'
import { EditorSetting, getEditorSetting } from 'src/editor/editor/setting'
import { Text } from 'src/view/component/text'
import './index.less'

type ISettingComp = {}

export const SettingComp: FC<ISettingComp> = observer(({}) => {
  const {
    autosave,
    mockMode,
    showFPS,
    devMode,
    ignoreUnVisible,
    menuShowTopTab,
    needSliceRender,
    showDirtyRect,
  } = getEditorSetting()

  const toggle = (key: keyof typeof EditorSetting.setting) => {
    return (value: boolean) => (EditorSetting.setting[key] = value)
  }

  return (
    <G gap={16} className='editor-setting'>
      <BooleanSettingComp
        label='mock模式'
        value={mockMode}
        onChange={toggle('mockMode')}
      />
      <BooleanSettingComp
        label='自动保存'
        value={autosave}
        onChange={toggle('autosave')}
      />
      <BooleanSettingComp
        label='开发模式'
        value={devMode}
        onChange={toggle('devMode')}
      />
      <BooleanSettingComp
        label='显示渲染脏矩形'
        value={showDirtyRect}
        onChange={toggle('showDirtyRect')}
      />
      <BooleanSettingComp
        label='不渲染不可辨认的节点'
        value={ignoreUnVisible}
        onChange={toggle('ignoreUnVisible')}
      />
      <BooleanSettingComp
        label='缩放时进行分片渲染优化'
        value={needSliceRender}
        onChange={toggle('needSliceRender')}
      />
      <BooleanSettingComp
        label='菜单显示工具栏'
        value={menuShowTopTab}
        onChange={toggle('menuShowTopTab')}
      />
      <BooleanSettingComp
        label='显示 FPS'
        value={showFPS}
        onChange={toggle('showFPS')}
      />
    </G>
  )
})

const BooleanSettingComp: FC<{
  label: string
  value: boolean
  onChange: (value: boolean) => void
}> = ({ label, value, onChange }) => {
  return (
    <G className='boolean-setting' horizontal='auto auto'>
      <Text>{label}</Text>
      <SwitchComp value={value} onChange={onChange} />
    </G>
  )
}

const SwitchComp: FC<{
  value: boolean
  onChange: (value: boolean) => void
}> = ({ value, onChange }) => {
  return (
    <G
      className={cx('switch', value && 'switch-checked')}
      onClick={() => onChange(!value)}>
      <G className='switch-inner'></G>
    </G>
  )
}
