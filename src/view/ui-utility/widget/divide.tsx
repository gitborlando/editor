import { ComponentPropsWithRef, forwardRef } from 'react'
import { makeStyles } from '../theme'
import { Flex } from './flex'

interface IDivide extends ComponentPropsWithRef<'div'> {
  direction?: 'h' | 'v'
  length?: number | `${number}%`
  bgColor?: string
  margin?: number
}

export const Divide = forwardRef<HTMLDivElement, IDivide>(
  (
    { direction = 'v', length = '55%', bgColor = '#C7C7C7', margin = 8, className, ...rest },
    ref
  ) => {
    const { classes, cx } = useStyles({ length, bgColor, margin })
    return (
      <Flex
        layout='c'
        shrink={0}
        className={cx(
          classes.Divide,
          className,
          direction === 'h' && classes.h,
          direction === 'v' && classes.v
        )}
        {...rest}
        ref={ref}></Flex>
    )
  }
)

type IDivideStyle = {} & Required<
  Pick<IDivide, 'length' | 'bgColor' | 'margin'>
> /* & Pick<IDivide> */

const useStyles = makeStyles<IDivideStyle>()((t, { length, bgColor, margin }) => ({
  Divide: {
    backgroundColor: bgColor,
  },
  h: {
    ...t.rect(length, 1),
    marginBlock: margin,
  },
  v: {
    ...t.rect(1, length),
    marginInline: margin,
  },
}))

Divide.displayName = 'Divide'
