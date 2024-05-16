import { ComponentPropsWithRef, forwardRef } from 'react'
import { makeStyles } from '../theme'

export interface IFlexProps extends ComponentPropsWithRef<'div'> {
  layout?: 'c' | 'h' | 'v'
  vshow?: boolean
  justify?: 'space-around' | 'space-between'
  shrink?: number
  onHover?: (isHover: boolean) => void
}

export const Flex = forwardRef<HTMLDivElement, IFlexProps>(
  (
    {
      layout,
      vshow = true,
      shrink = 1,
      justify,
      className,
      onHover,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref
  ) => {
    const { classes, cx } = useStyles({ vshow, justify, shrink })

    return (
      <div
        ref={ref}
        className={
          ':uno: relative' +
          ' ' +
          cx(
            layout &&
              classes[
                ({ c: 'center', h: 'horizontalCenter', v: 'verticalCenter' } as const)[layout]
              ],
            classes.Flex,
            className
          )
        }
        onMouseEnter={(e) => {
          onHover?.(true)
          onMouseEnter?.(e)
        }}
        onMouseLeave={(e) => {
          onHover?.(false)
          onMouseLeave?.(e)
        }}
        {...rest}></div>
    )
  }
)

type IFlexStyleProps = {} & Required<Pick<IFlexProps, 'vshow'>> &
  Pick<IFlexProps, 'justify' | 'shrink'>

const useStyles = makeStyles<IFlexStyleProps>()((t, { vshow, justify, shrink }) => ({
  Flex: {
    display: vshow ? 'flex' : 'none',
    justifyContent: justify,
    flexShrink: shrink,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalCenter: {
    alignItems: 'center',
  },
  verticalCenter: {
    flexDirection: 'column',
    alignItems: 'center',
  },
}))

Flex.displayName = 'Flex'
