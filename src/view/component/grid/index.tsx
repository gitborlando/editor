import cx from 'classix'
import { ComponentPropsWithRef, FC, memo } from 'react'
import './index.less'

export const Grid: FC<
  {
    horizontal?: string | true
    vertical?: string
    center?: boolean
    gap?: number
  } & ComponentPropsWithRef<'div'>
> = memo(({ children, style, className, horizontal, vertical, gap, center, ...rest }) => {
  const gridTemplates = useMemo(() => {
    const templates: Record<string, any> = {}
    if (horizontal) {
      if (horizontal === true) {
        templates.gridAutoFlow = 'column'
      } else {
        templates.gridTemplateColumns = horizontal
      }
    }
    if (vertical) {
      templates.gridTemplateRows = vertical
    }
    return templates
  }, [horizontal, vertical])

  const contentStyle = useMemo(() => {
    if (!center) return {}
    if (horizontal && vertical) return { justifyContent: 'center', alignContent: 'center' }
    if (!horizontal && !vertical) return { justifyContent: 'center', alignContent: 'center' }
    if (horizontal) return { alignContent: 'center' }
    if (vertical) return { justifyContent: 'center' }
    return {}
  }, [horizontal, vertical, center])

  return (
    <div
      className={cx('grid', className)}
      style={{
        gap: gap,
        ...gridTemplates,
        ...contentStyle,
        ...style,
      }}
      {...rest}>
      {children}
    </div>
  )
})

export const G = Grid
