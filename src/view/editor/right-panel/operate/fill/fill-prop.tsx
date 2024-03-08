import { observer } from 'mobx-react'
import { FC } from 'react'
import { OperateFill } from '~/editor/operate/fill'
import { useHookSignal } from '~/shared/signal-react'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { IconButton } from '~/view/ui-utility/widget/button/icon-button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { FillItemComp } from './fill-item'

type IFillPropComp = {}

export const FillPropComp: FC<IFillPropComp> = observer(({}) => {
  const { classes, css, theme } = useStyles({})
  const { fills } = OperateFill
  useHookSignal(fills)
  return (
    <Flex
      layout='v'
      sidePadding={6}
      className={css({
        ...theme.rect('100%', 'fit-content', 'no-radius', 'white'),
        ...theme.default$.borderBottom,
        padding: 8,
      })}>
      <Flex
        layout='h'
        className={css({
          ...theme.rect('100%', 24),
        })}>
        <Flex layout='c' className={css({ ...theme.labelFont })}>
          <h4>填充</h4>
        </Flex>
        <IconButton size={16} style={{ marginLeft: 'auto' }} onClick={OperateFill.addFill}>
          {Asset.editor.leftPanel.page.add}
        </IconButton>
      </Flex>
      {fills.value.map((fill, index) => (
        <FillItemComp key={index} fill={fill} index={index} />
      ))}
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
