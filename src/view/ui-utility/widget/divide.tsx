import { Flex } from '@gitborlando/widget'
import { ComponentPropsWithRef, forwardRef, memo } from 'react'
import { cx, iife } from 'src/shared/utils/normal'

interface IDivide extends ComponentPropsWithRef<'div'> {
  direction?: 'h' | 'v'
  length?: number | `${number}%`
  thickness?: number
  bgColor?: string
  margin?: number
}

export const Divide = memo(
  forwardRef<HTMLDivElement, IDivide>(
    (
      {
        direction = 'v',
        length = '55%',
        thickness = 0.4,
        bgColor = '#C7C7C7',
        margin = 8,
        className,
        ...rest
      },
      ref
    ) => {
      const baseStyle = { boxShadow: `0 0 0 ${thickness}px ${bgColor}` }

      const dynamicStyle = iife(() => {
        if (direction === 'h')
          return {
            width: length,
            height: 0,
            marginBlock: margin,
          }
        else
          return {
            width: 0,
            height: length,
            marginInline: margin,
          }
      })

      return (
        <Flex
          style={{ ...baseStyle, ...dynamicStyle }}
          className={cx('layer-widget(lay-c shrink-0)', className)}
          {...rest}
          ref={ref}></Flex>
      )
    }
  )
)
