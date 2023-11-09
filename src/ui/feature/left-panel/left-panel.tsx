import autoBind from 'auto-bind'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react'
import { FC } from 'react'
import { Editor } from '~/service/editor/editor'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'

type ILeftPanelComp = {}

export const LeftPanelComp: FC<ILeftPanelComp> = observer(({}) => {
  const { classes } = useStyles({})
  return <Flex layout='v' className={classes.LeftPanel}></Flex>
})

const LeftPanelState = new (class {
  public constructor() {
    autoBind(this)
    makeAutoObservable(this)
  }
})()

type ILeftPanelCompStyle = {} /* & Required<Pick<ILeftPanelComp>> */ /* & Pick<ILeftPanelComp> */

const useStyles = makeStyles<ILeftPanelCompStyle>()((t) => ({
  LeftPanel: {
    ...t.rect(Editor.Stage.bound.left, '100%'),
    flexShrink: 0,
    flexGrow: 0,
  },
  s: {
    backgroundColor: 'red',
  },
}))

LeftPanelComp.displayName = 'LeftPanelComp'
