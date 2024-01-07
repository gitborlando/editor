import { observer } from 'mobx-react'
import { FC } from 'react'
import { useHookSignal } from '~/shared/utils/signal'
import { useEditor, useGlobalService } from '~/view/context'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { PageHeaderComp } from './header'
import { PageItemComp } from './item'

type IPageComp = {}

export const PageComp: FC<IPageComp> = observer(({}) => {
  const { classes } = useStyles({})
  const { SchemaPage, UILeftPanelLayer } = useEditor()
  const { allPageExpanded, pagePanelHeight } = UILeftPanelLayer
  const { Drag } = useGlobalService()
  useHookSignal(pagePanelHeight)
  useHookSignal(allPageExpanded)
  return (
    <Flex layout='v' shrink={0} className={classes.Page}>
      <PageHeaderComp />
      <Flex
        layout='v'
        className={classes.pageList}
        vshow={allPageExpanded.value}
        shrink={1}
        style={{ height: pagePanelHeight.value - 37 }}>
        {SchemaPage.pages.map((page) => (
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
})

type IPageCompStyle = {} /* & Required<Pick<IPageComp>> */ /* & Pick<IPageComp> */

const useStyles = makeStyles<IPageCompStyle>()((t) => ({
  Page: {
    ...t.rect('100%', 'fit-content'),
    ...t.default$.borderBottom,
  },
  pageList: {
    ...t.rect('100%', '100%'),
    overflow: 'overlay',
  },
  move: {
    ...t.rect('100%', 5, 'no-radius'),
    cursor: 'n-resize',
  },
}))

PageComp.displayName = 'PageComp'
