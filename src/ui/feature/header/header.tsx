import autoBind from 'auto-bind'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react'
import { FC } from 'react'
import { Editor } from '~/service/editor/editor'
import { makeStyles } from '~/ui/theme'
import { Button } from '~/ui/widget/button'
import { Flex } from '~/ui/widget/flex'

type IHeaderComp = {}

export const HeaderComp: FC<IHeaderComp> = observer(({}) => {
  const { classes } = useStyles({})
  return (
    <Flex layout='v' className={classes.Header}>
      <Flex layout='c' className={classes.tools}>
        <Button onClick={() => Editor.Stage.draw.clearAll()}>清除</Button>
        <Button onClick={() => Editor.Stage.setStatus()}>选择</Button>
        <Button onClick={() => Editor.Stage.setStatus('dragStage')}>拖动</Button>
        <Button onClick={() => Editor.Stage.Status.create.setType('rect')}>矩形</Button>
        <Button onClick={() => Editor.Stage.Status.create.setType('ellipse')}>圆形</Button>
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
