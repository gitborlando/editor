import { observer } from 'mobx-react'
import { FC } from 'react'
import { useServices } from '~/ioc'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { BasePropsComp } from './base-props'

type IRightPanelComp = {}

export const RightPanelComp: FC<IRightPanelComp> = observer(({}) => {
  const { viewportService, stageSelectService } = useServices()
  const { classes } = useStyles({ right: viewportService.bound.right })
  return (
    <Flex layout='v' className={classes.RightPanel}>
      <BasePropsComp />
      <Flex layout='c'>{stageSelectService.hoverId}</Flex>
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
