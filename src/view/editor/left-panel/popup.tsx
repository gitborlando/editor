import { FC, createElement, memo, useRef } from 'react'
import { UILeftPanel } from '~/editor/ui-state/left-panel/left-panel'
import { createSetting } from '~/global/setting'
import { DraggableComp } from '~/view/component/draggable'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

type IPopupPanelComp = {
  id: string
}

export const PopupPanelComp: FC<IPopupPanelComp> = memo(({ id }) => {
  const { popDownPanel, findSwitchTab } = UILeftPanel
  const { name, panel, icon } = findSwitchTab(id)
  const settingXY = useRef(
    createSetting(`Draggable.PopupPanel.${id}.XY`, { x: window.innerWidth - 480, y: 100 })
  )
  return (
    <DraggableComp
      key={id}
      headerSlot={
        <Flex layout='h' style={{ gap: 4 }}>
          <Icon size={18}>{icon}</Icon>
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

type IPopupPanelCompStyle = {} /* & Required<Pick<IPopupPanelComp>> */ /* & Pick<IPopupPanelComp> */

const useStyles = makeStyles<IPopupPanelCompStyle>()((t) => ({}))

PopupPanelComp.displayName = 'PopupPanelComp'
