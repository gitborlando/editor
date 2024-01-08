import { observer } from 'mobx-react'
import { FC } from 'react'
import { DraggableComp } from '~/view/component/draggable'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PickerColorComp } from './color'
import { pickerShareState } from './share-state'

type IPickerComp = {}

export const PickerComp: FC<IPickerComp> = observer(({}) => {
  const { classes } = useStyles({})
  const { show, type, setType, setShow } = pickerShareState
  return (
    <>
      {show && (
        <DraggableComp headerSlot={<h6>颜色</h6>} closeFunc={() => setShow(false)}>
          <Flex layout='v' className={classes.Picker} style={{}}>
            <Flex layout='h' className={classes.typeSwitcher} justify={'space-around'}>
              <Button type='text' active={type === 'color'} onClick={() => setType('color')}>
                颜色
              </Button>
              <Button type='text' active={type === 'linear'} onClick={() => setType('linear')}>
                线性
              </Button>
              <Button type='text' active={type === 'photo'} onClick={() => setType('photo')}>
                图片
              </Button>
            </Flex>
            {type === 'color' && <PickerColorComp />}
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
