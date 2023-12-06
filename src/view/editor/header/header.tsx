import { observer } from 'mobx-react'
import { FC } from 'react'
import { useEditor } from '~/view/context'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'

type IHeaderComp = {}

export const HeaderComp: FC<IHeaderComp> = observer(({}) => {
  const { File, StageInteract, StageViewport, StageCreate } = useEditor()
  const { classes } = useStyles({ top: StageViewport.bound.y })

  return (
    <Flex layout='v' className={classes.Header}>
      <Flex layout='c'>
        {StageViewport.initialized && (
          <Flex layout='c' style={{ width: 50 }}>
            {~~(StageViewport.zoom * 100)}%
          </Flex>
        )}
        <Button onClick={() => File.openFile()}>上传</Button>
        <Button onClick={() => File.exportFile()}>下载</Button>
        <Button onClick={() => File.newFile()}>新建</Button>
        <Button onClick={() => StageInteract.setType('select')}>选择</Button>
        <Button onClick={() => StageInteract.setType('move')}>拖动</Button>
        <Button onClick={() => StageCreate.setType('frame')}>画板</Button>
        <Button onClick={() => StageCreate.setType('rect')}>矩形</Button>
        <Button onClick={() => StageCreate.setType('ellipse')}>圆形</Button>
        <Button onClick={() => StageCreate.setType('line')}>线段</Button>
      </Flex>
      <input ref={File.setInputRef} id='uploader' type='file' style={{ display: 'none' }}></input>
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
}))

HeaderComp.displayName = 'HeaderComp'
