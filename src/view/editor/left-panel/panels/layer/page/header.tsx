import { FC } from 'react'
import { OperateMeta } from '~/editor/operate/meta'
import { UILeftPanelLayer } from '~/editor/ui-state/left-panel/layer'
import { useHookSignal } from '~/shared/signal/signal-react'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { Button } from '~/view/ui-utility/widget/button'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

type IPageHeaderComp = {}

export const PageHeaderComp: FC<IPageHeaderComp> = ({}) => {
  const { classes } = useStyles({})
  const { allPageExpanded } = UILeftPanelLayer
  useHookSignal(allPageExpanded)
  useHookSignal(OperateMeta.curPage)

  const newPage = () => {
    if (allPageExpanded.value === false) {
      allPageExpanded.dispatch(true)
    }
    OperateMeta.addPage()
  }
  return (
    <Flex layout='h' shrink={0} sidePadding={4} className={classes.PageHeader}>
      <Flex layout='c' className={classes.selectPageName}>
        {OperateMeta.curPage.value.name}
      </Flex>
      <Button type='icon' style={{ marginLeft: 'auto' }} onClick={newPage}>
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
