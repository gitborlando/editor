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
      <rect id='path_1' x={0} y={0} width={12.786659598367946} height={14} />
    </defs>
    <g opacity={1} transform='translate(0 0)  rotate(0 10 10)'>
      <g>
        <g opacity={1} transform='translate(3.6066702008160405 3)  rotate(0 6.393329799183973 7)'>
          <g>
            <path
              id='\u8DEF\u5F84 1'
              fillRule='evenodd'
              fill='currentColor'
              transform='translate(0 0)  rotate(0 6.393329799183973 7)'
              opacity={1}
              d='M5.78,12.8L3.91,12.8L3.91,14L5.78,14L6.98,14L8.86,14L8.86,12.8L6.98,12.8L6.98,1.2L11.59,1.2L11.59,3.3L12.79,3.3L12.79,0L0,0L0,3.3L1.2,3.3L1.2,1.2L5.78,1.2L5.78,12.8Z '
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
