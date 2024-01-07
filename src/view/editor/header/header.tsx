import { observer } from 'mobx-react'
import { FC } from 'react'
import { hslBlueColor } from '~/shared/utils/color'
import { useEditor } from '~/view/context'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Divide } from '~/view/ui-utility/widget/divide'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

type IHeaderComp = {}

export const HeaderComp: FC<IHeaderComp> = observer(({}) => {
  const { StageInteract, StageViewport, StageCreate } = useEditor()
  const { classes } = useStyles({ top: StageViewport.bound.y })
  return (
    <Flex layout='v' justify='space-around' className={classes.Header}>
      <Flex layout='c'>
        <Button
          type='icon'
          active={StageInteract.type === 'select'}
          onClick={() => StageInteract.setType('select')}>
          <Icon size={22} fill={StageInteract.type === 'select' ? hslBlueColor(65) : ''}>
            {Asset.editor.header.tools.select}
          </Icon>
        </Button>
        <Button
          type='icon'
          active={StageInteract.type === 'move'}
          onClick={() => StageInteract.setType('move')}>
          <Icon size={22} fill={StageInteract.type === 'move' ? hslBlueColor(65) : ''}>
            {Asset.editor.header.tools.move}
          </Icon>
        </Button>
        <Button
          type='icon'
          active={StageInteract.type === 'create' && StageCreate.type === 'frame'}
          onClick={() => StageCreate.setType('frame')}>
          <Icon
            size={22}
            fill={
              StageInteract.type === 'create' && StageCreate.type === 'frame'
                ? hslBlueColor(65)
                : ''
            }>
            {Asset.editor.node.frame}
          </Icon>
        </Button>
        <Button
          type='icon'
          active={StageInteract.type === 'create' && StageCreate.type === 'rect'}
          onClick={() => StageCreate.setType('rect')}>
          <Icon
            size={22}
            fill={
              StageInteract.type === 'create' && StageCreate.type === 'rect' ? hslBlueColor(65) : ''
            }>
            {Asset.editor.node.rect}
          </Icon>
        </Button>
        <Button
          active={StageInteract.type === 'create' && StageCreate.type === 'ellipse'}
          onClick={() => StageCreate.setType('ellipse')}>
          <Icon
            size={22}
            fill={
              StageInteract.type === 'create' && StageCreate.type === 'ellipse'
                ? hslBlueColor(65)
                : ''
            }>
            {Asset.editor.node.ellipse}
          </Icon>
        </Button>
        <Button
          active={StageInteract.type === 'create' && StageCreate.type === 'line'}
          onClick={() => StageCreate.setType('line')}>
          <Icon
            size={22}
            fill={
              StageInteract.type === 'create' && StageCreate.type === 'line' ? hslBlueColor(65) : ''
            }>
            {Asset.editor.node.line}
          </Icon>
        </Button>
        <Divide />
        {StageViewport.initialized && (
          <Button>{~~((StageViewport?.zoom || 0) * 100)}%</Button>
          // <Flex layout='c' style={{ width: 50 }} className={classes.zoom}>
          //   {~~((StageViewport?.zoom || 0) * 100)}%
          // </Flex>
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
    ...t.default$.borderBottom,
  },
  zoom: {
    ...t.labelFont,
  },
  icon: {
    '& path': {
      fill: '',
    },
  },
}))

HeaderComp.displayName = 'HeaderComp'
