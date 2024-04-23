import { FC, memo } from 'react'
import { IImage, Img } from '~/editor/img'
import { UIPicker } from '~/editor/ui-state/right-planel/operate/picker'
import { Uploader } from '~/global/upload'
import { useAutoSignal, useHookSignal, useSignal } from '~/shared/signal-react'
import { rgba } from '~/shared/utils/color'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'

type IPickerImageComp = {}

export const PickerImageComp: FC<IPickerImageComp> = memo(({}) => {
  const { currentImageFill } = UIPicker
  const isHover = useAutoSignal(false)
  const image = useAutoSignal({ objectUrl: '' } as IImage)
  const imageBound = useSignal({ width: 0, height: 0 })
  const { classes } = useStyles({})

  const uploadImage = async () => {
    const file = await Uploader.open({ accept: 'image/*' })
    const url = await Img.uploadLocal(file!)
    image.dispatch(await Img.getImageAsync(url))
    currentImageFill.dispatch((fill) => (fill.url = url))
  }

  image.intercept((image) => {
    const { width, height } = image
    const rate = width / height
    if (rate > 1) {
      imageBound.value = { width: 240, height: 240 / rate }
    } else {
      imageBound.value = { width: 200 * rate, height: 200 }
    }
  })

  useHookSignal(
    currentImageFill,
    (fill) => {
      if (fill.type !== 'image') return
      Img.getImageAsync(fill.url).then((img) => image.dispatch(img))
    },
    { immediately: true }
  )

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
        <img src={image.value.objectUrl} style={{ ...imageBound.value }}></img>
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
