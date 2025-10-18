import { InputNumber, InputNumberProps } from '@arco-design/web-react'
import { FC, ReactNode } from 'react'
import { Drag } from 'src/global/event/drag'
import './index.less'

interface SlideInputProps {
  prefix?: ReactNode
  slideRate?: number
  onSlide?: (value: number) => void
  afterSlide?: () => void
}

export const SlideInput: FC<SlideInputProps & InputNumberProps> = observer(
  ({ className, prefix, slideRate, onSlide, afterSlide, ...rest }) => {
    return (
      <InputNumber
        {...rest}
        className={cx('slide-input', className as string)}
        size='small'
        hideControl
        prefix={
          <LabelComp
            label={prefix}
            slideRate={slideRate}
            onSlide={onSlide}
            afterSlide={afterSlide}
          />
        }
      />
    )
  },
)

const LabelComp: FC<{
  label: ReactNode
  slideRate?: number
  onSlide?: (value: number) => void
  afterSlide?: () => void
}> = ({ label, slideRate = 1, onSlide, afterSlide }) => {
  const handleDragLabel = () => {
    Drag.needInfinity()
      .onStart()
      .onMove(({ delta }) => onSlide?.((delta?.x ?? 0) * slideRate))
      .onDestroy(({ shift }) => shift.x !== 0 && shift.y !== 0 && afterSlide?.())
  }
  return (
    <G onMouseDown={handleDragLabel} className='slide-input-label'>
      {label}
    </G>
  )
}
