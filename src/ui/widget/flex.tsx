import { ComponentPropsWithRef, forwardRef } from 'react'
import { makeStyles } from '../theme'

interface IFlexProps extends ComponentPropsWithRef<'div'> {
  layout?: 'c' | 'h' | 'v'
  sidePadding?: number
  vshow?: boolean
  justify?: 'space-around' | 'space-between'
  onHover?: (isHover: boolean) => void
}

export const Flex = forwardRef<HTMLDivElement, IFlexProps>(
  (
    {
      layout,
      sidePadding = 0,
      vshow = true,
      justify,
      className,
      onHover,
      onMouseOver,
      onMouseLeave,
      ...rest
    },
    ref
  ) => {
    const { classes, cx } = useStyles({ sidePadding, vshow, justify })
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
  Pick<IFlexProps, 'justify'>

const useStyles = makeStyles<IFlexStyleProps>()((t, { sidePadding, vshow, justify }) => ({
  Flex: {
    display: vshow ? 'flex' : 'none',
    justifyContent: justify,
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
