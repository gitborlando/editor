import { observer } from 'mobx-react'
import { FC } from 'react'
import { StageCreate } from '~/editor/stage/interact/create'
import { StageInteract } from '~/editor/stage/interact/interact'
import { StageViewport } from '~/editor/stage/viewport'
import { useSignalHook } from '~/shared/signal-react'
import { hslBlueColor } from '~/shared/utils/color'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Divide } from '~/view/ui-utility/widget/divide'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

type IHeaderComp = {}

export const HeaderComp: FC<IHeaderComp> = observer(({}) => {
  const { classes } = useStyles({ top: StageViewport.bound.value.y })
  useSignalHook(StageInteract.type)
  useSignalHook(StageViewport.zoom)
  return (
    <Flex layout='h' className={classes.Header}>
      <Flex layout='c' className={classes.leftGroup}>
        <Icon size={28}>{Asset.editor.header.shiyangyang}</Icon>
        <h4 style={{ color: hslBlueColor(60) }}>屎羊羊编辑器</h4>
      </Flex>
      <Flex layout='c' className={classes.centerGroup}>
        <Button
          type='icon'
          active={StageInteract.type.value === 'select'}
          onClick={() => StageInteract.type.dispatch('select')}>
          <Icon size={22} fill={StageInteract.type.value === 'select' ? hslBlueColor(65) : ''}>
            {Asset.editor.header.tools.select}
          </Icon>
        </Button>
        <Button
          type='icon'
          active={StageInteract.type.value === 'move'}
          onClick={() => StageInteract.type.dispatch('move')}>
          <Icon size={22} fill={StageInteract.type.value === 'move' ? hslBlueColor(65) : ''}>
            {Asset.editor.header.tools.move}
          </Icon>
        </Button>
        <Button
          type='icon'
          active={StageInteract.type.value === 'create' && StageCreate.type.value === 'frame'}
          onClick={() => StageCreate.type.dispatch('frame')}>
          <Icon
            size={22}
            fill={
              StageInteract.type.value === 'create' && StageCreate.type.value === 'frame'
                ? hslBlueColor(65)
                : ''
            }>
            {Asset.editor.node.frame}
          </Icon>
        </Button>
        <Button
          type='icon'
          active={StageInteract.type.value === 'create' && StageCreate.type.value === 'rect'}
          onClick={() => StageCreate.type.dispatch('rect')}>
          <Icon
            size={22}
            fill={
              StageInteract.type.value === 'create' && StageCreate.type.value === 'rect'
                ? hslBlueColor(65)
                : ''
            }>
            {Asset.editor.node.rect}
          </Icon>
        </Button>
        <Button
          active={StageInteract.type.value === 'create' && StageCreate.type.value === 'ellipse'}
          onClick={() => StageCreate.type.dispatch('ellipse')}>
          <Icon
            size={22}
            fill={
              StageInteract.type.value === 'create' && StageCreate.type.value === 'ellipse'
                ? hslBlueColor(65)
                : ''
            }>
            {Asset.editor.node.ellipse}
          </Icon>
        </Button>
        <Button
          active={StageInteract.type.value === 'create' && StageCreate.type.value === 'line'}
          onClick={() => StageCreate.type.dispatch('line')}>
          <Icon
            size={22}
            fill={
              StageInteract.type.value === 'create' && StageCreate.type.value === 'line'
                ? hslBlueColor(65)
                : ''
            }>
            {Asset.editor.node.line}
          </Icon>
        </Button>
        <Divide />
        <Button style={{ width: 60 }}>{~~((StageViewport.zoom.value || 0) * 100)}%</Button>
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
    ...t.relative(),
  },
  leftGroup: {
    marginLeft: 10,
    gap: 8,
  },
  centerGroup: {
    ...t.absolute(0, 0, 0, 0),
    margin: 'auto',
  },
}))

HeaderComp.displayName = 'HeaderComp'
