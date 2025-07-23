import type { SVGProps } from 'react'
import { Ref, forwardRef, memo } from 'react'
const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
    width={20}
    height={20}
    viewBox='0 0 20 20'
    fill='none'
    ref={ref}
    {...props}>
    <defs>
      <rect id='path_0' x={0} y={0} width={20} height={20} />
    </defs>
    <g opacity={1} transform='translate(0 0)  rotate(0 10 10)'>
      <g>
        <path
          id='\u270F\uFE0F (\u8F6E\u5ED3)'
          fillRule='evenodd'
          fill='rgba(32, 32, 32, 1)'
          transform='translate(2.900011150000296 3.150011158680627)  rotate(0 7.1000000000000005 6.8500000000000005)'
          opacity={1}
          d='M14.2 0L14.2 13.7L0 13.7L0 0L14.2 0ZM1.2 12.5L1.2 1.2L13 1.2L13 12.5L1.2 12.5Z'
        />
        <path
          id='\u270F\uFE0F (\u8F6E\u5ED3)'
          fillRule='evenodd'
          fill='rgba(32, 32, 32, 1)'
          transform='translate(3.0461935641234277 8.701238661553589)  rotate(0 6.6759485000000005 3.6889415)'
          opacity={1}
          d='M0.68,3.79L3.85,1.6L6.77,5.01L9.48,4.01L12.45,7.38L13.35,6.58L9.84,2.6L7.14,3.59L4.05,0L0,2.81L0.68,3.79Z '
        />
      </g>
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
