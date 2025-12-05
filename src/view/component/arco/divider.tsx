import { Divider as ArcoDivider, DividerProps } from '@arco-design/web-react'

export const Divider = forwardRef<HTMLDivElement, DividerProps & {}>(
  ({ className, ...rest }, ref) => {
    return <ArcoDivider className={cls()} {...rest} ref={ref}></ArcoDivider>
  },
)

const cls = classes(css`
  margin: 8px 0;
`)
