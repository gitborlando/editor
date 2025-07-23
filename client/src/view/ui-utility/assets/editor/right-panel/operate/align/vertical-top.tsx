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
    <g opacity={1} transform='translate(0 0)  rotate(0 8 8)'>
      <path
        id='\u77E9\u5F62 1'
        fillRule='evenodd'
        fill='currentColor'
        transform='translate(1 2)  rotate(0 7 0.5)'
        opacity={1}
        d='M0,1L14,1L14,0L0,0L0,1Z '
      />
      <path
        id='solid'
        fillRule='evenodd'
        fill='currentColor'
        transform='translate(4.5 4)  rotate(0 1 5.000000000000001)'
        opacity={1}
        d='M0,10L2,10L2,0L0,0L0,10Z '
      />
      <path
        id='solid'
        fillRule='evenodd'
        fill='currentColor'
        transform='translate(9.5 4)  rotate(0 1 3.5000000000000004)'
        opacity={1}
        d='M0,7L2,7L2,0L0,0L0,7Z '
      />
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
