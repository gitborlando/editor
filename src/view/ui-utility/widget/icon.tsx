import { CSSProperties, FC, createElement } from 'react'
import { makeStyles } from '../theme'

export type IIconProps = {
  children: any
  className?: string
  size?: number
  rotate?: number
  scale?: number
  fill?: CSSProperties['color'] | (string & {})
  style?: CSSProperties
}

export const Icon: FC<IIconProps> = ({
  className,
  children,
  size = 8,
  rotate = 0,
  scale = 1,
  fill,
  ...rest
}) => {
  const { classes, cx } = useStyles({
    size,
    rotate,
    scale,
    fill: fill || /* '#545454' */ /* '#7a7a7a' */ '#393939',
  })
  if (typeof children === 'string') {
    return <img src={children} className={cx(classes.Icon, className)} {...rest}></img>
  }
  return createElement(children as unknown as FC<any>, {
    className: cx(classes.Icon, className),
    ...rest,
  })
}

type IIconStyleProps = {} & Required<
  Pick<IIconProps, 'size' | 'rotate' | 'scale' | 'fill'>
> /* & Pick<IIconProps> */

const useStyles = makeStyles<IIconStyleProps>()((t, { size, rotate, scale, fill }) => ({
  Icon: {
    ...t.rect(size, size),
    rotate: `${rotate}deg`,
    '& path': {
      fill: fill,
      scale: `${scale} ${scale}`,
    },
  },
}))

Icon.displayName = 'Icon'
