import { ComponentPropsWithRef, forwardRef } from 'react'
import { makeStyles } from '../theme'

interface IFlexProps extends ComponentPropsWithRef<'div'> {
  layout?: 'c' | 'h' | 'v'
  sidePadding?: number
  vshow?: boolean
  justify?: 'space-around' | 'space-between'
  shrink?: number
  onHover?: (isHover: boolean) => void
}

export const Flex = forwardRef<HTMLDivElement, IFlexProps>(
  (
    {
      layout,
      sidePadding = 0,
      vshow = true,
      shrink = 1,
      justify,
      className,
      onHover,
      onMouseOver,
      onMouseLeave,
      ...rest
    },
    ref
  ) => {
    const { classes, cx } = useStyles({ sidePadding, vshow, justify, shrink })
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

type IFlexStyleProps = {} & Required<Pick<IFlexProps, 'sidePadding' | 'vshow'>> &
  Pick<IFlexProps, 'justify' | 'shrink'>

const useStyles = makeStyles<IFlexStyleProps>()((t, { sidePadding, vshow, justify, shrink }) => ({
  Flex: {
    position: 'relative',
    display: vshow ? 'flex' : 'none',
    justifyContent: justify,
    flexShrink: shrink,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: sidePadding,
  },
  horizontalCenter: {
    alignItems: 'center',
    paddingInline: sidePadding,
  },
  verticalCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingBlock: sidePadding,
  },
}))

Flex.displayName = 'Flex'
