import { Input as ArcoInput, InputProps } from '@arco-design/web-react'
import { RefInputType } from '@arco-design/web-react/es/Input'

export const Input = observer(
  forwardRef<
    RefInputType,
    InputProps & {
      noHoverFocusStyle?: boolean
      selectOnFocus?: boolean
      onEnd?: (value: string) => void
      validate?: (value: string) => boolean
    }
  >(
    (
      {
        className,
        noHoverFocusStyle = false,
        selectOnFocus = true,
        readOnly,
        value,
        onChange,
        onFocus,
        onBlur,
        onEnd,
        validate,
        ...rest
      },
      ref,
    ) => {
      value = value ?? ''
      const [innerValue, setInnerValue] = useState<string>(value)
      const finalValue = useRef(value)
      const isValid = useRef(true)

      useLayoutEffect(() => {
        finalValue.current = value
        setInnerValue(value)
      }, [value])

      const handleEnd = () => {
        if (!isValid.current) {
          return setInnerValue(value)
        }
        if (finalValue.current !== value) {
          onEnd?.(finalValue.current)
        }
      }

      return (
        <ArcoInput
          ref={ref}
          {...rest}
          className={cx(
            cls(),
            noHoverFocusStyle && cls('no-hover-focus-style'),
            className as string,
          )}
          value={innerValue}
          onChange={(value, e) => {
            setInnerValue(value)
            onChange?.(value, e)
            isValid.current = validate?.(value) ?? true
            if (isValid.current) {
              finalValue.current = value
            }
          }}
          onFocus={(e) => {
            if (readOnly) return
            if (selectOnFocus) e.target.select()
            onFocus?.(e)
          }}
          onBlur={(e) => {
            onBlur?.(e)
            handleEnd()
          }}
          onPressEnter={() => {
            handleEnd()
          }}
        />
      )
    },
  ),
)

const cls = classes(css`
  & .arco-input {
    ${styles.textCommon}
  }
  &-no-hover-focus-style {
    &.arco-input {
      border: none;
      outline: none;
      background-color: transparent;
    }
  }
`)
