import { Button } from '@arco-design/web-react'
import { FC } from 'react'
import './index.less'

interface HomeHeaderProps {}

export const HomeHeaderComp: FC<HomeHeaderProps> = observer(({}) => {
  return (
    <G className='homeHeader' horizontal='auto auto' center>
      <TitleComp />
      <Button type='primary' style={{ marginLeft: 'auto' }}>
        新建文件
      </Button>
    </G>
  )
})

const TitleComp: FC<{}> = ({}) => {
  return (
    <G center horizontal='auto auto' className='homeHeader-title'>
      <img src={Assets.favIcon.shiyangyang} />
      <h4>Young 编辑器</h4>
    </G>
  )
}
