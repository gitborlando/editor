import { nanoid } from 'nanoid'
import { Photo, createClient } from 'pexels'
import { FC, useRef } from 'react'
import { InView } from 'react-intersection-observer'
import { Img } from '~/editor/editor/img'
import { UIPickerCopy } from '~/editor/ui-state/right-panel/operate/picker'
import { useAutoSignal, useHookSignal } from '~/shared/signal/signal-react'
import Asset from '~/view/ui-utility/assets'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

const pexels = createClient('1vbcKedpSbDaktXlI6jmDczCNUBMqDkXL3Gndwp7HMblwGoENO4xlDnm')

type IGalleryComp = {}

export const GalleryComp: FC<IGalleryComp> = ({}) => {
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
        className='lay-c mb-4'
        onDragStart={onDragStart}
        style={{ width: photo.width, height: photo.height }}>
        <img className='wh-100%' src={photo.src.small} onClick={applyImageFill}></img>
        {loadingWebImageUrl.value === photoUrl && (
          <Flex className='lay-c wh-100% bg-[rgba(0,0,0,0.5)] absolute'>
            <Icon size={20} className='absolute'>
              {Asset.editor.shared.loading}
            </Icon>
          </Flex>
        )}
      </Flex>
    )
  }

  return (
    <Flex className='shrink-0 wh-100%'>
      <Flex className='lay-v wh-100% d-scroll of-y-auto'>
        <Flex className='wh-100%-fit gap-4-4'>
          <Flex className='lay-v'>
            {leftList.current.list.map((photo, i) => (
              <PhotoComp key={nanoid()} photo={photo} />
            ))}
          </Flex>
          <Flex className='lay-v'>
            {rightList.current.list.map((photo, i) => (
              <PhotoComp key={nanoid()} photo={photo} />
            ))}
          </Flex>
        </Flex>
        <Flex className='lay-c wh-100%-40 shrink-0'>
          <InView as={'div'} className='wh-fit-fit' onChange={(inView) => inView && load()}>
            <Icon size={20}>{Asset.editor.shared.loading}</Icon>
          </InView>
        </Flex>
      </Flex>
    </Flex>
  )
}
