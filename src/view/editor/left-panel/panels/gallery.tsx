import { observer } from 'mobx-react'
import { nanoid } from 'nanoid'
import { Photo, createClient } from 'pexels'
import { FC, useRef } from 'react'
import { InView } from 'react-intersection-observer'
import { Img } from '~/editor/editor/img'
import { UIPickerCopy } from '~/editor/ui-state/right-panel/operate/picker'
import { useAutoSignal, useHookSignal } from '~/shared/signal/signal-react'
import { rgba } from '~/shared/utils/color'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

const pexels = createClient('1vbcKedpSbDaktXlI6jmDczCNUBMqDkXL3Gndwp7HMblwGoENO4xlDnm')

type IGalleryComp = {}

export const GalleryComp: FC<IGalleryComp> = observer(({}) => {
  const page = useAutoSignal(1)
  const leftList = useRef({ list: [] as Photo[], height: 0 })
  const rightList = useRef({ list: [] as Photo[], height: 0 })
  const load = async () => {
    const response = await pexels.photos.curated({ page: page.value, per_page: 12 })
    if ('error' in response) return
    response.photos.forEach((photo) => {
      const displayHeight = (photo.height / photo.width) * 116
      photo.width = 116
      photo.height = displayHeight
      const shortList = leftList.current.height < rightList.current.height ? leftList : rightList
      shortList.current.height += displayHeight
      shortList.current.list.push(photo)
    })
    page.dispatch(page.value + 1)
  }
  const { theme, css, classes } = useStyles({})
  const { loadingWebImageUrl, type, setFillUrl } = UIPickerCopy

  const PhotoComp: FC<{ photo: Photo }> = ({ photo }) => {
    const photoUrl = photo.src.large
    const applyImageFill = async () => {
      loadingWebImageUrl.dispatch(photoUrl)
      await Img.getImageAsync(photoUrl)
      loadingWebImageUrl.dispatch('')
      if (type.value !== 'image') type.dispatch('image')
      setFillUrl(photoUrl)
    }
    const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData(
        'text/plain',
        JSON.stringify({ event: 'dropImage', data: { url: photoUrl } })
      )
    }
    useHookSignal(loadingWebImageUrl)

    return (
      <Flex
        draggable
        layout='c'
        className={classes.photo}
        onDragStart={onDragStart}
        style={{ width: photo.width, height: photo.height }}>
        <img src={photo.src.small} onClick={applyImageFill}></img>
        {loadingWebImageUrl.value === photoUrl && (
          <Flex layout='c' className={'mask'}>
            <Icon size={20} className={'loadingIcon'}>
              {Asset.editor.shared.loading}
            </Icon>
          </Flex>
        )}
      </Flex>
    )
  }

  return (
    <Flex shrink={0} className={css({ ...theme.rect('100%', '100%') })}>
      <Flex layout='v' className={classes.Gallery}>
        <Flex className={classes.list}>
          <Flex layout='v'>
            {leftList.current.list.map((photo, i) => (
              <PhotoComp key={nanoid()} photo={photo} />
            ))}
          </Flex>
          <Flex layout='v'>
            {rightList.current.list.map((photo, i) => (
              <PhotoComp key={nanoid()} photo={photo} />
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
    '& .mask': {
      ...t.rect('100%', '100%', 'no-radius', rgba(0, 0, 0, 0.5)),
      position: 'absolute',
    },
    '& img': {
      ...t.rect('100%', '100%'),
    },
    '& .loadingIcon': {
      position: 'absolute',
    },
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
