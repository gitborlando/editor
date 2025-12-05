import { Menu as ArcoMenu, MenuItemProps } from '@arco-design/web-react'

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps & {}>(
  ({ className, disabled, ...rest }, ref) => {
    return (
      <ArcoMenu.Item
        className={cx(cls(), className as string, disabled && cls('disabled'))}
        disabled={disabled}
        {...rest}
        ref={ref}></ArcoMenu.Item>
    )
  },
)

const cls = classes(css`
  height: 32px;
  line-height: 32px;
  ${styles.textLabel}
  border-radius: 2px;
  padding-inline: 10px;
  &-shortcut {
    justify-items: end;
  }
  &:not(&-disabled) {
    &:hover * {
      color: white !important;
    }
    &:hover {
      background-color: var(--color-light);
    }
  }
  &-disabled {
    color: #b3b3b3;
    cursor: initial;
    &:hover {
      background-color: transparent;
    }
  }
  &.arco-menu-item {
    color: inherit;
    background-color: inherit;
    transition: inherit;
  }
`)
