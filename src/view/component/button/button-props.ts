import { ComponentPropsWithRef } from 'react'

export interface ButtonProps extends ComponentPropsWithRef<'div'> {
  className?: string
  children?: React.ReactNode
}
