import { Button as ArcoButton, ButtonProps } from '@arco-design/web-react'
import cx from 'classix'
import { FC } from 'react'
import './index.less'

export const Button: FC<ButtonProps & { active?: boolean }> = observer(
  ({ children, className, size, type = 'text', active = false, ...rest }) => {
    return (
      <ArcoButton
        type={type}
        className={cx('button', active && 'button-active', className as string)}
        {...rest}>
        {children}
      </ArcoButton>
    )
  },
)
