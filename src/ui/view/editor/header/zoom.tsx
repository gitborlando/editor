import { observer, useLocalObservable } from 'mobx-react'
import { FC } from 'react'
import { useServices } from '~/ioc'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'

type IZoomComp = {}

export const ZoomComp: FC<IZoomComp> = observer(({}) => {
  const { classes } = useStyles({})
  const {} = useServices()
  const state = useLocalObservable(() => ({}))

  return <Flex className={classes.Zoom}></Flex>
})

type IZoomCompStyle = {} /* & Required<Pick<IZoomComp>> */ /* & Pick<IZoomComp> */

const useStyles = makeStyles<IZoomCompStyle>()((t) => ({
  Zoom: {
    ...t.rect('100%', 30, 'no-radius', 'white'),
    borderBottom: '1px solid gray',
  },
}))

ZoomComp.displayName = 'ZoomComp'
