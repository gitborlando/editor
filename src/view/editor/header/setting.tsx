import { InputNumber, Radio } from '@arco-design/web-react'
import { Settings } from 'lucide-react'
import { getEditorSetting } from 'src/editor/editor/setting'
import { IconButton } from 'src/view/component/button'
import { DragPanel } from 'src/view/component/drag-panel'
import { SpaceBetweenItem } from 'src/view/component/item'
import { Text } from 'src/view/component/text'
import { getLanguage, sentence, setLanguage } from 'src/view/i18n/config'

export const EditorHeaderSettingComp: FC<{}> = observer(({}) => {
  const [showSetting, setShowSetting] = useState(true)
  const [settingType, setSettingType] = useState<'common' | 'dev'>('common')
  return (
    <>
      <IconButton
        icon={<Lucide icon={Settings} size={20} />}
        onClick={() => setShowSetting(!showSetting)}
      />
      <DragPanel
        center
        x-if={showSetting}
        title={t('common.setting')}
        closeFunc={() => setShowSetting(false)}>
        <G className={editorSettingCls()} gap={8}>
          <Radio.Group
            type='button'
            size='small'
            value={settingType}
            onChange={(value) => setSettingType(value as 'common' | 'dev')}>
            <Radio value='common'>{t('adj.general')}</Radio>
            <Radio value='dev'>{t('noun.dev')}</Radio>
          </Radio.Group>
          <CommonSettingComp x-if={settingType === 'common'} />
          <DevSettingComp x-if={settingType === 'dev'} />
        </G>
      </DragPanel>
    </>
  )
})

export const CommonSettingComp: FC<{}> = observer(({}) => {
  const setting = getEditorSetting()
  const {
    autosave,
    mockMode,
    showFPS,
    devMode,
    ignoreUnVisible,
    menuShowTopTab,
    needSliceRender,
    showDirtyRect,
  } = setting

  return (
    <G gap={8}>
      <SpaceBetweenItem label={t('noun.language')}>
        <Radio.Group
          type='button'
          size='small'
          value={getLanguage()}
          onChange={(value) => setLanguage(value as 'zh' | 'en')}>
          <Radio value='en'>English</Radio>
          <Radio value='zh'>中文</Radio>
        </Radio.Group>
      </SpaceBetweenItem>
      <BooleanSettingComp
        label='mock模式'
        value={mockMode}
        onChange={(value) => (setting.mockMode = value)}
      />
      <BooleanSettingComp
        label='自动保存'
        value={autosave}
        onChange={(value) => (setting.autosave = value)}
      />
      <BooleanSettingComp
        label='开发模式'
        value={devMode}
        onChange={(value) => (setting.devMode = value)}
      />
      <BooleanSettingComp
        label='显示渲染脏矩形'
        value={showDirtyRect}
        onChange={(value) => (setting.showDirtyRect = value)}
      />
      <BooleanSettingComp
        label='不渲染不可辨认的节点'
        value={ignoreUnVisible}
        onChange={(value) => (setting.ignoreUnVisible = value)}
      />
      <BooleanSettingComp
        label='缩放时进行分片渲染优化'
        value={needSliceRender}
        onChange={(value) => (setting.needSliceRender = value)}
      />
      <BooleanSettingComp
        label='菜单显示工具栏'
        value={menuShowTopTab}
        onChange={(value) => (setting.menuShowTopTab = value)}
      />
      <BooleanSettingComp
        label='显示 FPS'
        value={showFPS}
        onChange={(value) => (setting.showFPS = value)}
      />
    </G>
  )
})

const DevSettingComp: FC<{}> = observer(({}) => {
  const setting = getEditorSetting()
  const { solidZoomAndOffset, zoom, offset } = setting.dev
  return (
    <G gap={8}>
      <BooleanSettingComp
        label={sentence(t('adj.fixed'), t('noun.zoom'), t('noun.offset'))}
        value={solidZoomAndOffset}
        onChange={(value) => (setting.dev.solidZoomAndOffset = value)}
      />
      <SpaceBetweenItem label={t('noun.zoom')} x-if={solidZoomAndOffset}>
        <InputNumber
          style={{ width: 80 }}
          hideControl
          suffix='%'
          min={1}
          max={25600}
          value={zoom}
          onChange={(value) => (setting.dev.zoom = value)}
        />
      </SpaceBetweenItem>
      <SpaceBetweenItem label={t('noun.offset')} x-if={solidZoomAndOffset}>
        <G horizontal='auto auto' gap={8}>
          <InputNumber
            style={{ width: 80 }}
            hideControl
            prefix='x'
            min={1}
            max={25600}
            value={offset.x}
            onChange={(value) => (setting.dev.offset.x = value)}
          />
          <InputNumber
            style={{ width: 80 }}
            hideControl
            prefix='y'
            min={1}
            max={25600}
            value={offset.y}
            onChange={(value) => (setting.dev.offset.y = value)}
          />
        </G>
      </SpaceBetweenItem>
    </G>
  )
})

const BooleanSettingComp: FC<{
  label: string
  value: boolean
  onChange: (value: boolean) => void
}> = ({ label, value, onChange }) => {
  return (
    <G className={booleanSettingCls()} horizontal='auto auto' center>
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
    <G className={switchCls()} onClick={() => onChange(!value)}>
      <G className={cx(switchCls('inner'), value && switchCls('inner-checked'))}></G>
    </G>
  )
}

export const editorSettingCls = classes(css`
  padding: 12px;
  height: fit-content;
`)

export const booleanSettingCls = classes(css`
  height: 32px;
  justify-content: space-between;
`)

export const switchCls = classes(css`
  width: 36px;
  height: 18px;
  border-radius: 99px;
  padding: 3px;
  cursor: pointer;
  outline: 1px solid var(--gray-bg);
  transition: all 0.3s ease;

  &-inner {
    width: 12px;
    height: 12px;
    border-radius: 99px;
    background-color: var(--gray-bg);

    &-checked {
      background-color: hsl(var(--hue), 100%, 60%);
      justify-self: end;
    }
  }
`)
