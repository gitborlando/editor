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
          id='矩形 2 (轮廓)'
          fillRule='evenodd'
          fill='currentColor'
          transform='translate(3.0850519999999317 1.782070769230927)  rotate(0 7.315023999999999 8.48223)'
          opacity={1}
          d='M14.63 9.01L0 0L3.46 16.96L4.25 15.48L6.95 10.34L14.63 9.01ZM11.3 8.37L6.16 9.26L3.97 13.43L1.73 2.47L11.3 8.37Z'
        />
      </g>
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
