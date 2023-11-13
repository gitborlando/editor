import { observer } from 'mobx-react'
import { FC } from 'react'
import { useEditor } from '~/ui/context'
import { makeStyles } from '~/ui/theme'
import { Button } from '~/ui/widget/button'
import { Flex } from '~/ui/widget/flex'

type IHeaderComp = {}

export const HeaderComp: FC<IHeaderComp> = observer(({}) => {
  const { schema, stage } = useEditor()
  const { classes } = useStyles({ top: stage.bound.top })

  return (
    <Flex layout='v' className={classes.Header}>
      <Flex layout='c' className={classes.tools}>
        <Button onClick={() => schema.file.openFile()}>上传</Button>
        <Button onClick={() => schema.file.exportFile()}>下载</Button>
        <Button onClick={() => schema.file.newFile()}>新建</Button>
        <Button onClick={() => stage.setStatus()}>选择</Button>
        <Button onClick={() => stage.setStatus('dragStage')}>拖动</Button>
        <Button onClick={() => stage.status.create.setType('rect')}>矩形</Button>
        <Button onClick={() => stage.status.create.setType('ellipse')}>圆形</Button>
      </Flex>
      <input
        ref={schema.file.setInputRef}
        id='uploader'
        type='file'
        style={{ display: 'none' }}></input>
    </Flex>
  )
})

type IHeaderCompStyle = {
  top: number
} /* & Required<Pick<IHeaderComp>> */ /* & Pick<IHeaderComp> */

const useStyles = makeStyles<IHeaderCompStyle>()((t, { top }) => ({
  Header: {
    ...t.rect('100%', top),
    border: '1px solid #E3E3E3',
    justifyContent: 'space-around',
  },
  tools: {},
}))

HeaderComp.displayName = 'HeaderComp'
