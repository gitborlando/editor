import { observer } from 'mobx-react'
import { FC } from 'react'
import { useEditor } from '~/view/context'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { OperatePanelComp } from './operate/operate-panel'
import { rightPanelShareState } from './shared-state'

type IRightPanelComp = {}

export const RightPanelComp: FC<IRightPanelComp> = observer(({}) => {
  const { StageViewport } = useEditor()
  const { classes } = useStyles({ right: StageViewport.bound.right })
  const { type } = rightPanelShareState
  return (
    <Flex layout='v' className={classes.RightPanel}>
      {type === 'operate' && <OperatePanelComp />}
    </Flex>
  )
})

type IRightPanelCompStyle = {
  right: number
} /* & Required<Pick<IRightPanelComp>> */ /* & Pick<IRightPanelComp> */

const useStyles = makeStyles<IRightPanelCompStyle>()((t, { right }) => ({
  RightPanel: {
    ...t.rect(right, '100%'),
    marginLeft: 'auto',
  },
}))

RightPanelComp.displayName = 'RightPanelComp'
