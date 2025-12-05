import { Text } from 'src/view/component/text'

export const BalanceItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithRef<'div'> & {
    left: ReactNode
    right: ReactNode
  }
>(({ className, children, left, right, ...rest }, ref) => {
  const cls = classes(css`
    height: 32px;
    justify-content: space-between;
  `)

  return (
    <G
      horizontal='auto auto'
      center
      gap={8}
      className={cx(cls(), className)}
      {...rest}
      ref={ref}>
      {left}
      {right}
    </G>
  )
})

export const CommonBalanceItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithRef<'div'> & {
    label: string
    icon?: ReactNode
  }
>(({ className, label, icon, children, ...rest }, ref) => {
  return (
    <BalanceItem
      className={className}
      {...rest}
      ref={ref}
      left={
        <G horizontal='auto 1fr' center gap={2}>
          {icon}
          <Text>{label}</Text>
        </G>
      }
      right={children}
    />
  )
})
