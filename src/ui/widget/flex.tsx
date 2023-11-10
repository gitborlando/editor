import { ComponentPropsWithRef, forwardRef } from 'react'
import { makeStyles } from '../theme'

interface IFlexProps extends ComponentPropsWithRef<'div'> {
  layout?: 'c' | 'h' | 'v'
  sidePadding?: number
  spaceBetween?: boolean
  vshow?: boolean
  onHover?: (isHover: boolean) => void
}

export const Flex = forwardRef<HTMLDivElement, IFlexProps>(
  (
    {
      layout,
      sidePadding = 0,
      spaceBetween = false,
      vshow = true,
      className,
      onHover,
      onMouseOver,
      onMouseLeave,
      ...rest
    },
    ref
  ) => {
    const { classes, cx } = useStyles({ sidePadding, spaceBetween, vshow })
    return (
      <div
        ref={ref}
        className={cx(
          layout &&
            classes[({ c: 'center', h: 'horizontalCenter', v: 'verticalCenter' } as const)[layout]],
          classes.Flex,
          className
        )}
        onMouseOver={(e) => {
          onHover?.(true)
          onMouseOver?.(e)
        }}
        onMouseLeave={(e) => {
          onHover?.(false)
          onMouseLeave?.(e)
        }}
        {...rest}></div>
    )
  }
)

type IFlexStyleProps = {} & Required<
  Pick<IFlexProps, 'sidePadding' | 'spaceBetween' | 'vshow'>
> /* & Pick<IFlexProps> */

const useStyles = makeStyles<IFlexStyleProps>()((t, { sidePadding, spaceBetween, vshow }) => ({
  Flex: {
    display: vshow ? 'flex' : 'none',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: sidePadding,
  },
  horizontalCenter: {
    alignItems: 'center',
    paddingInline: sidePadding,
    ...(spaceBetween && { justifyContent: 'space-between' }),
  },
  verticalCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingBlock: sidePadding,
    ...(spaceBetween && { justifyContent: 'space-between' }),
  },
}))

Flex.displayName = 'Flex'
