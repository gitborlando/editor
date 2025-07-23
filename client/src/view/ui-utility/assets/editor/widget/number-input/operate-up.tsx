import type { SVGProps } from 'react'
import { Ref, forwardRef, memo } from 'react'
const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={10} height={5.5} fill='none' ref={ref} {...props}>
    <path
      d='m4.646.146-4.5 4.5A.498.498 0 0 0 .5 5.5a.5.5 0 0 0 .354-.146L5 1.206l4.145 4.145.001.002A.498.498 0 0 0 10 5a.5.5 0 0 0-.146-.354l-4.5-4.5a.5.5 0 0 0-.708 0'
      style={{
        opacity: 1,
      }}
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
