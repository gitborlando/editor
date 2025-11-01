import { Button, Typography } from '@arco-design/web-react'
import { UserService } from 'src/global/service/user'

export const HomeHeaderComp: FC<{}> = observer(({}) => {
  return (
    <G className={cls()} horizontal center>
      <h4 className={cls('title')}>Young 编辑器</h4>
      <G horizontal center gap={16}>
        <Button type='primary' style={{ marginLeft: 'auto' }}>
          新建文件
        </Button>
        <G
          dangerouslySetInnerHTML={{ __html: UserService.avatar }}
          style={{ width: '32px', height: '32px' }}></G>
        <Typography.Text style={{ alignSelf: 'center' }}>
          {UserService.userName}
        </Typography.Text>
      </G>
    </G>
  )
})

const cls = classes(css`
  height: 48px;
  padding: 0 20px;
  justify-content: space-between;
  ${styles.borderBottom}
  &-title {
    font-weight: 600;
    font-size: 18px;
    color: var(--color);
  }
`)
