import { FC, memo } from 'react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { HeaderComp } from './header'

type IFileComp = {}

export const FileComp: FC<IFileComp> = memo(({}) => {
  const { classes, theme, css } = useStyles({})
  return (
    <Flex className={classes.File}>
      <HeaderComp />
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
