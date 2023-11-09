import autoBind from 'auto-bind'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react'
import { FC } from 'react'
import { Editor } from '~/service/editor/editor'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'
import { SchemaBaseComp } from './schema-base'

type IRightPanelComp = {}

export const RightPanelComp: FC<IRightPanelComp> = observer(({}) => {
  const { classes } = useStyles({})
  return (
    <Flex layout='v' className={classes.RightPanel}>
      <SchemaBaseComp />
      <Flex layout='h' style={{ width: '100%' }}></Flex>
    </Flex>
  )
})

const RightPanelState = new (class {
  public constructor() {
    autoBind(this)
    makeAutoObservable(this)
  }
})()

type IRightPanelCompStyle = {} /* & Required<Pick<IRightPanelComp>> */ /* & Pick<IRightPanelComp> */

const useStyles = makeStyles<IRightPanelCompStyle>()((t) => ({
  RightPanel: {
    ...t.rect(Editor.Stage.bound.right, '100%'),
    marginLeft: 'auto',
    flexShrink: 0,
    flexGrow: 0,
  },
}))

RightPanelComp.displayName = 'RightPanelComp'
