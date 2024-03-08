import { FC, memo } from 'react'
import { OperateStroke } from '~/editor/operate/stroke'
import { useHookSignal } from '~/shared/signal-react'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { IconButton } from '~/view/ui-utility/widget/button/icon-button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { StrokeItemComp } from './item'

type IStrokeComp = {}

export const StrokeComp: FC<IStrokeComp> = memo(({}) => {
  const { strokes } = OperateStroke
  const { classes } = useStyles({})
  useHookSignal(strokes)

  return (
    <Flex layout='v' sidePadding={6} className={classes.Stroke}>
      <Flex layout='h' className={classes.header}>
        <Flex layout='c' className={classes.title}>
          <h4>描边</h4>
        </Flex>
        <IconButton size={16} style={{ marginLeft: 'auto' }} onClick={() => {}}>
          {Asset.editor.leftPanel.page.add}
        </IconButton>
      </Flex>
      {strokes.value.map((stroke, index) => (
        <StrokeItemComp key={index} stroke={stroke} index={index} />
      ))}
    </Flex>
  )
})

type IStrokeCompStyle = {} /* & Required<Pick<IStrokeComp>> */ /* & Pick<IStrokeComp> */

const useStyles = makeStyles<IStrokeCompStyle>()((t) => ({
  Stroke: {
    ...t.rect('100%', 'fit-content', 'no-radius', 'white'),
    ...t.default$.borderBottom,
    padding: 8,
  },
  header: {
    ...t.rect('100%', 24),
  },
  title: {
    ...t.labelFont,
  },
}))

StrokeComp.displayName = 'StrokeComp'
