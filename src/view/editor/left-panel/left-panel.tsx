import { matchCase } from '@gitborlando/utils'
import { History, Image, Layers, Settings } from 'lucide-react'
import { FC, memo } from 'react'
import { StageViewport } from 'src/editor/stage/viewport'
import { Button } from 'src/view/component/button'
import { Lucide } from 'src/view/component/lucide'
import { EditorLeftPanelImages } from 'src/view/editor/left-panel/panels/images'
import { LayerComp } from 'src/view/editor/left-panel/panels/layer/layer'
import { SettingComp } from 'src/view/editor/left-panel/panels/setting/setting'
import { UndoComp } from 'src/view/editor/left-panel/panels/undo'
import { proxy, useSnapshot } from 'valtio'

export const EditorLeftPanelIds = ['layer', 'undo', 'images', 'setting'] as const

export const EditorLeftPanelState = proxy({
  currentTabId: t<(typeof EditorLeftPanelIds)[number]>('layer'),
})

export const LeftPanelComp: FC<{}> = observer(({}) => {
  const { currentTabId } = useSnapshot(EditorLeftPanelState)

  return (
    <G
      horizontal='auto 1fr'
      style={{ width: StageViewport.bound.left }}
      className='bd-1-#E3E3E3-r'
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

export const SwitchBarComp: FC<{}> = memo(({}) => {
  const { currentTabId } = useSnapshot(EditorLeftPanelState)

  return (
    <G center className='w-40 bd-1-#E3E3E3-r py-8' style={{ alignContent: 'flex-start' }} gap={8}>
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
