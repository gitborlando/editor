import { FC, memo } from 'react'
import { OperateFill } from '~/editor/operate/fill'
import { IFill } from '~/editor/schema/type'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { IconButton } from '~/view/ui-utility/widget/button/icon-button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PickerOpener } from '../picker/picker-opener'

type IFillItemComp = {
  fill: IFill
  index: number
}

export const FillItemComp: FC<IFillItemComp> = memo(({ fill, index }) => {
  const { classes } = useStyles({})
  const { setFill, deleteFill } = OperateFill

  return (
    <Flex layout='h' className={classes.FillItem}>
      <PickerOpener fill={fill} index={index} impact='fill' />
      <IconButton
        size={16}
        style={{ marginLeft: 'auto' }}
        onClick={() => setFill(index, ['visible'], !fill.visible)}>
        {fill.visible ? Asset.editor.shared.visible : Asset.editor.shared.unVisible}
      </IconButton>
      <IconButton size={16} onClick={() => deleteFill(index)}>
        {Asset.editor.shared.minus}
      </IconButton>
    </Flex>
  )
})

type IFillItemCompStyle = {} /* & Required<Pick<IFillItemComp>> */ /* & Pick<IFillItemComp> */

const useStyles = makeStyles<IFillItemCompStyle>()((t) => ({
  FillItem: {
    ...t.rect('100%', 28),
  },
}))

FillItemComp.displayName = 'FillItemComp'
