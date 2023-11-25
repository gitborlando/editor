import { observer } from 'mobx-react'
import { FC } from 'react'
import { useServices } from '~/ioc'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { pageCompShareState } from './state'

type IPageHeaderComp = {}

export const PageHeaderComp: FC<IPageHeaderComp> = observer(({}) => {
  const { classes } = useStyles({})
  const { schemaPageService } = useServices()
  const { collapsed, setCollapsed } = pageCompShareState
  return (
    <Flex className={classes.PageHeader}>
      <Flex layout='c' className={classes.selectPageName}>
        {schemaPageService.currentPage?.name}
      </Flex>
      <Button style={{ marginLeft: 'auto' }} onClick={() => schemaPageService.add()}>
        新建
      </Button>
      <Button onClick={() => setCollapsed(!collapsed)}>{collapsed ? '展开' : '收起'}</Button>
    </Flex>
  )
})

type IPageHeaderCompStyle = {} /* & Required<Pick<IPageHeaderComp>> */ /* & Pick<IPageHeaderComp> */

const useStyles = makeStyles<IPageHeaderCompStyle>()((t) => ({
  PageHeader: {
    ...t.rect('100%', t.default$.normalHeight, 'no-radius', 'white'),
  },
  selectPageName: {
    ...t.labelFont,
    paddingLeft: 10,
  },
}))

PageHeaderComp.displayName = 'PageHeaderComp'
