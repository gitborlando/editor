import type { SVGProps } from 'react'
import { Ref, forwardRef, memo } from 'react'
const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
    width={30}
    height={30}
    viewBox='0 0 30 30'
    fill='none'
    ref={ref}
    {...props}>
    <defs>
      <rect id='path_0' x={0} y={0} width={30} height={30} />
    </defs>
    <g opacity={1} transform='translate(0 0)  rotate(0 15 15)'>
      <g>
        <path
          id='\u270F\uFE0F'
          fillRule='evenodd'
          fill='rgba(32, 32, 32, 1)'
          transform='translate(8 9.5)  rotate(0 7 0.6)'
          opacity={1}
          d='M0,1.2L14,1.2L14,0L0,0L0,1.2Z '
        />
        <path
          id='\u270F\uFE0F'
          fillRule='evenodd'
          fill='rgba(32, 32, 32, 1)'
          transform='translate(8 14.400000000000091)  rotate(0 7 0.6)'
          opacity={1}
          d='M0,1.2L14,1.2L14,0L0,0L0,1.2Z '
        />
        <path
          id='\u270F\uFE0F'
          fillRule='evenodd'
          fill='rgba(32, 32, 32, 1)'
          transform='translate(8 19.300000000000182)  rotate(0 7 0.6)'
          opacity={1}
          d='M0,1.2L14,1.2L14,0L0,0L0,1.2Z '
        />
      </g>
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
