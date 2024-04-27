import { FC, memo } from 'react'
import { OperateAlign } from '~/editor/operate/align'
import { useHookSignal } from '~/shared/signal/signal-react'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

type IAlignComp = {}

export const AlignComp: FC<IAlignComp> = memo(({}) => {
  const { classes } = useStyles({})
  const { alignTypes, canAlign, currentAlign: setAlign } = OperateAlign
  useHookSignal(canAlign)
  return (
    <Flex layout='h' shrink={0} justify='space-around' className={classes.Align}>
      {alignTypes.map((type) => (
        <Button key={type} disabled={!canAlign.value} onClick={() => setAlign.dispatch(type)}>
          <Icon size={16} fill={canAlign.value ? '' : '#E6E6E6'}>
            {Asset.editor.rightPanel.operate.align[type]}
          </Icon>
        </Button>
      ))}
    </Flex>
  )
})

type IAlignCompStyle = {} /* & Required<Pick<IAlignComp>> */ /* & Pick<IAlignComp> */

const useStyles = makeStyles<IAlignCompStyle>()((t) => ({
  Align: {
    ...t.rect('100%', 36),
    ...t.default$.borderBottom,
  },
}))

AlignComp.displayName = 'AlignComp'
