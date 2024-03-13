import { FC } from 'react'
import { SchemaPage } from '~/editor/schema/page'
import { UILeftPanelLayer } from '~/editor/ui-state/left-panel/layer'
import { Drag } from '~/global/event/drag'
import { useHookSignal } from '~/shared/signal-react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PageHeaderComp } from './header'
import { PageItemComp } from './item'

type IPageComp = {}

export const PageComp: FC<IPageComp> = ({}) => {
  const { classes } = useStyles({})
  const { allPageExpanded, pagePanelHeight } = UILeftPanelLayer
  useHookSignal(pagePanelHeight)
  useHookSignal(allPageExpanded)
  useHookSignal(SchemaPage.pages)
  return (
    <Flex layout='v' shrink={0} className={classes.Page}>
      <PageHeaderComp />
      <Flex
        layout='v'
        className={classes.pageList}
        vshow={allPageExpanded.value}
        shrink={1}
        style={{ height: pagePanelHeight.value - 37 }}>
        {SchemaPage.pages.value
          .filter((page) => !page.DELETE)
          .map((page) => (
            <PageItemComp key={page.id} name={page.name} id={page.id} />
          ))}
      </Flex>
      <Flex
        layout='c'
        shrink={0}
        className={classes.move}
        vshow={allPageExpanded.value}
        onMouseDown={() => {
          let lastHeight = pagePanelHeight.value
          Drag.setCursor('n-resize').onSlide(({ shift }) => {
            let newHeight = lastHeight + shift.y
            if (newHeight <= 69 || newHeight >= 800) return
            pagePanelHeight.dispatch(newHeight)
          })
        }}></Flex>
    </Flex>
  )
}

type IPageCompStyle = {} /* & Required<Pick<IPageComp>> */ /* & Pick<IPageComp> */

const useStyles = makeStyles<IPageCompStyle>()((t) => ({
  Page: {
    ...t.rect('100%', 'fit-content'),
    ...t.default$.borderBottom,
  },
  pageList: {
    ...t.rect('100%', '100%'),
    overflow: 'overlay',
    ...t.default$.scrollBar,
  },
  move: {
    ...t.rect('100%', 5, 'no-radius'),
    cursor: 'n-resize',
  },
}))

PageComp.displayName = 'PageComp'
