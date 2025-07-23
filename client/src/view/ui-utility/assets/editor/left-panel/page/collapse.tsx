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
    <g opacity={1} transform='translate(0 0)  rotate(0 8 8)'>
      <g>
        <path
          id='iconSvg'
          fillRule='evenodd'
          fill='rgba(32, 32, 32, 1)'
          transform='translate(4 5)  rotate(0 4 2.2499999999999996)'
          opacity={1}
          d='M7.96,4.19C7.97,4.16 7.98,4.13 7.99,4.1C8,4.07 8,4.03 8,4C8,3.97 8,3.93 7.99,3.9C7.98,3.87 7.97,3.84 7.96,3.81C7.95,3.78 7.93,3.75 7.92,3.72C7.9,3.69 7.88,3.67 7.85,3.65L4.35,0.15C4.31,0.1 4.25,0.06 4.19,0.04C4.13,0.01 4.07,0 4,0C3.93,0 3.87,0.01 3.81,0.04C3.75,0.06 3.69,0.1 3.65,0.15L0.15,3.65C0.1,3.69 0.06,3.75 0.04,3.81C0.01,3.87 0,3.93 0,4C0,4.07 0.01,4.13 0.04,4.19C0.06,4.25 0.1,4.31 0.15,4.35C0.17,4.38 0.19,4.4 0.22,4.42C0.25,4.43 0.28,4.45 0.31,4.46C0.34,4.47 0.37,4.48 0.4,4.49C0.43,4.5 0.47,4.5 0.5,4.5C0.53,4.5 0.57,4.5 0.6,4.49C0.63,4.48 0.66,4.47 0.69,4.46C0.72,4.45 0.75,4.43 0.78,4.42C0.81,4.4 0.83,4.38 0.85,4.35L4,1.21L7.15,4.35C7.17,4.38 7.19,4.4 7.22,4.42C7.25,4.43 7.28,4.45 7.31,4.46C7.34,4.47 7.37,4.48 7.4,4.49C7.43,4.5 7.47,4.5 7.5,4.5C7.53,4.5 7.57,4.5 7.6,4.49C7.63,4.48 7.66,4.47 7.69,4.46C7.72,4.45 7.75,4.43 7.78,4.42C7.81,4.4 7.83,4.38 7.85,4.35C7.88,4.33 7.9,4.31 7.92,4.28C7.93,4.25 7.95,4.22 7.96,4.19Z '
        />
      </g>
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
