import { twoDecimal } from '@gitborlando/geo'
import { iife } from '@gitborlando/utils'
import { stopPropagation } from '@gitborlando/utils/browser'
import { Eye, EyeOff } from 'lucide-react'
import { ImgManager } from 'src/editor/editor/img-manager'
import { OperateFill } from 'src/editor/operate/fill'
import {
  colorConvert,
  makeLinearGradientCss,
  rgbToRgba,
  rgbTuple,
} from 'src/utils/color'
import { NumberInput } from 'src/view/component/number-input'
import { suspense } from 'src/view/component/suspense'
import { FillPickerState } from 'src/view/editor/right-panel/operate/picker/state'
import i18n from 'src/view/i18n/config'
import { suspend } from 'suspend-react'

export const EditorRPOperateFillItemComp: FC<{
  fill: V1.Fill
  index: number
}> = ({ fill, index }) => {
  const isColorType = fill.type === 'color'
  const isLinearType = fill.type === 'linearGradient'
  const isImageType = fill.type === 'image'

  const outerRef = useRef<HTMLDivElement>(null)

  const openPicker = () => {
    const outerRefBound = outerRef.current!.getBoundingClientRect()
    FillPickerState.showPicker(
      index,
      XY.from(outerRefBound).plus(XY._(-240 - 24, 0)),
    )
  }

  return (
    <G
      horizontal
      center
      className={cls()}
      ref={outerRef}
      onMouseDown={stopPropagation()}>
      <G className={cls('shower')} onClick={openPicker}>
        {isColorType && (
          <G style={{ backgroundColor: rgbToRgba(fill.color, fill.alpha) }}></G>
        )}
        {isLinearType && <G style={{ background: makeLinearGradientCss(fill) }}></G>}
        {isImageType && <ImgComp url={fill.url} />}
      </G>
      <HexInputComp fill={fill} index={index} />
      <AlphaInputComp fill={fill} index={index} />
      <VisibleComp fill={fill} index={index} />
    </G>
  )
}

const ImgComp: FC<{ url: string }> = suspense(({ url }) => {
  const image = suspend(() => ImgManager.getImageAsync(url), [url])
  const imageBound = iife(() => {
    const { width, height } = image
    const rate = width / height
    return rate > 1
      ? { width: 18, height: 18 / rate }
      : { width: 18 * rate, height: 18 }
  })
  return <img src={image.objectUrl} style={{ ...imageBound }}></img>
})

const HexInputComp: FC<{
  fill: V1.Fill
  index: number
}> = observer(({ fill, index }) => {
  const { t } = useTranslation()
  const isSolidFill = fill.type === 'color'
  const setColor = (color: string) => {
    if (!isSolidFill) return
    OperateFill.setFill(index, (fill) => {
      T<V1.FillColor>(fill).color = color
    })
  }

  const value = iife(() => {
    switch (fill.type) {
      case 'color':
        return colorConvert.rgb.hex(...rgbTuple(T<V1.FillColor>(fill).color))
      case 'linearGradient':
        return i18n.language === 'en' ? 'linear' : t('noun.linearGradient')
      case 'image':
        return `${t('noun.image')} ${t('noun.fill')}`
    }
  })

  return (
    <input
      className={cls('hex')}
      value={value}
      // onChange={(e) => setColor(e.target.value)}
      onFocus={(e) => isSolidFill && e.target.select()}
    />
  )
})

const AlphaInputComp: FC<{ fill: V1.Fill; index: number }> = observer(
  ({ fill, index }) => {
    const setAlpha = (value: number) => {
      OperateFill.setFill(index, (fill) => {
        fill.alpha = value / 100
      })
    }
    return (
      <NumberInput
        value={twoDecimal(fill.alpha) * 100}
        onChange={(value) => setAlpha(value ?? 0)}
        className={cls('alpha')}
        onFocus={(e) => e.target.select()}
        min={0}
        max={100}
        suffix='%'
      />
    )
  },
)

const VisibleComp: FC<{ fill: V1.Fill; index: number }> = observer(
  ({ fill, index }) => {
    const toggleVisible = () => {
      OperateFill.setFill(index, (fill) => {
        fill.visible = !fill.visible
      })
    }
    return (
      <Lucide
        icon={fill.visible ? Eye : EyeOff}
        size={14}
        onClick={toggleVisible}
        style={{ cursor: 'pointer' }}
      />
    )
  },
)

const cls = classes(css`
  width: 185px;
  height: 30px;
  ${styles.borderRadius}
  ${styles.bgGray}
  padding: 8px;
  justify-content: space-between;
  color: #2e2e2e;
  ${styles.focus}
  &-shower {
    width: 18px;
    height: 18px;
    overflow: hidden;
    ${styles.borderRadius}
    ${styles.shadow}
    cursor: pointer;
  }
  &-hex {
    width: 54px;
    height: 24px;
    ${styles.textLabel}
    display: grid;
    justify-items: center;
    align-items: center;
  }
  &-alpha {
    width: 48px;
    height: 24px;
    ${styles.textLabel}
    display: grid;
    justify-items: center;
    align-items: center;
  }
`)
