import { observer } from 'mobx-react'
import { Photo, createClient } from 'pexels'
import { FC, useRef } from 'react'
import { InView } from 'react-intersection-observer'
import { useAutoSignal } from '~/shared/signal-react'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

type IGalleryComp = {}

export const GalleryComp: FC<IGalleryComp> = observer(({}) => {
  return null
  const pexels = useRef(createClient('1vbcKedpSbDaktXlI6jmDczCNUBMqDkXL3Gndwp7HMblwGoENO4xlDnm'))
  const page = useAutoSignal(1)
  const leftList = useRef({ list: [] as Photo[], height: 0 })
  const rightList = useRef({ list: [] as Photo[], height: 0 })
  const load = async () => {
    const response = await pexels.current.photos.curated({ page: page.value, per_page: 20 })
    if ('error' in response) return
    const { photos } = response
    photos.forEach((photo) => {
      const displayHeight = (photo.height / photo.width) * 120
      photo.width = 120
      photo.height = displayHeight
      const shortList = leftList.current.height < rightList.current.height ? leftList : rightList
      shortList.current.height += displayHeight
      shortList.current.list.push(photo)
    })
    page.dispatch(page.value + 1)
  }
  const { theme, css, classes } = useStyles({})
  return (
    <Flex shrink={0} className={css({ ...theme.rect('100%', '100%') })}>
      <Flex layout='v' className={classes.Gallery}>
        <Flex className={classes.list}>
          <Flex layout='v'>
            {leftList.current.list.map((photo) => (
              <img
                key={photo.id + photo.height}
                className={classes.photo}
                src={photo.src.medium}
                style={{ width: photo.width, height: photo.height }}></img>
            ))}
          </Flex>
          <Flex layout='v'>
            {rightList.current.list.map((photo) => (
              <img
                key={photo.id + photo.height}
                className={classes.photo}
                src={photo.src.medium}
                style={{ width: photo.width, height: photo.height }}></img>
            ))}
          </Flex>
        </Flex>
        <InView as={'div'} className={classes.inView} onChange={(inView) => inView && load()}>
          <Icon size={20}>{Asset.editor.shared.loading}</Icon>
        </InView>
      </Flex>
    </Flex>
  )
})

type IGalleryCompStyle = {} /* & Required<Pick<IGalleryComp>> */ /* & Pick<IGalleryComp> */

const useStyles = makeStyles<IGalleryCompStyle>()((t) => ({
  Gallery: {
    ...t.rect('100%', '100%'),
    ...t.default$.scrollBar,
    overflowY: 'auto',
  },
  list: {
    ...t.rect('100%', 'fit-content'),
    gap: 4,
  },
  photo: {
    marginBottom: 4,
  },
  inView: {
    ...t.rect('100%', 40),
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
}))

GalleryComp.displayName = 'GalleryComp'
