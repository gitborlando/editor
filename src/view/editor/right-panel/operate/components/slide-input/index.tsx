import { InputNumber, InputNumberProps } from '@arco-design/web-react'
import { FC, ReactNode } from 'react'
import { Drag } from 'src/global/event/drag'
import './index.less'

interface SlideInputProps {
  prefix?: ReactNode
  slideRate?: number
  onSlide?: (value: number) => void
}

export const SlideInput: FC<SlideInputProps & InputNumberProps> = observer(
  ({ className, prefix, slideRate, onSlide, ...rest }) => {
    return (
      <InputNumber
        {...rest}
        className={cx('slide-input', className as string)}
        size='small'
        prefix={<LabelComp label={prefix} slideRate={slideRate} onSlide={onSlide} />}
        hideControl
      />
    )
  },
)

const LabelComp: FC<{
  label: ReactNode
  slideRate?: number
  onSlide?: (value: number) => void
}> = ({ label, slideRate = 1, onSlide }) => {
  const handleDragLabel = () => {
    Drag.needInfinity().onSlide(({ delta }) => onSlide?.(delta.x * slideRate))
  }
  return (
    <G onMouseDown={handleDragLabel} className='slide-input-label'>
      {label}
    </G>
  )
}
