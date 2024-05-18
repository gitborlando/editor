import { FC, memo } from 'react'
import { FileManager } from '~/editor/editor/file-manager'
import { useMemoComp, withSuspense } from '~/shared/utils/react'
import Asset from '~/view/ui-utility/assets'
import { IconButton } from '~/view/ui-utility/widget/button/icon-button'
import { CompositeInput } from '~/view/ui-utility/widget/compositeInput'
import { Flex } from '~/view/ui-utility/widget/flex'
import { ListComp } from './list'

type IFileComp = {}

export const FileComp: FC<IFileComp> = memo(({}) => {
  const HeaderComp = useMemoComp([], ({}) => {
    return (
      <Flex className='lay-h wh-100%-32 px-10 borderBottom'>
        <CompositeInput placeholder='搜索' value={''} onNewValueApply={() => {}} />
        <Flex className='lay-h ml-auto'>
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

  return (
    <Flex className='lay-v wh-100% d-scroll of-y-auto'>
      <HeaderComp />
      {withSuspense(<ListComp />)}
    </Flex>
  )
})
