import { Button as ArcoButton, ButtonProps } from '@arco-design/web-react'

export const Button: FC<ButtonProps & { active?: boolean }> = observer(
  ({ children, className, type = 'text', active = false, ...rest }) => {
    return (
      <ArcoButton
        type={type}
        className={cx(cls(), active && 'button-active', className as string)}
        {...rest}>
        {children}
      </ArcoButton>
    )
  },
)

export const IconButton: FC<ButtonProps> = observer(
  ({ children, className, size = 'mini', ...rest }) => {
    return (
      <Button
        size={size}
        className={cx(cls(), 'arco-btn-icon-only', className as string)}
        {...rest}>
        {children}
      </Button>
    )
  },
)

const cls = classes(css`
  display: flex;
  align-items: center;
  justify-content: center;

  &.arco-btn-text:not(.arco-btn-icon-only) {
    padding-left: 0px;
    padding-right: 8px;
    & span {
      margin-left: 0;
    }
  }
  &.arco-btn-text:not(.arco-btn-disabled) {
    color: inherit;
    &.button-active {
      color: var(--color);
      background-color: var(--color-bg);
    }
  }
  &.arco-btn-text.arco-btn-disabled {
    color: var(--gray-border);
  }
  &.arco-btn-text:not(.arco-btn-disabled):not(.arco-btn-loading):hover {
    color: var(--color);
  }
`)
