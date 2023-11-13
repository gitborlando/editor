import { observer, useLocalObservable } from 'mobx-react'
import { FC } from 'react'
import { editor } from '~/service/editor/editor'
import { makeStyles } from '~/ui/theme'
import { Button } from '~/ui/widget/button'
import { Flex } from '~/ui/widget/flex'

type IPageItemComp = {
  name: string
  id: string
}

export const PageItemComp: FC<IPageItemComp> = observer(({ name, id }) => {
  const selected = editor.schema.page.currentId === id
  const { classes } = useStyles({ selected })
  const state = useLocalObservable(() => ({
    isHover: false,
  }))
  return (
    <Flex
      layout='h'
      className={classes.PageItem}
      style={{ justifyContent: 'space-between' }}
      onHover={(hover) => (state.isHover = hover)}
      onClick={() => editor.schema.page.select(id)}>
      <Flex layout='h' sidePadding={15} className={classes.name}>
        {name}
      </Flex>
      {state.isHover && (
        <Button
          onClick={(e) => {
            e.stopPropagation()
            editor.schema.page.delete(id)
          }}>
          删除
        </Button>
      )}
    </Flex>
  )
})

type IPageItemCompStyle = {
  selected: boolean
} /* & Required<Pick<IPageItemComp>> */ /* & Pick<IPageItemComp> */

const useStyles = makeStyles<IPageItemCompStyle>()((t, { selected }) => ({
  PageItem: {
    ...t.rect('100%', t.default$.normalHeight, 'no-radius', 'white'),
    ...t.default$.hover.background,
    cursor: 'pointer',
    flexShrink: 0,
  },
  name: {
    fontSize: 12,
    //...(selected && t.default$.color.active),
  },
}))

PageItemComp.displayName = 'PageItemComp'
