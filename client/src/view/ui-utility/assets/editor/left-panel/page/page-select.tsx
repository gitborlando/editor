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
    <g opacity={1} transform='translate(0 0)  rotate(0 8 8)'>
      <g opacity={1} transform='translate(2 2)  rotate(0 6 6)'>
        <path
          id='\u5F62\u72B6\u7ED3\u5408'
          fillRule='evenodd'
          fill='currentColor'
          transform='translate(0.6366642549999142 1.9602259944999787)  rotate(0 5.363335745 4.039774005500001)'
          opacity={1}
          d='M3.57,5.82L1.59,3.84C1.3,3.55 0.82,3.55 0.53,3.84L0.53,3.84C0.39,3.98 0.31,4.17 0.31,4.37C0.31,4.57 0.39,4.76 0.53,4.9L3,7.37C3.39,7.76 4.02,7.76 4.41,7.37L10.2,1.59C10.49,1.3 10.49,0.82 10.2,0.53L10.2,0.53C10.06,0.39 9.87,0.31 9.67,0.31C9.47,0.31 9.28,0.39 9.14,0.53L3.85,5.82C3.77,5.9 3.65,5.9 3.57,5.82Z '
        />
      </g>
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
