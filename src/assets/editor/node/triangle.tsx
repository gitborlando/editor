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
          transform='translate(2.492629999999963 2.74025000000006)  rotate(0 7.507385 6.929875000000001)'
          opacity={1}
          d='M15.01 13.86L0 13.86L7.51 0L15.01 13.86ZM7.51 2.52L13 12.66L2.01 12.66L7.51 2.52Z'
        />
      </g>
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
