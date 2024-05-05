import { cloneDeep } from 'lodash-es'
import { FC, memo, useEffect } from 'react'
import { OperateFill } from '~/editor/operate/fill'
import { SchemaDefault } from '~/editor/schema/default'
import { IFill, IFillColor, IFillImage, IFillLinearGradient } from '~/editor/schema/type'
import { UIPickerCopy } from '~/editor/ui-state/right-panel/operate/picker copy'
import { useHookSignal } from '~/shared/signal/signal-react'
import { DraggableComp } from '~/view/component/draggable'
import { useSelectedNodes } from '~/view/editor/context'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PickerImageComp } from './image'
import { PickerLinearGradientComp } from './linear'
import { PickerSolidComp } from './solid'

const createFillCache = () => ({
  color: SchemaDefault.fillColor(),
  linearGradient: SchemaDefault.fillLinearGradient(),
  image: SchemaDefault.fillImage(),
})
let fillCache = createFillCache()

export const PickerComp: FC<{}> = ({}) => {
  const fill = OperateFill.fills[UIPickerCopy.index]
  useSelectedNodes()
  return fill && <PickerContentComp fill={fill} />
}

const PickerContentComp: FC<{
  fill: IFill
}> = memo(({ fill }) => {
  const { classes } = useStyles({})
  const { show, type, xy, changeFill } = UIPickerCopy
  useHookSignal(show)
  useHookSignal(type)

  useEffect(() => {
    UIPickerCopy.fill = cloneDeep(fill)
  }, [fill])

  useEffect(() => {
    //@ts-ignore
    if (show) fillCache[fill.type] = fill
    else fillCache = createFillCache()
  }, [show.value, fill])

  useEffect(() => {
    changeFill(fillCache[type.value])
  }, [type.value])

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
        {fill.type === 'color' && <PickerSolidComp fill={fill as IFillColor} />}
        {fill.type === 'linearGradient' && (
          <PickerLinearGradientComp fill={fill as IFillLinearGradient} />
        )}
        {fill.type === 'image' && <PickerImageComp fill={fill as IFillImage} />}
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
