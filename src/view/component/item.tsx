import { Text } from 'src/view/component/text'

export const SpaceBetweenItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithRef<'div'> & {
    label: string
  }
>(({ className, children, label, ...rest }, ref) => {
  return (
    <G
      horizontal='auto auto'
      center
      gap={8}
      className={cx(cls('space-between'), className)}
      {...rest}
      ref={ref}>
      <Text x-if={label}>{label}</Text>
      {children}
    </G>
  )
})

const cls = classes(css`
  &-space-between {
    height: 32px;
    justify-content: space-between;
  }
`)
