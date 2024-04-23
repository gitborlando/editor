import { FC, memo } from 'react'
import { OperateStroke } from '~/editor/operate/stroke'
import { IStroke } from '~/editor/schema/type'
import { useHookSignal } from '~/shared/signal-react'
import { useSubComponent } from '~/shared/utils/normal'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { IconButton } from '~/view/ui-utility/widget/button/icon-button'
import { Divide } from '~/view/ui-utility/widget/divide'
import { Flex } from '~/view/ui-utility/widget/flex'
import { StrokeItemComp } from './item'

type IStrokeComp = {}

export const StrokeComp: FC<IStrokeComp> = memo(({}) => {
  const { strokes, isStrokesArray, addStroke } = OperateStroke
  const { classes, css, cx } = useStyles({})
  const hasStrokes = isStrokesArray(strokes.value) && strokes.value.length > 0
  useHookSignal(strokes)

  const HeaderComp = useSubComponent([hasStrokes], ({}) => {
    const hasStrokesStyle = hasStrokes && css({ marginBottom: 8 })
    return (
      <Flex layout='h' className={cx(classes.header, hasStrokesStyle)}>
        <Flex layout='c' className={classes.title}>
          <h4>描边</h4>
        </Flex>
        <IconButton size={16} style={{ marginLeft: 'auto' }} onClick={addStroke}>
          {Asset.editor.leftPanel.page.add}
        </IconButton>
      </Flex>
    )
  })

  const StrokeListComp = useSubComponent<{ strokes: IStroke[] }>([], ({ strokes }) => {
    return strokes.map((stroke, index) =>
      index !== strokes.length - 1 ? (
        <>
          <StrokeItemComp key={index} stroke={stroke} index={index} />
          <Divide direction='h' margin={6} length={'95%'} thickness={0.2} bgColor='#E3E3E3' />
        </>
      ) : (
        <StrokeItemComp key={index} stroke={stroke} index={index} />
      )
    )
  })

  return (
    <Flex layout='v' sidePadding={6} className={classes.Stroke}>
      <HeaderComp />
      {isStrokesArray(strokes.value) ? (
        <StrokeListComp strokes={strokes.value} />
      ) : (
        <Flex layout='c' className={classes.isMultiStrokes}>
          点击 + 重置并修改多个描边
        </Flex>
      )}
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
  isMultiStrokes: {
    ...t.labelFont,
    height: 24,
    marginTop: 8,
    marginRight: 'auto',
  },
}))

StrokeComp.displayName = 'StrokeComp'
