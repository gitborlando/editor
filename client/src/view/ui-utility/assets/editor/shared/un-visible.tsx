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
    <g opacity={1} transform='translate(0 -1.7053025658242404e-13)  rotate(0 8 8)'>
      <g>
        <path
          id='\u8DEF\u5F84 2'
          fillRule='evenodd'
          fill='currentColor'
          transform='translate(2.122529793108697 6.534937194969643)  rotate(45 0.5 1.085485)'
          opacity={1}
          d='M0,2.17L1,2.17L1,0L0,0L0,2.17Z '
        />
        <path
          id='\u8DEF\u5F84 2'
          fillRule='evenodd'
          fill='currentColor'
          transform='translate(12.877470206891758 6.540044999999736)  rotate(-45 0.5 1.085485)'
          opacity={1}
          d='M0,0L0,2.17L1,2.17L1,0L0,0Z '
        />
        <path
          id='\u8DEF\u5F84 4'
          fillRule='evenodd'
          fill='currentColor'
          transform='translate(5.393590206891531 8.471144999999524)  rotate(0 0.7639050000000003 1.17795)'
          opacity={1}
          d='M0,2.1L0.97,2.36L1.53,0.26L0.56,0L0,2.1Z '
        />
        <path
          id='\u8DEF\u5F84 5'
          fillRule='evenodd'
          fill='currentColor'
          transform='translate(9.072570206891669 8.47144500000013)  rotate(0 0.7638999999999996 1.17795)'
          opacity={1}
          d='M0,0.26L0.56,2.36L1.53,2.1L0.97,0L0,0.26Z '
        />
        <path
          id='\u8DEF\u5F84 6'
          fillRule='evenodd'
          fill='currentColor'
          transform='translate(1.5492302068914796 5.172655000000304)  rotate(0 6.44907 1.9747449999999995)'
          opacity={1}
          d='M12.87,0.06C12.88,0.04 12.89,0.02 12.9,0L11.74,0C11.73,0.02 11.71,0.03 11.7,0.05C11.45,0.4 11.07,0.85 10.58,1.28C9.59,2.15 8.19,2.95 6.45,2.95C4.71,2.95 3.3,2.15 2.32,1.28C1.83,0.85 1.45,0.4 1.19,0.05C1.18,0.03 1.17,0.02 1.16,0L0,0C0.01,0.02 0.02,0.04 0.03,0.06C0.11,0.22 0.23,0.42 0.38,0.62C0.67,1.04 1.1,1.55 1.66,2.03C2.76,3.01 4.39,3.95 6.45,3.95C8.51,3.95 10.14,3.01 11.24,2.03C11.8,1.55 12.23,1.04 12.52,0.62C12.67,0.42 12.78,0.22 12.87,0.06Z '
        />
      </g>
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
