import { InputNumber, InputNumberProps } from '@arco-design/web-react'
import { Drag } from 'src/global/event/drag'

interface SlideInputProps {
  prefix?: ReactNode
  slideRate?: number
  onSlide?: (value: number) => void
  afterSlide?: (changed: boolean) => void
}

export const SlideInput: FC<SlideInputProps & InputNumberProps> = observer(
  ({ className, prefix, slideRate, onSlide, afterSlide, ...rest }) => {
    return (
      <InputNumber
        {...rest}
        className={cx(cls(), className as string)}
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
  afterSlide?: (changed: boolean) => void
}> = observer(({ label, slideRate = 1, onSlide, afterSlide }) => {
  const handleDragLabel = () => {
    Drag.needInfinity()
      .onStart()
      .onMove(({ delta }) => onSlide?.((delta?.x ?? 0) * slideRate))
      .onDestroy(({ moved }) => afterSlide?.(moved))
  }
  return (
    <G onMouseDown={handleDragLabel} className={cls('label')}>
      {label}
    </G>
  )
})

const cls = classes(css`
  height: 30px;
  &-label {
    ${styles.textLabel}
    cursor: e-resize;
    &:hover {
      font-weight: 600;
      color: var(--color);
    }
  }
  & .acro-input::placeholder {
    ${styles.textLabel}
  }
  & .arco-input-inner-wrapper {
    &-small {
      padding-left: 8px;
    }
  }
`)
