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
    <defs>
      <rect id='path_0' x={0} y={0} width={16} height={16} />
    </defs>
    <g opacity={1} transform='translate(1.1368683772161603e-13 0)  rotate(0 8 8)'>
      <g>
        <path
          id='\u5E76\u96C6'
          fillRule='evenodd'
          fill='currentColor'
          transform='translate(2.5 1.25)  rotate(0 5.5 7)'
          opacity={1}
          d='M7.5 3.5L8.5 3.5L8.5 3C8.5 1.34 7.16 0 5.5 0C3.84 0 2.5 1.34 2.5 3L2.5 5.5L1 5.5C0.72 5.5 0.49 5.6 0.29 5.79C0.1 5.99 0 6.22 0 6.5L0 13C0 13.28 0.1 13.51 0.29 13.71C0.49 13.9 0.72 14 1 14L10 14C10.28 14 10.51 13.9 10.71 13.71C10.9 13.51 11 13.28 11 13L11 6.5C11 6.22 10.9 5.99 10.71 5.79C10.51 5.6 10.28 5.5 10 5.5L3.5 5.5L3.5 3C3.5 1.9 4.4 1 5.5 1C6.6 1 7.5 1.9 7.5 3L7.5 3.5ZM8.5 6.5L10 6.5L10 13L1 13L1 6.5L8.5 6.5Z'
        />
      </g>
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
