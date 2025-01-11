import clsx from 'clsx'
import { ComponentPropsWithRef, forwardRef } from 'react'
import { cx, iife } from 'src/shared/utils/normal'
import { Flex } from 'src/view/ui-utility/widget/flex'

export type IButtonProps = ComponentPropsWithRef<'div'> & {
  type?: 'text' | 'normal' | 'icon'
  active?: boolean
  disabled?: boolean
}

export const Button = forwardRef<HTMLDivElement, IButtonProps>(
  ({ type = 'normal', active = false, disabled = false, className, children, ...rest }, ref) => {
    const baseCss = clsx(
      'lay-c',
      iife(() => {
        if (disabled) return ''
        return 'pointer'
      })
    )

    const normalCss = clsx(
      'wh-fit r-4 p-6 mx-2 text-11 text-[#626262]',
      disabled ? '' : active ? 'text-hsl65 bg-hsl95' : 'd-hover-bg'
    )

    const textCss = clsx(
      'text-hsl50',
      iife(() => {
        if (disabled) return ''
        if (active) return 'text-hsl50'
      })
    )

    const iconCss = clsx(
      'wh-fit r-4 p-4 mx-2',
      iife(() => {
        if (disabled) return ''
        if (active) return 'bg-hsl95'
        return 'd-hover-bg'
      })
    )

    const finalCss = clsx(
      baseCss,
      type === 'text' && textCss,
      type === 'icon' && iconCss,
      type === 'normal' && normalCss,
      normalCss
    )

    return (
      <Flex className={cx(finalCss, className)} {...(!disabled && rest)} ref={ref}>
        {children}
      </Flex>
    )
  }
)
