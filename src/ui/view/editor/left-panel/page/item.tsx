import { observer, useLocalObservable } from 'mobx-react'
import { FC } from 'react'
import { useServices } from '~/ioc'
import { makeStyles } from '~/ui/theme'
import { Button } from '~/ui/widget/button'
import { Flex } from '~/ui/widget/flex'

type IPageItemComp = {
  name: string
  id: string
}

export const PageItemComp: FC<IPageItemComp> = observer(({ name, id }) => {
  const { schemaPageService } = useServices()
  const { classes } = useStyles({ selected: schemaPageService.currentId === id })
  const state = useLocalObservable(() => ({
    isHover: false,
  }))
  return (
    <Flex
      layout='h'
      justify='space-between'
      className={classes.PageItem}
      onHover={(hover) => (state.isHover = hover)}
      onClick={() => schemaPageService.select(id)}>
      <Flex layout='h' sidePadding={15} className={classes.name}>
        {name}
      </Flex>
      {state.isHover && (
        <Button
          onClick={(e) => {
            e.stopPropagation()
            schemaPageService.delete(id)
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
    cursor: 'pointer',
    // flexShrink: 0,
    ...(selected
      ? { backgroundColor: 'rgba(136, 130, 255, 0.21)' }
      : { ...t.default$.hover.background }),
  },
  name: {
    fontSize: 12,
    //...(selected && t.default$.color.active),
  },
}))

PageItemComp.displayName = 'PageItemComp'
