import { observer } from 'mobx-react'
import { FC } from 'react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { useEditor } from '../context'

type IDragMaskComp = {}

export const DragMaskComp: FC<IDragMaskComp> = observer(({}) => {
  const { classes } = useStyles({})
  const { Drag } = useEditor()
  return (
    <Flex
      className={classes.DragMask}
      vshow={Drag.canMove}
      style={{
        cursor: Drag.cursor,
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
