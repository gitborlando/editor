import { FC, memo } from 'react'
import { FileManager } from '~/editor/editor/file-manager'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { IconButton } from '~/view/ui-utility/widget/button/icon-button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { InputComp } from '~/view/ui-utility/widget/input'

type IHeaderComp = {}

export const HeaderComp: FC<IHeaderComp> = memo(({}) => {
  const { classes, theme, css, cx } = useStyles({})
  return (
    <Flex layout='h' className={cx(classes.Header, 'px-10')}>
      <InputComp placeholder='搜索' />
      <Flex layout='h' className={classes.iconGroup}>
        <IconButton size={14} onClick={() => {}}>
          {Asset.editor.leftPanel.file.newFolder}
        </IconButton>
        <IconButton size={13} onClick={() => FileManager.newFile()}>
          {Asset.editor.leftPanel.file.newFile}
        </IconButton>
      </Flex>
    </Flex>
  )
})

type IHeaderCompStyle = {} /* & Required<Pick<IHeaderComp>> */ /* & Pick<IHeaderComp> */

const useStyles = makeStyles<IHeaderCompStyle>()((t) => ({
  Header: {
    ...t.rect('100%', 32),
    ...t.default$.borderBottom,
  },
  iconGroup: {
    marginLeft: 'auto',
  },
}))

HeaderComp.displayName = 'HeaderComp'
