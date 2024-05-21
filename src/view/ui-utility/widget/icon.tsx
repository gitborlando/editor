import { CSSProperties, FC, createElement } from 'react'
import { cx } from '~/shared/utils/normal'

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
  style: inputStyle,
  ...rest
}) => {
  const style = {
    width: size,
    height: size,
    rotate: `${rotate}deg`,
    scale: `${scale}`,
    ...inputStyle,
  }

  if (typeof children === 'string')
    return (
      <img
        className={cx(':uno: lay-c wh-fit-fit', className)}
        src={children}
        style={style}
        {...rest}></img>
    )

  return createElement(children as unknown as FC<any>, {
    className: cx(':uno: lay-c wh-fit-fit', className),
    style,
    ...rest,
  })
}
