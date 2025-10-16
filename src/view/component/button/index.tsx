import { Button, ButtonProps } from '@arco-design/web-react'
import cx from 'classix'
import { FC } from 'react'
import './index.less'

export const IconButton: FC<ButtonProps> = observer(({ icon, className, size, ...rest }) => {
  return (
    <Button type='text' icon={icon} className={cx('icon-button', className as string)} {...rest} />
  )
})
