import { ComponentPropsWithRef } from 'react'

export type GridProps = {
  horizontal?: string | true
  vertical?: string | true
  center?: boolean
  gap?: number
} & ComponentPropsWithRef<'div'>

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    { children, style, className, horizontal, vertical, gap, center, ...rest },
    ref,
  ) => {
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
      if (horizontal && vertical)
        return { justifyContent: 'center', alignContent: 'center' }
      if (!horizontal && !vertical)
        return { justifyContent: 'center', alignContent: 'center' }
      if (horizontal) return { alignContent: 'center' }
      if (vertical) return { justifyContent: 'center' }
      return {}
    }, [horizontal, vertical, center])

    return (
      <div
        className={cx(cls(), className)}
        style={{
          gap: gap,
          ...gridTemplates,
          ...contentStyle,
          ...style,
        }}
        {...rest}
        ref={ref}>
        {children}
      </div>
    )
  },
)

export const G = Grid

export const GridCenter: FC<GridProps> = memo(({ children, center, ...rest }) => {
  return (
    <Grid center={true} {...rest}>
      {children}
    </Grid>
  )
})

export const C = GridCenter

const cls = classes(css`
  width: 100%;
  height: 100%;
  position: relative;
  display: grid;
`)
