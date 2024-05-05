import { FC, memo, useRef } from 'react'
import { OperateShadow } from '~/editor/operate/shadow'
import { IShadow } from '~/editor/schema/type'
import { useHookSignal } from '~/shared/signal/signal-react'
import { useDownUpTracker } from '~/shared/utils/down-up-tracker'
import { iife } from '~/shared/utils/normal'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { IconButton } from '~/view/ui-utility/widget/button/icon-button'
import { CompositeInput } from '~/view/ui-utility/widget/compositeInput'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PickerOpener } from '../picker/picker-opener'

type IShadowItemComp = {
  shadow: IShadow
  index: number
}

export const ShadowItemComp: FC<IShadowItemComp> = memo(({ shadow, index }) => {
  const { classes, cx } = useStyles({})
  const { shadows, setAttribute, beforeOperate, afterOperate } = OperateShadow
  const inputRef = useRef<HTMLInputElement>(null)
  useHookSignal(shadows)
  useDownUpTracker(() => inputRef.current, beforeOperate.dispatch, afterOperate.dispatch)

  return (
    <Flex layout='v' className={cx(classes.ShadowItem)}>
      <Flex className={classes.first}>
        <PickerOpener fill={shadow.fill} index={index} impact='shadow' />
        <IconButton
          size={16}
          style={{ marginLeft: 'auto' }}
          onClick={() => OperateShadow.toggleVisible(shadow)}>
          {shadow.visible ? Asset.editor.shared.visible : Asset.editor.shared.unVisible}
        </IconButton>
        <IconButton size={16} onClick={() => OperateShadow.deleteShadow(shadow)}>
          {Asset.editor.shared.minus}
        </IconButton>
      </Flex>
      <Flex className={classes.second}>
        {iife(() => {
          const keys = ['offsetX', 'offsetY', 'blur'] as const
          const labels = ['x偏移', 'y偏移', '模糊']
          return keys.map((key, index) => (
            <CompositeInput
              key={key}
              className='lineWidth'
              ref={inputRef}
              label={labels[index]}
              needStepHandler={false}
              value={shadow[key].toString()}
              onNewValueApply={(value) => setAttribute(shadow, key, Number(value))}
            />
          ))
        })}
      </Flex>
    </Flex>
  )
})

type IShadowItemCompStyle = {} /* & Required<Pick<IShadowItemComp>> */ /* & Pick<IShadowItemComp> */

const useStyles = makeStyles<IShadowItemCompStyle>()((t) => ({
  ShadowItem: {
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
      ...t.default$.hover.border,
      // ...t.default$.background,
    },
    '& .lineWidth': {
      ...t.rect(92, 28, 2),
      // ...t.default$.background,
      marginRight: 4,
      '& .label': {
        width: 'fit-content',
      },
    },
  },
}))

ShadowItemComp.displayName = 'ShadowItemComp'
