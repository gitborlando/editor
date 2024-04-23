import { FC, memo } from 'react'
import { OperateFill } from '~/editor/operate/fill'
import { UIPicker } from '~/editor/ui-state/right-planel/operate/picker'
import { useHookSignal } from '~/shared/signal-react'
import { DraggableComp } from '~/view/component/draggable'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PickerImageComp } from './image'
import { PickerLinearGradientComp } from './linear'
import { PickerSolidComp } from './solid'

type IPickerComp = {}

export const PickerComp: FC<IPickerComp> = memo(({}) => {
  const { classes } = useStyles({})
  const { show, type, xy } = UIPicker
  useHookSignal(show)
  useHookSignal(type)
  useHookSignal(OperateFill.fills)

  if (!show.value) return null
  return (
    <DraggableComp
      headerSlot={<h6>颜色</h6>}
      closeFunc={() => show.dispatch(false)}
      clickAwayClose={() => show.value}
      xy={xy.value}>
      <Flex layout='v' className={classes.Picker} style={{}}>
        <Flex layout='h' className={classes.typeSwitcher} justify={'space-around'}>
          <Button active={type.value === 'color'} onClick={() => type.dispatch('color')}>
            颜色
          </Button>
          <Button
            active={type.value === 'linearGradient'}
            onClick={() => type.dispatch('linearGradient')}>
            线性
          </Button>
          <Button active={type.value === 'image'} onClick={() => type.dispatch('image')}>
            图片
          </Button>
        </Flex>
        {type.value === 'color' && <PickerSolidComp />}
        {type.value === 'linearGradient' && <PickerLinearGradientComp />}
        {type.value === 'image' && <PickerImageComp />}
      </Flex>
    </DraggableComp>
  )
})

type IPickerCompStyle = {} /* & Required<Pick<IPickerComp>> */ /* & Pick<IPickerComp> */

const useStyles = makeStyles<IPickerCompStyle>()((t) => ({
  Picker: {
    ...t.rect(240, 'fit-content', 5, 'white'),
  },
  header: {
    ...t.rect('100%', 'fit-content'),
    ...t.default$.borderBottom,
  },
  typeSwitcher: {
    ...t.rect('100%', 'fit-content'),
    paddingBlock: 4,
  },
}))

PickerComp.displayName = 'PickerComp'
