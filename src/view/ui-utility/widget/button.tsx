import { ComponentPropsWithRef, forwardRef } from 'react'
import { cx } from '~/shared/utils/normal'
import { Flex } from '~/view/ui-utility/widget/flex'

export type IButtonProps = ComponentPropsWithRef<'div'> & {
  type?: 'text' | 'normal' | 'icon'
  active?: boolean
  disabled?: boolean
}

export const Button = forwardRef<HTMLDivElement, IButtonProps>(
  ({ type = 'normal', active = false, disabled = false, className, children, ...rest }, ref) => {
    const baseCss = cx([':uno: lay-c'], [!disabled, ':uno: pointer'])

    const normalCss = cx(
      [':uno: wh-fit-fit-4 p-6 mx-2 text-11 text-[#626262]'],
      [disabled, ''],
      [active, ':uno: text-[hsl(217,100,65)] bg-[hsl(217,100,95)]'],
      [':uno: d-hover-bg']
    )

    const textCss = cx(
      [':uno: text-[hsl(217,100,50)]'],
      [disabled, ''],
      [active, ':uno: text-[hsl(217,100,50)]'],
      [':uno: text-[hsl(217,100,50)]']
    )

    const iconCss = cx(
      [':uno: wh-fit-fit-4 p-4 mx-2'],
      [disabled, ''],
      [active, ':uno: bg-hslb95'],
      [':uno: d-hover-bg']
    )

    const finalCss = cx(
      [baseCss],
      [type === 'text', textCss],
      [type === 'icon', iconCss],
      [type === 'normal', normalCss],
      [normalCss]
    )

    return (
      <Flex className={cx(finalCss, className)} {...(!disabled && rest)} ref={ref}>
        {children}
      </Flex>
    )
  }
)
