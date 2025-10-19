import { Button } from '@arco-design/web-react'
import { FC } from 'react'
import { UserService } from 'src/global/service/user'
import './index.less'

interface HomeHeaderProps {}

export const HomeHeaderComp: FC<HomeHeaderProps> = observer(({}) => {
  return (
    <G className='homeHeader' horizontal center>
      <h4 className='homeHeader-title'>Young 编辑器</h4>
      <G horizontal center>
        <Button type='primary' style={{ marginLeft: 'auto' }}>
          新建文件
        </Button>
        <G
          dangerouslySetInnerHTML={{ __html: UserService.avatar }}
          style={{ width: '32px', height: '32px' }}></G>
      </G>
    </G>
  )
})
