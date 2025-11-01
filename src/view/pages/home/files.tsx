import { Card } from '@arco-design/web-react'
import { miniId } from '@gitborlando/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import Scrollbars from 'react-custom-scrollbars-2'
import { FileService } from 'src/global/service/file'
import { Loading } from 'src/view/component/loading'
import { suspense } from 'src/view/component/suspense'
import { Tables } from 'types/supabase'

export const HomeFilesComp: FC<{}> = suspense(
  observer(({}) => {
    const { data } = useSuspenseQuery({
      queryKey: ['files'],
      queryFn: () => FileService.getFiles(),
    })

    return (
      <G style={{ minHeight: 0, minWidth: 0, overflow: 'auto' }}>
        <Scrollbars>
          <G className={cls()} horizontal='repeat(auto-fill, 320px)' gap={24}>
            {data?.map((file) => (
              <FileItemComp key={file.id + miniId()} file={file} />
            ))}
          </G>
        </Scrollbars>
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
      className={cls('item')}
      cover={
        <G className={cls('item-cover')}>
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

const cls = classes(css`
  padding: 20px;
  gap: 20px;
  &-item {
    width: 320px;
    height: 257px;
    ${styles.borderRadius}
    cursor: pointer;
    border: none;
    &:hover {
      outline: 2px solid var(--color);
      outline-offset: 2px;
    }
    &-cover {
      width: 100%;
      height: 200px;
      object-fit: cover;
      ${styles.borderRadius}
      overflow: hidden;
    }
    & .arco-card-body {
      padding: 4px 0;
    }
  }
`)
