import { FC, memo } from 'react'
import usePromise from 'react-promise-suspense'
import { EditorCommand } from 'src/editor/editor/command'
import { FileManager } from 'src/editor/editor/file-manager'
import { SchemaDefault } from 'src/editor/schema/default'
import { Schema } from 'src/editor/schema/schema'
import { IMeta } from 'src/editor/schema/type'
import { Menu } from 'src/global/menu'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { useMemoComp, withSuspense } from 'src/shared/utils/react'
import Asset from 'src/view/ui-utility/assets'
import { Button } from 'src/view/ui-utility/widget/button'
import { IconButton } from 'src/view/ui-utility/widget/button/icon-button'
import { Flex } from 'src/view/ui-utility/widget/flex'

type IFileComp = {}

export const FileComp: FC<IFileComp> = memo(({}) => {
  const HeaderComp = useMemoComp([], ({}) => {
    return (
      <Flex className='lay-h wh-100%-32 px-10 borderBottom'>
        <Button className='-ml-4' onClick={FileManager.openFile}>
          打开文件
        </Button>
        <Flex className='lay-h ml-auto'>
          <IconButton size={14} onClick={() => {}}>
            {Asset.editor.leftPanel.file.newFolder}
          </IconButton>
          <IconButton size={13} onClick={() => FileManager.addFile(SchemaDefault.schema())}>
            {Asset.editor.leftPanel.file.newFile}
          </IconButton>
        </Flex>
      </Flex>
    )
  })

  const FileListComp = useMemoComp([], ({}) => {
    const { openInNewTab, fileMetaList$, getFileMetaList } = FileManager
    useHookSignal(fileMetaList$)

    usePromise<[string], void>(getFileMetaList, ['getFileMetaList'])

    const ListItemComp: FC<{ meta: IMeta }> = memo(({ meta }) => {
      const selected = meta.fileId === Schema.meta.fileId

      const makeMenu = () => {
        const { fileGroup } = EditorCommand
        Menu.context = { id: meta.fileId }
        Menu.menuOptions.dispatch([fileGroup])
      }

      return (
        <Flex
          className={'lay-h wh-100%-32 text-12 pointer borderBottom d-hover-border px-10'}
          onContextMenu={makeMenu}
          onClick={() => openInNewTab(meta.fileId)}>
          {meta.name}
          {selected && (
            <IconButton size={16} className='ml-auto path-fill-hslb60'>
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

  return (
    <Flex className='lay-v wh-100% d-scroll of-y-auto'>
      <HeaderComp />
      {withSuspense(<FileListComp />)}
    </Flex>
  )
})
