import { FC, memo } from 'react'
import usePromise from 'react-promise-suspense'
import { IImage, Img } from '~/editor/editor/img'
import { IFillImage } from '~/editor/schema/type'
import { UIPickerCopy } from '~/editor/ui-state/right-panel/operate/picker'
import { Uploader } from '~/global/upload'
import { useAutoSignal } from '~/shared/signal/signal-react'
import { iife } from '~/shared/utils/normal'
import { useMemoComp, withSuspense } from '~/shared/utils/react'
import { Flex } from '~/view/ui-utility/widget/flex'

type IPickerImageComp = {
  fill: IFillImage
}

export const PickerImageComp: FC<IPickerImageComp> = memo(({ fill }) => {
  const { setFillUrl } = UIPickerCopy
  const isHover = useAutoSignal(false)

  const uploadImage = async () => {
    const file = await Uploader.open({ accept: 'image/*' })
    const url = await Img.uploadLocal(file!)
    setFillUrl(url)
  }

  const ImgComp = useMemoComp([fill.url], ({}) => {
    const image = usePromise<[string], IImage>(() => Img.getImageAsync(fill.url), [fill.url])
    const imageBound = iife(() => {
      const { width, height } = image
      const rate = width / height
      return rate > 1 ? { width: 240, height: 240 / rate } : { width: 200 * rate, height: 200 }
    })
    return <img src={image.objectUrl} style={{ ...imageBound }}></img>
  })

  return (
    <Flex className='lay-v wh-100%-fit bg-white relative'>
      <Flex className='lay-c wh-100%-200 relative of-hidden bg-black' onHover={isHover.dispatch}>
        {isHover.value && (
          <Flex className='lay-c wh-100% bg-[rgba(0,0,0,0.2)] absolute '>
            <Flex
              className='lay-c wh-80-32-5 b-1-white text-white text-14 pointer'
              onClick={uploadImage}>
              更换图片
            </Flex>
          </Flex>
        )}
        {withSuspense(<ImgComp />)}
      </Flex>
    </Flex>
  )
})
