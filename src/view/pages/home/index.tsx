import { HomeFilesComp } from 'src/view/pages/home/files'
import { HomeHeaderComp } from 'src/view/pages/home/header'
import './index.less'

export const HomeComp: FC<{}> = observer(({}) => {
  return (
    <G className='home' vertical='auto 1fr'>
      <HomeHeaderComp />
      <HomeFilesComp />
    </G>
  )
})
