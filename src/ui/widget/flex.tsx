import { ComponentPropsWithRef, forwardRef } from 'react'
import { makeStyles } from '../theme'

interface IFlexProps extends ComponentPropsWithRef<'div'> {
  layout?: 'c' | 'h' | 'v'
  sidePadding?: number
}

export const Flex = forwardRef<HTMLDivElement, IFlexProps>(
  ({ layout, sidePadding = 0, className, ...rest }, ref) => {
    const { classes, cx } = useStyles({ sidePadding })
    return (
      <div
        className={cx(
          layout &&
            classes[({ c: 'center', h: 'horizontalCenter', v: 'verticalCenter' } as const)[layout]],
          classes.Flex,
          className
        )}
        ref={ref}
        {...rest}></div>
    )
  }
)

type IFlexStyleProps = {} & Required<Pick<IFlexProps, 'sidePadding'>> /* & Pick<IFlexProps> */

const useStyles = makeStyles<IFlexStyleProps>()((t, { sidePadding }) => ({
  Flex: {
    display: 'flex',
    flex: '0 0 1',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: sidePadding,
  },
  horizontalCenter: {
    alignItems: 'center',
    paddingLeft: sidePadding,
    paddingRight: sidePadding,
  },
  verticalCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: sidePadding,
    paddingBottom: sidePadding,
  },
}))

Flex.displayName = 'Flex'
