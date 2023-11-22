import { observer } from 'mobx-react'
import { FC } from 'react'
import { useService } from '~/ui/context'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'

type IDragMaskComp = {}

export const DragMaskComp: FC<IDragMaskComp> = observer(({}) => {
  const { classes } = useStyles({})
  const { dragService } = useService()
  return (
    <Flex
      className={classes.DragMask}
      vshow={dragService.canMove}
      style={{
        cursor: dragService.cursor,
      }}></Flex>
  )
})

type IDragMaskCompStyle = {} /* & Required<Pick<IDragMaskComp>> */ /* & Pick<IDragMaskComp> */

const useStyles = makeStyles<IDragMaskCompStyle>()((t) => ({
  DragMask: {
    ...t.rect('100vw', '100vh', 'no-radius', 'rgba(0,0,0,0)'),
    ...t.fixed(0, 0),
    zIndex: 2,
  },
}))

DragMaskComp.displayName = 'DragMaskComp'
