import { FC, memo } from 'react'
import usePromise from 'react-promise-suspense'
import { IImage, Img } from '~/editor/editor/img'
import { IFillImage } from '~/editor/schema/type'
import { UIPickerCopy } from '~/editor/ui-state/right-panel/operate/picker'
import { Uploader } from '~/global/upload'
import { useAutoSignal } from '~/shared/signal/signal-react'
import { rgba } from '~/shared/utils/color'
import { iife } from '~/shared/utils/normal'
import { useMemoComp, withSuspense } from '~/shared/utils/react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'

type IPickerImageComp = {
  fill: IFillImage
}

export const PickerImageComp: FC<IPickerImageComp> = memo(({ fill }) => {
  const { setFillUrl } = UIPickerCopy
  const isHover = useAutoSignal(false)
  const { classes } = useStyles({})

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
    <Flex layout='v' className={classes.PickerImage}>
      <Flex layout='c' className={classes.image} onHover={isHover.dispatch}>
        {isHover.value && (
          <Flex layout='c' className={classes.upload}>
            <Flex layout='c' className='button' onClick={uploadImage}>
              更换图片
            </Flex>
          </Flex>
        )}
        {withSuspense(<ImgComp />)}
      </Flex>
    </Flex>
  )
})

type IPickerImageCompStyle =
  {} /* & Required<Pick<IPickerImageComp>> */ /* & Pick<IPickerImageComp> */

const useStyles = makeStyles<IPickerImageCompStyle>()((t) => ({
  PickerImage: {
    ...t.rect('100%', 'fit-content', 'no-radius', 'white'),
    ...t.relative(),
  },
  image: {
    ...t.rect('100%', 200),
    ...t.relative(),
    overflow: 'hidden',
    backgroundColor: 'black',
  },
  upload: {
    ...t.rect('100%', '100%', 'no-radius', rgba(0, 0, 0, 0.2)),
    ...t.absolute(),
    '& .button': {
      ...t.rect(80, 32, 5, 'transparent'),
      ...t.border(1, 'white'),
      ...t.font('white', 14),
      cursor: 'pointer',
    },
  },
}))

PickerImageComp.displayName = 'PickerImageComp'
