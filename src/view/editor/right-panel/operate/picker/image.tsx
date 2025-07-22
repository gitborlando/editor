import { Flex } from '@gitborlando/widget'
import { FC, memo } from 'react'
import usePromise from 'react-promise-suspense'
import { IImage, ImgManager } from 'src/editor/editor/img-manager'
import { IFillImage } from 'src/editor/schema/type'
import { UIPickerCopy } from 'src/editor/ui-state/right-panel/operate/picker'
import { Uploader } from 'src/global/upload'
import { useAutoSignal } from 'src/shared/signal/signal-react'
import { iife } from 'src/shared/utils/normal'
import { useMemoComp, withSuspense } from 'src/shared/utils/react'

type IPickerImageComp = {
  fill: IFillImage
}

export const PickerImageComp: FC<IPickerImageComp> = memo(({ fill }) => {
  const { setFillUrl } = UIPickerCopy
  const isHover = useAutoSignal(false)

  const uploadImage = async () => {
    const file = await Uploader.open({ accept: 'image/*' })
    const url = await ImgManager.uploadLocal(file!)
    setFillUrl(url)
  }

  const ImgComp = useMemoComp([fill.url], ({}) => {
    const image = usePromise<[string], IImage>(() => ImgManager.getImageAsync(fill.url), [fill.url])
    const imageBound = iife(() => {
      const { width, height } = image
      const rate = width / height
      return rate > 1 ? { width: 240, height: 240 / rate } : { width: 200 * rate, height: 200 }
    })
    return <img src={image.objectUrl} style={{ ...imageBound }}></img>
  })

  return (
    <Flex layout='v' className='wh-100%-fit bg-white relative'>
      <Flex
        layout='c'
        className='wh-100%-200 relative of-hidden bg-black'
        onHover={isHover.dispatch}>
        {isHover.value && (
          <Flex layout='c' className='wh-100% bg-[rgba(0,0,0,0.2)] absolute '>
            <Flex
              layout='c'
              className='wh-80-32 r-5 b-1-white text-white text-14 pointer'
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
