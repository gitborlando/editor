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
    <g opacity={1} transform='translate(7.105427357601002e-14 0)  rotate(0 8 8)'>
      <path
        id='\u77E9\u5F62 1'
        fillRule='evenodd'
        fill='currentColor'
        transform='translate(7.5 1)  rotate(0 0.5 7)'
        opacity={1}
        d='M0,14L1,14L1,0L0,0L0,14Z '
      />
      <path
        id='solid'
        fillRule='evenodd'
        fill='currentColor'
        transform='translate(2.5 4.5)  rotate(0 5.500000000000001 1)'
        opacity={1}
        d='M0,2L11,2L11,0L0,0L0,2Z '
      />
      <path
        id='solid'
        fillRule='evenodd'
        fill='currentColor'
        transform='translate(4.5 9.5)  rotate(0 3.5000000000000004 1)'
        opacity={1}
        d='M0,2L7,2L7,0L0,0L0,2Z '
      />
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
