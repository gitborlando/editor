import { observer, useLocalObservable } from 'mobx-react'
import { FC } from 'react'
import { useEditor } from '~/ui/context'
import { makeStyles } from '~/ui/theme'
import { Flex } from '~/ui/widget/flex'
import { PageHeaderComp } from './header'
import { PageItemComp } from './item'
import { pageCompShareState } from './state'

type IPageComp = {}

export const PageComp: FC<IPageComp> = observer(({}) => {
  const { classes } = useStyles({})
  const { collapsed } = pageCompShareState
  const { drag, schema } = useEditor()
  const state = useLocalObservable(() => ({
    height: 200,
  }))
  return (
    <Flex layout='v' className={classes.Page}>
      <PageHeaderComp />
      <Flex
        layout='v'
        className={classes.pageList}
        vshow={!collapsed}
        style={{ height: state.height, overflow: 'overlay' }}>
        {schema.page.pages.map((page) => (
          <PageItemComp key={page.id} name={page.name} id={page.id} />
        ))}
      </Flex>
      <Flex
        layout='c'
        className={classes.move}
        vshow={!collapsed}
        onMouseDown={() => {
          let lastHeight = state.height
          drag.setCursor('n-resize').onSlide(({ shift }) => {
            let newHeight = lastHeight + shift.y
            if (newHeight <= 30) return
            state.height = newHeight
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
  },
  move: {
    ...t.rect('100%', 5, 'no-radius'),
    cursor: 'n-resize',
  },
}))

PageComp.displayName = 'PageComp'
