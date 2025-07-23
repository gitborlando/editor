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
    <g opacity={1} transform='translate(-1.1368683772161603e-13 0)  rotate(0 8 8)'>
      <g>
        <path
          id='\u5E76\u96C6'
          fillRule='evenodd'
          fill='currentColor'
          transform='translate(2.5 1.25)  rotate(0 5.5 7)'
          opacity={1}
          d='M5.5 0C7.16 0 8.5 1.34 8.5 3L8.5 5.5L10 5.5C10.28 5.5 10.51 5.6 10.71 5.79C10.9 5.99 11 6.22 11 6.5L11 13C11 13.28 10.9 13.51 10.71 13.71C10.51 13.9 10.28 14 10 14L1 14C0.72 14 0.49 13.9 0.29 13.71C0.1 13.51 0 13.28 0 13L0 6.5C0 6.22 0.1 5.99 0.29 5.79C0.49 5.6 0.72 5.5 1 5.5L2.5 5.5L2.5 3C2.5 1.34 3.84 0 5.5 0ZM3.5 5.5L7.5 5.5L7.5 3C7.5 1.9 6.6 1 5.5 1C4.4 1 3.5 1.9 3.5 3L3.5 5.5ZM2.5 6.5L1 6.5L1 13L10 13L10 6.5L2.5 6.5Z '
        />
      </g>
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
