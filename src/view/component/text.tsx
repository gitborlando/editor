import { Typography, TypographyTextProps } from '@arco-design/web-react'

export const Text: FC<TypographyTextProps> = observer(
  ({ children, className, style, ...rest }) => {
    return (
      <Typography.Text className={cx(cls(), className)} style={style} {...rest}>
        {children}
      </Typography.Text>
    )
  },
)

const cls = classes(css`
  align-self: center;
`)
