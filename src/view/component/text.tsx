import { Typography, TypographyTextProps } from '@arco-design/web-react'

export const Text: FC<TypographyTextProps> = observer(
  ({ children, style, ...rest }) => {
    return <Typography.Text {...rest}>{children}</Typography.Text>
  },
)
