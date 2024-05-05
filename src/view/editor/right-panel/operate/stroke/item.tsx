import { FC, memo, useRef } from 'react'
import { OperateStroke } from '~/editor/operate/stroke'
import { IStroke } from '~/editor/schema/type'
import { useHookSignal } from '~/shared/signal/signal-react'
import { useDownUpTracker } from '~/shared/utils/down-up-tracker'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { IconButton } from '~/view/ui-utility/widget/button/icon-button'
import { CompositeInput } from '~/view/ui-utility/widget/compositeInput'
import { Dropdown } from '~/view/ui-utility/widget/dropdown'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PickerOpener } from '../picker/picker-opener'

const alignOptionMap = {
  inner: '内部',
  center: '居中',
  outer: '外部',
}

type IStrokeItemComp = {
  stroke: IStroke
  index: number
}

export const StrokeItemComp: FC<IStrokeItemComp> = memo(({ stroke, index }) => {
  const { classes, cx } = useStyles({})
  const { strokes, setWidth, setAlign, beforeOperate, afterOperate } = OperateStroke
  const inputRef = useRef<HTMLInputElement>(null)
  useHookSignal(strokes)
  useDownUpTracker(() => inputRef.current, beforeOperate.dispatch, afterOperate.dispatch)

  return (
    <Flex layout='v' className={cx(classes.StrokeItem)}>
      <Flex className={classes.first}>
        <PickerOpener fill={stroke.fill} index={index} impact='stroke' />
        <IconButton
          size={16}
          style={{ marginLeft: 'auto' }}
          onClick={() => OperateStroke.toggleVisible(stroke)}>
          {stroke.visible ? Asset.editor.shared.visible : Asset.editor.shared.unVisible}
        </IconButton>
        <IconButton size={16} onClick={() => OperateStroke.deleteStroke(stroke)}>
          {Asset.editor.shared.minus}
        </IconButton>
      </Flex>
      <Flex className={classes.second}>
        <CompositeInput
          className='lineWidth'
          ref={inputRef}
          label='粗细'
          needStepHandler={false}
          value={stroke.width.toString()}
          onNewValueApply={(width) => setWidth(stroke, Number(width))}
        />
        <Dropdown
          className='dropdown'
          selected={stroke.align}
          options={['inner', 'center', 'outer'] as const}
          onSelected={(selected) => setAlign(stroke, selected as IStroke['align'])}
          translateArray={['内部', '居中', '外部']}
        />
      </Flex>
    </Flex>
  )
})

type IStrokeItemCompStyle = {} /* & Required<Pick<IStrokeItemComp>> */ /* & Pick<IStrokeItemComp> */

const useStyles = makeStyles<IStrokeItemCompStyle>()((t) => ({
  StrokeItem: {
    ...t.rect('100%', 'fit-content'),
  },
  first: {
    ...t.rect('100%', 28),
    marginBottom: 4,
  },
  second: {
    ...t.rect('100%', 28),
    '& .dropdown': {
      ...t.rect(54, '100%', 2),
    },
    '& .lineWidth': {
      ...t.rect(92, 28, 2),
      // ...t.default$.background,
      marginRight: 4,
      paddingInline: 6,
      '& .label': {
        width: 28,
      },
    },
  },
}))

StrokeItemComp.displayName = 'StrokeItemComp'
