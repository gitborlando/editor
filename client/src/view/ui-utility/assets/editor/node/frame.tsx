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
        <g opacity={1} transform='translate(2.5 2.5)  rotate(0 7.5 7.499999985239221)'>
          <g opacity={1} transform='translate(0 0)  rotate(0 7.5 7.499999985239221)'>
            <path
              id='\u76F4\u7EBF 1 (\u8F6E\u5ED3)'
              fillRule='evenodd'
              fill='currentColor'
              transform='translate(3.1499999999999773 0)  rotate(0 0.6 7.5)'
              opacity={1}
              d='M0,0L0,15L1.2,15L1.2,0L0,0Z '
            />
            <path
              id='\u76F4\u7EBF 1 (\u8F6E\u5ED3)'
              fillRule='evenodd'
              fill='currentColor'
              transform='translate(10.649999999999977 0)  rotate(0 0.6 7.5)'
              opacity={1}
              d='M0,0L0,15L1.2,15L1.2,0L0,0Z '
            />
            <path
              id='\u76F4\u7EBF 1 (\u8F6E\u5ED3)'
              fillRule='evenodd'
              fill='currentColor'
              transform='translate(0 3.150000000000091)  rotate(0 7.5 0.6)'
              opacity={1}
              d='M0,1.2L15,1.2L15,0L0,0L0,1.2Z '
            />
            <path
              id='\u76F4\u7EBF 1 (\u8F6E\u5ED3)'
              fillRule='evenodd'
              fill='currentColor'
              transform='translate(0 10.650000000000091)  rotate(0 7.5 0.6)'
              opacity={1}
              d='M0,1.2L15,1.2L15,0L0,0L0,1.2Z '
            />
          </g>
        </g>
      </g>
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
