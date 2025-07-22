import { Flex, Icon } from '@gitborlando/widget'
import { FC, createElement, memo, useRef } from 'react'
import { UILeftPanel } from 'src/editor/ui-state/left-panel/left-panel'
import { createStorageItem } from 'src/global/storage'
import { DraggableComp } from 'src/view/component/draggable'

type IPopupPanelComp = {
  id: string
}

export const PopupPanelComp: FC<IPopupPanelComp> = memo(({ id }) => {
  const { popDownPanel, findSwitchTab } = UILeftPanel
  const { name, panel, icon } = findSwitchTab(id)
  const settingXY = useRef(
    createStorageItem(`Draggable.PopupPanel.${id}.XY`, { x: window.innerWidth - 480, y: 100 })
  )
  return (
    <DraggableComp
      key={id}
      headerSlot={
        <Flex layout='h' className='gap-4-4'>
          <Icon className='wh-18' url={icon} />
          <h4>{name}</h4>
        </Flex>
      }
      closeFunc={() => popDownPanel(id)}
      xy={settingXY.current.value}
      width={240}
      height={840}
      onXYChange={(xy) => settingXY.current.dispatch(xy)}>
      {createElement(panel)}
    </DraggableComp>
  )
})
