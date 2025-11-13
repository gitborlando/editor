import { ComponentPropsWithRef } from 'react'

export const Text: FC<ComponentPropsWithRef<'div'> & { active?: boolean }> =
  observer(({ children, className, style, active = false, ...rest }) => {
    return (
      <G
        data-active={active}
        className={cx('text', cls(), className as string)}
        style={style}
        {...rest}>
        {children}
      </G>
    )
  })

const cls = classes(css`
  align-items: center;
  align-content: center;
  ${styles.textCommon}
  &[data-active='true'] {
    ${styles.textActive}
  }
`)
