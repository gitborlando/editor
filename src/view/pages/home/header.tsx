import { Button, Typography } from '@arco-design/web-react'
import { Icon } from '@gitborlando/widget'
import { UserService } from 'src/global/service/user'

export const HomeHeaderComp: FC<{}> = observer(({}) => {
  return (
    <G className={cls()} horizontal center>
      <G horizontal gap={8} className={cls('title')}>
        <Icon url={Assets.favIcon.sigma2} className={cls('title-icon')} />
        <h4>Sigma Editor</h4>
      </G>
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
    align-content: end;
    align-items: 'end';
    font-weight: 600;
    font-size: 18px;
    color: var(--color);
    &-icon {
      width: 24px;
      height: 24px;
    }
  }
`)
