import { observer } from 'mobx-react'
import { FC } from 'react'
import { UIOperatePanel } from '~/editor/ui-state/right-planel/operate'
import { useHookSignal } from '~/shared/signal-react'
import { DraggableComp } from '~/view/component/draggable'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PickerColorComp } from './color'

type IPickerComp = {}

export const PickerComp: FC<IPickerComp> = observer(({}) => {
  const { classes } = useStyles({})
  const { pickerShow, pickerType } = UIOperatePanel
  useHookSignal(pickerShow)
  useHookSignal(pickerType)
  return (
    <>
      {pickerShow.value && (
        <DraggableComp headerSlot={<h6>颜色</h6>} closeFunc={() => pickerShow.dispatch(false)}>
          <Flex layout='v' className={classes.Picker} style={{}}>
            <Flex layout='h' className={classes.typeSwitcher} justify={'space-around'}>
              <Button
                active={pickerType.value === 'color'}
                onClick={() => pickerType.dispatch('color')}>
                颜色
              </Button>
              <Button
                active={pickerType.value === 'linear'}
                onClick={() => pickerType.dispatch('linear')}>
                线性
              </Button>
              <Button
                active={pickerType.value === 'photo'}
                onClick={() => pickerType.dispatch('photo')}>
                图片
              </Button>
            </Flex>
            {pickerType.value === 'color' && <PickerColorComp />}
          </Flex>
        </DraggableComp>
      )}
    </>
  )
})

type IPickerCompStyle = {} /* & Required<Pick<IPickerComp>> */ /* & Pick<IPickerComp> */

const useStyles = makeStyles<IPickerCompStyle>()((t) => ({
  Picker: {
    ...t.rect(200, 'fit-content', 5, 'white'),
  },
  header: {
    ...t.rect('100%', 'fit-content'),
    ...t.default$.borderBottom,
  },
  typeSwitcher: {
    ...t.rect('100%', 'fit-content'),
  },
}))

PickerComp.displayName = 'PickerComp'
