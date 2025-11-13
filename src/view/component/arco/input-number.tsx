import {
  InputNumber as ArcoInputNumber,
  InputNumberProps,
} from '@arco-design/web-react'
import { RefInputType } from '@arco-design/web-react/es/Input'

export const InputNumber = observer(
  forwardRef<
    RefInputType,
    InputNumberProps & { noHoverFocusStyle?: boolean; selectOnFocus?: boolean }
  >(
    (
      {
        className,
        hideControl = true,
        noHoverFocusStyle = false,
        selectOnFocus = true,
        onFocus,
        ...rest
      },
      ref,
    ) => {
      return (
        <ArcoInputNumber
          ref={ref}
          {...rest}
          hideControl={hideControl}
          className={cx(
            cls(),
            noHoverFocusStyle && cls('no-hover-focus-style'),
            className as string,
          )}
          onFocus={(e) => {
            if (selectOnFocus) e.target.select()
            onFocus?.(e)
          }}
        />
      )
    },
  ),
)

const cls = classes(css`
  width: 80px;
  &-no-hover-focus-style {
    & .arco-input-inner-wrapper {
      border: none;
      outline: none;
      background-color: transparent;
    }
  }
`)
