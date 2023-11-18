import { observer } from 'mobx-react'
import { FC } from 'react'
import { useEditor } from '~/ui/context'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'

type IDragMaskComp = {}

export const DragMaskComp: FC<IDragMaskComp> = observer(({}) => {
  const { classes } = useStyles({})
  const { drag } = useEditor()
  return (
    <Flex
      className={classes.DragMask}
      vshow={drag.canMove}
      style={{
        cursor: drag.cursor,
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
