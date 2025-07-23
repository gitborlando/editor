import type { SVGProps } from 'react'
import { Ref, forwardRef, memo } from 'react'
const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
    width={152.5929718017578}
    height={167.26583862304688}
    viewBox='0 0 152.5929718017578 167.26583862304688'
    fill='none'
    ref={ref}
    {...props}>
    <path
      d='M55.2046 167.266L84.7494 105.988L152.593 94.4981L0 0L55.2046 167.266Z'
      fill='#CCCCCC'
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
