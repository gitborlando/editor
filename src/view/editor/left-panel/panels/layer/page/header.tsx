import { FC } from 'react'
import Asset from '~/assets'
import { SchemaPage } from '~/editor/schema/page'
import { UILeftPanelLayer } from '~/editor/ui-state/left-panel/layer'
import { useHookSignal } from '~/shared/signal-react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

type IPageHeaderComp = {}

export const PageHeaderComp: FC<IPageHeaderComp> = ({}) => {
  const { classes } = useStyles({})
  const { allPageExpanded } = UILeftPanelLayer
  useHookSignal(allPageExpanded)
  useHookSignal(SchemaPage.currentPage)
  return (
    <Flex layout='h' shrink={0} sidePadding={4} className={classes.PageHeader}>
      <Flex layout='c' className={classes.selectPageName}>
        {SchemaPage.currentPage.value.name}
      </Flex>
      <Button
        type='icon'
        style={{ marginLeft: 'auto' }}
        onClick={() => {
          if (allPageExpanded.value === false) allPageExpanded.dispatch(true)
          SchemaPage.add()
          SchemaPage.pages.dispatch()
        }}>
        <Icon size={16}>{Asset.editor.leftPanel.page.add}</Icon>
      </Button>
      <Button type='icon' onClick={() => allPageExpanded.dispatch(!allPageExpanded.value)}>
        <Icon size={16} rotate={allPageExpanded.value ? 180 : 0}>
          {Asset.editor.leftPanel.page.collapse}
        </Icon>
      </Button>
    </Flex>
  )
}

type IPageHeaderCompStyle = {} /* & Required<Pick<IPageHeaderComp>> */ /* & Pick<IPageHeaderComp> */

const useStyles = makeStyles<IPageHeaderCompStyle>()((t) => ({
  PageHeader: {
    ...t.rect('100%', t.default$.normalHeight, 'no-radius', 'white'),
  },
  selectPageName: {
    ...t.labelFont,
    paddingLeft: 6,
  },
}))

PageHeaderComp.displayName = 'PageHeaderComp'
