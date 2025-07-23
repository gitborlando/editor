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
    <g
      opacity={1}
      transform='translate(-1.1368683772161603e-13 -1.7053025658242404e-13)  rotate(0 8 8)'>
      <g>
        <path
          id='\u8DEF\u5F84 2 (\u8F6E\u5ED3)'
          fillRule='evenodd'
          fill='currentColor'
          transform='translate(1.0833333333330302 3.6250009999985195)  rotate(0 6.915 4.374999500000847)'
          opacity={1}
          d='M13.29 5.42C12.91 5.92 12.46 6.38 11.95 6.82C11.28 7.38 10.56 7.83 9.81 8.15C8.87 8.55 7.91 8.75 6.92 8.75C5.93 8.75 4.96 8.55 4.03 8.15C3.27 7.83 2.55 7.38 1.88 6.82C1.37 6.38 0.92 5.92 0.54 5.42Q0 4.715 0 4.37C0 4.13 0.18 3.78 0.54 3.3C0.92 2.81 1.36 2.34 1.89 1.91C2.56 1.35 3.27 0.91 4.03 0.59C4.96 0.2 5.93 0 6.92 0C7.91 0 8.87 0.2 9.81 0.6C10.56 0.92 11.28 1.36 11.95 1.92C12.46 2.36 12.91 2.82 13.29 3.32Q13.83 4.025 13.83 4.37Q13.83 4.715 13.29 5.42ZM11.3 2.69Q10.415 1.94 9.41 1.52C8.61 1.17 7.77 1 6.92 1C6.06 1 5.23 1.17 4.42 1.51Q3.415 1.93 2.53 2.68C2.06 3.06 1.67 3.47 1.34 3.91C1.21 4.07 1.12 4.21 1.05 4.34C1.04 4.35 1.04 4.36 1.03 4.36C1.04 4.37 1.04 4.38 1.05 4.39C1.12 4.51 1.21 4.66 1.34 4.82C1.67 5.25 2.07 5.67 2.53 6.05C3.12 6.55 3.75 6.95 4.42 7.23C5.23 7.58 6.06 7.75 6.92 7.75C7.77 7.75 8.6 7.58 9.41 7.23C10.08 6.95 10.71 6.55 11.3 6.05C11.76 5.67 12.16 5.25 12.49 4.82C12.62 4.66 12.71 4.51 12.78 4.39C12.79 4.38 12.79 4.38 12.79 4.37C12.79 4.36 12.79 4.36 12.78 4.35C12.71 4.23 12.62 4.09 12.49 3.92C12.16 3.49 11.76 3.08 11.3 2.69Z'
        />
        <path
          id='\u8DEF\u5F84 3'
          fillRule='evenodd'
          fill='currentColor'
          transform='translate(6 5.994999999999891)  rotate(0 2 2)'
          opacity={1}
          d='M2,0C0.9,0 0,0.9 0,2C0,3.1 0.9,4 2,4C3.1,4 4,3.1 4,2C4,0.9 3.1,0 2,0Z '
        />
      </g>
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
