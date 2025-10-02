import { ComponentPropsWithRef, FC } from 'react'
import './index.less'

export const Text: FC<{ strong?: boolean } & ComponentPropsWithRef<'div'>> = observer(
  ({ children, strong, style, ...rest }) => {
    return (
      <G className='text' {...rest} style={{ ...style, ...(strong && { fontWeight: 'bold' }) }}>
        {children}
      </G>
    )
  },
)
