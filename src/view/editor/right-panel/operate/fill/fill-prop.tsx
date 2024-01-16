import { observer } from 'mobx-react'
import { FC } from 'react'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { IconButton } from '~/view/ui-utility/widget/button/icon-button'
import { Flex } from '~/view/ui-utility/widget/flex'

type IFillPropComp = {}

export const FillPropComp: FC<IFillPropComp> = observer(({}) => {
  const { classes } = useStyles({})
  return (
    <Flex layout='h' sidePadding={10} className={classes.FillProp}>
      <Flex layout='c' className={classes.title}>
        <h4>填充</h4>
      </Flex>
      <IconButton size={16} style={{ marginLeft: 'auto' }}>
        {Asset.editor.leftPanel.page.add}
      </IconButton>
    </Flex>
  )
})

type IFillPropCompStyle = {} /* & Required<Pick<IFillPropComp>> */ /* & Pick<IFillPropComp> */

const useStyles = makeStyles<IFillPropCompStyle>()((t) => ({
  FillProp: {
    ...t.rect('100%', 44, 'no-radius', 'white'),
    ...t.default$.borderBottom,
  },
  title: {
    ...t.labelFont,
  },
}))

FillPropComp.displayName = 'FillPropComp'
