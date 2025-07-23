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
          fill='currentColor'
          transform='translate(3.141064359914708 3.141064359914253)  rotate(0 6.858914 6.858914000000001)'
          opacity={1}
          d='M0.42,12.44C0.42,12.45 0.41,12.46 0.41,12.46L0,12.87L0.85,13.72L1.27,13.29L1.27,13.29L1.27,13.29L7.28,7.28L13.29,1.27L13.29,1.27L13.29,1.27L13.72,0.85L12.87,0L12.46,0.41C12.46,0.41 12.45,0.42 12.44,0.42L6.43,6.43L0.42,12.44Z '
        />
      </g>
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
