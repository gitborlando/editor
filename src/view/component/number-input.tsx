import { InputHTMLAttributes } from 'react'

export interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  suffix?: string
  prefix?: string
  onChange?: (value: number | undefined) => void
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      defaultValue,
      min = -Infinity,
      max = Infinity,
      step = 1,
      suffix,
      prefix,
      onChange,
      className,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const displayRef = (ref as React.RefObject<HTMLInputElement>) || inputRef
    const [isEditing, setIsEditing] = useState(false)
    const [inputValue, setInputValue] = useState('')

    // 当外部 value 变化且不在编辑状态时，更新显示值
    useEffect(() => {
      if (!isEditing) {
        const numValue = value ?? defaultValue ?? ''
        if (numValue === '') {
          setInputValue('')
        } else {
          setInputValue(`${prefix || ''}${numValue}${suffix || ''}`)
        }
      }
    }, [value, defaultValue, prefix, suffix, isEditing])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      setInputValue(rawValue)
    }

    const commitValue = () => {
      const rawValue = inputValue

      // 移除前缀和后缀
      let numStr = rawValue
      if (prefix) numStr = numStr.replace(prefix, '')
      if (suffix) numStr = numStr.replace(suffix, '')

      // 解析数字
      const num = parseFloat(numStr)

      if (Number.isNaN(num) || numStr === '') {
        onChange?.(undefined)
      } else {
        // 限制范围
        const clampedValue = Math.max(min, Math.min(max, num))
        onChange?.(clampedValue)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        commitValue()
        displayRef.current?.blur()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const currentValue = value ?? defaultValue ?? 0
        const newValue = Math.min(currentValue + step, max)
        onChange?.(newValue)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        const currentValue = value ?? defaultValue ?? 0
        const newValue = Math.max(currentValue - step, min)
        onChange?.(newValue)
      }
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsEditing(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsEditing(false)
      commitValue()
      onBlur?.(e)
    }

    return (
      <input
        {...props}
        ref={displayRef}
        type='text'
        className={className}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    )
  },
)

NumberInput.displayName = 'NumberInput'
