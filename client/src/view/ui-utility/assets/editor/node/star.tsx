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
          transform='translate(1.1343600000000151 0.6704099999999471)  rotate(0 8.86562 8.439945)'
          opacity={1}
          d='M3.38 16.88L5.32 10.48L0 6.45L6.68 6.31L8.87 0L11.06 6.31L17.73 6.45L12.41 10.48L14.35 16.88L8.87 13.06L3.38 16.88ZM3.47 7.57L6.71 10.03L5.53 13.92L8.87 11.6L9.21 11.84L12.2 13.92L11.02 10.03L14.26 7.57L10.2 7.49L8.87 3.66L7.54 7.49L3.47 7.57Z'
        />
      </g>
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
