import type { SVGProps } from 'react'
import { Ref, forwardRef, memo } from 'react'
const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
    width={16}
    height={16}
    viewBox='0 0 16 16'
    fill='none'
    ref={ref}
    {...props}>
    <g opacity={1} transform='translate(0 0)  rotate(0)'>
      <path id='\u76F4\u7EBF 1' d='M8.5 3L8.5 13L7.5 13L7.5 3L8.5 3Z' />
      <path id='\u76F4\u7EBF 2' d='M3 7.5L13 7.5L13 8.5L3 8.5L3 7.5Z' />
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
