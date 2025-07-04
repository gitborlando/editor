import { FC } from 'react'
import { useClassNames } from 'src/view/hooks/use-class-names'
import { ButtonProps } from './button-props'
import './button.less'

export const Button: FC<ButtonProps> = ({ className, children, ...props }) => {
  const classNames = useClassNames(className, 'button', {})
  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  )
}

Button.displayName = 'Button'
