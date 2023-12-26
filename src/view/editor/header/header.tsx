import { observer } from 'mobx-react'
import { FC } from 'react'
import { useEditor, useGlobalService } from '~/view/context'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'

type IHeaderComp = {}

export const HeaderComp: FC<IHeaderComp> = observer(({}) => {
  const { StageInteract, StageViewport, StageCreate } = useEditor()
  const { File } = useGlobalService()
  const { classes } = useStyles({ top: StageViewport.bound.y })
  return (
    <Flex layout='v' className={classes.Header}>
      <Flex layout='c'>
        <Button
          active={StageInteract.type === 'select'}
          onClick={() => StageInteract.setType('select')}>
          选择
        </Button>
        <Button
          active={StageInteract.type === 'move'}
          onClick={() => StageInteract.setType('move')}>
          拖动
        </Button>
        <Button
          active={StageInteract.type === 'create' && StageCreate.type === 'frame'}
          onClick={() => StageCreate.setType('frame')}>
          画板
        </Button>
        <Button
          active={StageInteract.type === 'create' && StageCreate.type === 'rect'}
          onClick={() => StageCreate.setType('rect')}>
          矩形
        </Button>
        <Button
          active={StageInteract.type === 'create' && StageCreate.type === 'ellipse'}
          onClick={() => StageCreate.setType('ellipse')}>
          圆形
        </Button>
        <Button
          active={StageInteract.type === 'create' && StageCreate.type === 'line'}
          onClick={() => StageCreate.setType('line')}>
          线段
        </Button>
        {StageViewport.initialized && (
          <Flex layout='c' style={{ width: 50 }} className={classes.zoom}>
            {~~((StageViewport?.zoom || 0) * 100)}%
          </Flex>
        )}
      </Flex>
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
  zoom: {
    ...t.labelFont,
  },
}))

HeaderComp.displayName = 'HeaderComp'
