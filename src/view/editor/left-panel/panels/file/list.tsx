import { FC, memo } from 'react'
import usePromise from 'react-promise-suspense'
import { FileManager } from '~/editor/editor/file-manager'
import { Schema } from '~/editor/schema/schema'
import { IMeta } from '~/editor/schema/type'
import { useAutoSignal, useHookSignal } from '~/shared/signal/signal-react'
import { stopPropagation } from '~/shared/utils/event'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { IconButton } from '~/view/ui-utility/widget/button/icon-button'
import { Flex } from '~/view/ui-utility/widget/flex'

type IListComp = {}

export const ListComp: FC<IListComp> = memo(({}) => {
  const { classes, cx } = useStyles({})
  const { openInNewTab, deleteFile, fileMetaList$, getFileMetaList } = FileManager
  useHookSignal(fileMetaList$)

  usePromise<[string], void>(getFileMetaList, ['getFileMetaList'])

  const ListItemComp: FC<{ meta: IMeta }> = memo(({ meta }) => {
    const selected = meta.fileId === Schema.meta.fileId
    const isHover = useAutoSignal(false)
    return (
      <Flex
        layout='h'
        className={cx(classes.listItem, selected && classes.selectedListItem, 'px-10')}
        onHover={isHover.dispatch}
        onClick={() => openInNewTab(meta.fileId)}>
        {meta.name}
        {isHover.value && (
          <IconButton
            size={12}
            style={{ marginLeft: 'auto' }}
            onClick={stopPropagation(() => deleteFile(meta.fileId))}>
            {Asset.editor.shared.delete}
          </IconButton>
        )}
      </Flex>
    )
  })

  return (
    <Flex layout='v' className={classes.List}>
      {fileMetaList$.value.map((meta) => (
        <ListItemComp key={meta.fileId} meta={meta} />
      ))}
    </Flex>
  )
})

type IListCompStyle = {} /* & Required<Pick<IListComp>> */ /* & Pick<IListComp> */

const useStyles = makeStyles<IListCompStyle>()((t) => ({
  List: {
    ...t.rect('100%', '100%'),
  },
  listItem: {
    ...t.rect('100%', 32),
    ...t.font(undefined, 12),
    ...t.default$.borderBottom,
    ...t.cursor('pointer'),
    ...t.default$.hover.border,
  },
  selectedListItem: {
    ...t.default$.select.background,
  },
}))

ListComp.displayName = 'ListComp'
