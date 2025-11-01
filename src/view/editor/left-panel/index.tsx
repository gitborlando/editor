import { matchCase } from '@gitborlando/utils'
import { History, Image, Layers, Settings } from 'lucide-react'
import { StageViewport } from 'src/editor/stage/viewport'
import { Button } from 'src/view/component/button'
import { Lucide } from 'src/view/component/lucide'
import { EditorLeftPanelImages } from 'src/view/editor/left-panel/panels/images'
import { LayerComp } from 'src/view/editor/left-panel/panels/layer'
import { SettingComp } from 'src/view/editor/left-panel/panels/setting'
import { UndoComp } from 'src/view/editor/left-panel/panels/undo'

export const EditorLeftPanelIds = ['layer', 'undo', 'images', 'setting'] as const

export const EditorLeftPanelState = observable({
  currentTabId: t<(typeof EditorLeftPanelIds)[number]>('layer'),
})

export const LeftPanelComp: FC<{}> = observer(({}) => {
  const { currentTabId } = EditorLeftPanelState

  return (
    <G
      horizontal='auto 1fr'
      style={{ width: StageViewport.bound.left }}
      className={cls()}
      gap={0}>
      <SwitchBarComp />
      <G>
        <LayerComp x-if={currentTabId === 'layer'} />
        <UndoComp x-if={currentTabId === 'undo'} />
        <EditorLeftPanelImages x-if={currentTabId === 'images'} />
        <SettingComp x-if={currentTabId === 'setting'} />
      </G>
    </G>
  )
})

export const SwitchBarComp: FC<{}> = observer(({}) => {
  const { currentTabId } = EditorLeftPanelState

  return (
    <G center vertical className={cls('switchBar')} gap={8}>
      {EditorLeftPanelIds.map((id) => {
        const icon = matchCase(id, {
          layer: <Lucide icon={Layers} size={17} />,
          undo: <Lucide icon={History} />,
          images: <Lucide icon={Image} />,
          setting: <Lucide icon={Settings} size={19} />,
        })
        const toolTip = matchCase(id, {
          layer: '图层',
          undo: '历史',
          images: '图片',
          setting: '设置',
        })
        return (
          <Button
            key={id}
            icon={icon}
            active={currentTabId === id}
            onClick={() => (EditorLeftPanelState.currentTabId = id)}></Button>
        )
      })}
    </G>
  )
})

const cls = classes(css`
  ${styles.borderRight}

  &-switchBar {
    width: 44px;
    align-content: start;
    padding-block: 8px;
    ${styles.borderRight}
  }
`)
