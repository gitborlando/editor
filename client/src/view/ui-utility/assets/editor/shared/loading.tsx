import type { SVGProps } from 'react'
import { Ref, forwardRef, memo } from 'react'
const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
    width='207px'
    height='207px'
    viewBox='0 0 100 100'
    preserveAspectRatio='xMidYMid'
    ref={ref}
    {...props}>
    <circle
      cx={50}
      cy={50}
      fill='none'
      stroke='#2e97ff'
      strokeWidth={4}
      r={34}
      strokeDasharray='100.22122533307947 90.40707511102649'>
      <animateTransform
        attributeName='transform'
        type='rotate'
        repeatCount='indefinite'
        dur='1.083333333333333s'
        values='0 50 50;360 50 50'
        keyTimes='0;1'
      />
    </circle>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
