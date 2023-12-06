import { observer } from 'mobx-react'
import { FC } from 'react'
import { useEditor } from '~/view/context'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { BasePropsComp } from './base-props'

type IRightPanelComp = {}

export const RightPanelComp: FC<IRightPanelComp> = observer(({}) => {
  const { StageViewport, SchemaNode } = useEditor()
  const { classes } = useStyles({ right: StageViewport.bound.right })
  return (
    <Flex layout='v' className={classes.RightPanel}>
      <BasePropsComp />
      <Flex layout='c'>{SchemaNode.hoverId}</Flex>
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
  },
}))

RightPanelComp.displayName = 'RightPanelComp'
