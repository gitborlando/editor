import { Typography, TypographyTextProps } from '@arco-design/web-react'

export const Text: FC<TypographyTextProps & { active?: boolean }> = observer(
  ({ children, className, style, active = false, ellipsis = true, ...rest }) => {
    return (
      <Typography.Text
        data-active={active}
        className={cx('text', cls(), className as string)}
        style={style}
        ellipsis={ellipsis}
        {...rest}>
        {children}
      </Typography.Text>
    )
  },
)

const cls = classes(css`
  align-self: center;
  ${styles.textLabel}
  &[data-active='true'] {
    ${styles.textActive}
  }
`)
