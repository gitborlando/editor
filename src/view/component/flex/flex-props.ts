import { ComponentPropsWithRef, ElementType } from 'react'

export interface FlexProps extends ComponentPropsWithRef<'div'> {
  vif?: boolean
  vshow?: boolean
  as?: ElementType
  layout?:
    | 'h'
    | 'v'
    | 'c'
    | 'h-end'
    | 'v-end'
    | 'v-c'
    | 'h-around'
    | 'h-between'
    | 'v-around'
    | 'v-between'
  gap?: number
  block?: 'x' | 'y' | 'xy'
  onHover?: (isHover: boolean) => void
}
