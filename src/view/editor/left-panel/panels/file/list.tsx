import { FC, memo } from 'react'
import usePromise from 'react-promise-suspense'
import { FileManager } from '~/editor/editor/file-manager'
import { Schema } from '~/editor/schema/schema'
import { IMeta } from '~/editor/schema/type'
import { useAutoSignal, useHookSignal } from '~/shared/signal/signal-react'
import { hslBlueColor } from '~/shared/utils/color'
import Asset from '~/view/ui-utility/assets'
import { IconButton } from '~/view/ui-utility/widget/button/icon-button'
import { Flex } from '~/view/ui-utility/widget/flex'

type IListComp = {}

export const ListComp: FC<IListComp> = memo(({}) => {
  const { openInNewTab, deleteFile, fileMetaList$, getFileMetaList } = FileManager
  useHookSignal(fileMetaList$)

  usePromise<[string], void>(getFileMetaList, ['getFileMetaList'])

  const ListItemComp: FC<{ meta: IMeta }> = memo(({ meta }) => {
    const selected = meta.fileId === Schema.meta.fileId
    const isHover = useAutoSignal(false)

    return (
      <Flex
        className={'lay-h wh-100%-32 text-12 pointer borderBottom d-hover-border px-10'}
        onHover={isHover.dispatch}
        onClick={() => openInNewTab(meta.fileId)}>
        {meta.name}
        {selected && (
          <IconButton size={16} fill={hslBlueColor(60)} className='ml-auto'>
            {Asset.editor.leftPanel.page.pageSelect}
          </IconButton>
        )}
      </Flex>
    )
  })

  return (
    <Flex className='lay-v wh-100%'>
      {fileMetaList$.value.map((meta) => (
        <ListItemComp key={meta.fileId} meta={meta} />
      ))}
    </Flex>
  )
})
