import { Text } from 'src/view/component/text'

export const SpaceBetweenItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithRef<'div'> & {
    left: ReactNode
    right: ReactNode
  }
>(({ className, children, left, right, ...rest }, ref) => {
  return (
    <G
      horizontal='auto auto'
      center
      gap={8}
      className={cx(cls('space-between'), className)}
      {...rest}
      ref={ref}>
      {left}
      {right}
    </G>
  )
})

const cls = classes(css`
  &-space-between {
    height: 32px;
    justify-content: space-between;
  }
`)

export const CommonSpaceBetweenItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithRef<'div'> & {
    label: string
    icon?: ReactNode
  }
>(({ className, label, icon, children, ...rest }, ref) => {
  const cls = classes(css`
    &-icon {
      width: 16px;
    }
  `)

  return (
    <SpaceBetweenItem
      className={cls()}
      {...rest}
      ref={ref}
      left={
        <G horizontal='auto 1fr' center gap={2}>
          <G className={cls('icon')}>{icon}</G>
          <Text>{label}</Text>
        </G>
      }
      right={children}
    />
  )
})
