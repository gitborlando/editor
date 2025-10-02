import { Card } from '@arco-design/web-react'
import { Icon } from '@gitborlando/widget'
import { useSuspenseQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { FC } from 'react'
import { FileService } from 'src/global/api/service/file'
import { Loading } from 'src/view/component/loading'
import { suspense } from 'src/view/component/suspense'
import { Tables } from 'types/supabase'
import './index.less'

export const FilesComp: FC<{}> = suspense(
  observer(({}) => {
    const { data } = useSuspenseQuery({
      queryKey: ['files'],
      queryFn: () => FileService.getFiles(),
    })

    return (
      <G className='files' horizontal='repeat(auto-fill, 320px)' gap={24}>
        <NewFileComp />
        {data?.map((file) => (
          <FileItemComp key={file.id} file={file} />
        ))}
      </G>
    )
  }),
  <Loading />,
)

const FileItemComp: FC<{ file: Tables<'files'> }> = ({ file }) => {
  const navigate = useNavigate()
  const handleClick = () => navigate(`/fileId/${file.id}`)

  return (
    <Card
      onClick={() => handleClick()}
      className='files-item'
      cover={
        <G className='files-item-cover'>
          <img
            draggable={false}
            src={
              'https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp'
            }
            alt={file.name}
          />
        </G>
      }>
      <Card.Meta
        title={decodeURIComponent(file.name)}
        description={dayjs(file.createdAt).format('YYYY-MM-DD HH:mm:ss')}
      />
    </Card>
  )
}

const NewFileComp: FC<{}> = ({}) => {
  return (
    <Card
      onClick={() => {}}
      className='files-item'
      cover={
        <G
          className='files-item-newFile'
          style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Icon url={Assets.editor.leftPanel.file.newFile} />
        </G>
      }>
      <Card.Meta title={'新建文件'} description={dayjs().format('YYYY-MM-DD HH:mm:ss')} />
    </Card>
  )
}
