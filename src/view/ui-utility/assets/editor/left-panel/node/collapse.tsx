import * as React from 'react'
import type { SVGProps } from 'react'
import { Ref, forwardRef, memo } from 'react'
const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={5.4}
    height={9}
    fill='none'
    ref={ref}
    {...props}>
    <path
      fillRule='evenodd'
      d='m0 9 5.4-4.5L0 0z'
      style={{
        fill: '#949494',
      }}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
