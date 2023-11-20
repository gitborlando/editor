import { observer } from 'mobx-react'
import { FC } from 'react'
import { useEditor } from '~/ui/context'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'
import { BasePropsComp } from './base-props'

type IRightPanelComp = {}

export const RightPanelComp: FC<IRightPanelComp> = observer(({}) => {
  const { stage, schema } = useEditor()
  const { classes } = useStyles({ right: stage.bound.right })
  return (
    <Flex layout='v' className={classes.RightPanel}>
      <BasePropsComp />
      <Flex layout='c'>{stage.status.select.hoverId}</Flex>
      <Flex layout='h' style={{ width: '100%' }}></Flex>
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
    flexShrink: 0,
    flexGrow: 0,
  },
}))

RightPanelComp.displayName = 'RightPanelComp'
