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
        <g
          opacity={1}
          transform='translate(3.1500000000002046 3.150000000000091)  rotate(0 6.850000000000001 6.850000000000001)'>
          <path
            id='\u77E9\u5F62 2 (\u8F6E\u5ED3)'
            fillRule='evenodd'
            fill='currentColor'
            transform='translate(0 0)  rotate(0 6.8500000000000005 6.8500000000000005)'
            opacity={1}
            d='M13.7 0L13.7 13.7L0 13.7L0 0L13.7 0ZM1.2 12.5L1.2 1.2L12.5 1.2L12.5 12.5L1.2 12.5Z'
          />
        </g>
      </g>
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
