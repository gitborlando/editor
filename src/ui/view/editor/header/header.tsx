import { observer } from 'mobx-react'
import { FC } from 'react'
import { useServices } from '~/ioc'
import { makeStyles } from '~/ui/theme'
import { Button } from '~/ui/widget/button'
import { Flex } from '~/ui/widget/flex'

type IHeaderComp = {}

export const HeaderComp: FC<IHeaderComp> = observer(({}) => {
  const { fileService, stageService, viewportService, stageCreateService } = useServices()
  const { classes } = useStyles({ top: viewportService.bound.y })

  return (
    <Flex layout='v' className={classes.Header}>
      <Flex layout='c'>
        {viewportService.initialized && (
          <Flex layout='c' style={{ width: 50 }}>
            {~~(viewportService.zoom * 100)}%
          </Flex>
        )}
        <Button onClick={() => fileService.openFile()}>上传</Button>
        <Button onClick={() => fileService.exportFile()}>下载</Button>
        <Button onClick={() => fileService.newFile()}>新建</Button>
        <Button onClick={() => stageService.setInteractType('select')}>选择</Button>
        <Button onClick={() => stageService.setInteractType('move')}>拖动</Button>
        <Button onClick={() => stageCreateService.setType('rect')}>矩形</Button>
        <Button onClick={() => stageCreateService.setType('ellipse')}>圆形</Button>
      </Flex>
      <input
        ref={fileService.setInputRef}
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
}))

HeaderComp.displayName = 'HeaderComp'
