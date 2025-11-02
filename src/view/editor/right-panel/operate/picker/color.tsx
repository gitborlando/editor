import { FC, memo, useEffect } from 'react'
import { RgbaStringColorPicker } from 'react-colorful'
import { UIPickerCopy } from 'src/editor/handle/picker'
import { useDownUpTracker } from 'src/shared/utils/event'
import { rgb } from 'src/utils/color'

type IPickerColorComp = {
  color: string
  onChange: (color: { color: string; alpha: number }) => void
}

export const PickerColorComp: FC<IPickerColorComp> = memo(({ color, onChange }) => {
  const { beforeOperate, afterOperate } = UIPickerCopy
  const transformColor = (color: string) => {
    const [, r, g, b, a] = color.match(/rgba\((\d+), (\d+), (\d+), (\d+(\.\d+)?)\)/)!
    return { color: rgb(r, g, b), alpha: Number(a) }
  }
  useDownUpTracker(
    () => document.getElementById('$$RgbaStringColorPicker'),
    beforeOperate.dispatch,
    afterOperate.dispatch,
  )
  useEffect(() => injectCss(), [])

  return (
    <RgbaStringColorPicker
      id='$$RgbaStringColorPicker'
      className='wh-240-240! bg-white!'
      color={color}
      onChange={(c) => onChange(transformColor(c))}
    />
  )
})

function injectCss() {
  if (document.getElementById('$$react-colorful')) return
  const style = document.createElement('style')
  style.id = '$$react-colorful'
  style.innerHTML = `
    .react-colorful__pointer{width:14px;height:14px}
    .react-colorful__alpha,.react-colorful__hue{height:12px}
    .react-colorful__last-control,.react-colorful__saturation{border-radius:0}
  `
  document.head.appendChild(style)
}
