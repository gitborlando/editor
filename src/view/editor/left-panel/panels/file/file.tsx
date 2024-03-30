import { FC, Suspense, memo } from 'react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { HeaderComp } from './header'
import { ListComp } from './list'

type IFileComp = {}

export const FileComp: FC<IFileComp> = memo(({}) => {
  const { classes, theme, css } = useStyles({})
  return (
    <Flex layout='v' className={classes.File}>
      <HeaderComp />
      <Suspense>
        <ListComp />
      </Suspense>
    </Flex>
  )
})

type IFileCompStyle = {} /* & Required<Pick<IFileComp>> */ /* & Pick<IFileComp> */

const useStyles = makeStyles<IFileCompStyle>()((t) => ({
  File: {
    ...t.rect('100%', '100%'),
    ...t.default$.scrollBar,
    overflowY: 'auto',
  },
}))

FileComp.displayName = 'FileComp'
