import { CSSProperties, FC, createElement } from 'react'
import { useCssInJs } from '~/shared/utils/css-in-js'
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

  const innerCss = useCssInJs(
    [fill, scale],
    () => {
      return `path { fill: ${fill /* '#7a7a7a' */ || /* '#545454' */ '#393939'}; }`
    },
    { classNamePrefix: 'icon' }
  )

  return typeof children === 'string' ? (
    <img
      className={cx(':uno: lay-c wh-fit-fit', innerCss, className)}
      src={children}
      style={style}
      {...rest}></img>
  ) : (
    createElement(children as unknown as FC<any>, {
      className: cx(':uno: lay-c wh-fit-fit', innerCss, className),
      style,
      ...rest,
    })
  )
}
