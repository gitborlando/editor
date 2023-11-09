import autoBind from 'auto-bind'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react'
import { FC } from 'react'
import { Editor } from '~/service/editor/editor'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'

type IHeaderComp = {}

export const HeaderComp: FC<IHeaderComp> = observer(({}) => {
  const { classes } = useStyles({})
  return (
    <Flex layout='v' className={classes.Header}>
      <Flex layout='c' className={classes.tools}>
        <button onClick={() => Editor.Stage.setStatus()}>选择工具</button>
        <button onClick={() => Editor.Stage.setStatus('dragStage')}>拖动画布</button>
        <button onClick={() => Editor.Stage.Status.setStatus('create').setCreateType('rect')}>
          rect
        </button>
        <button onClick={() => Editor.Stage.Status.setStatus('create').setCreateType('ellipse')}>
          circle
        </button>
      </Flex>
    </Flex>
  )
})

const HeaderState = new (class {
  public constructor() {
    autoBind(this)
    makeAutoObservable(this)
  }
})()

type IHeaderCompStyle = {} /* & Required<Pick<IHeaderComp>> */ /* & Pick<IHeaderComp> */

const useStyles = makeStyles<IHeaderCompStyle>()((t) => ({
  Header: {
    ...t.rect('100%', Editor.Stage.bound.top),
    border: '1px solid #E3E3E3',
    justifyContent: 'space-around',
  },
  tools: {},
}))

HeaderComp.displayName = 'HeaderComp'
