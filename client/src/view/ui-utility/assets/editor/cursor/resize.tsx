import type { SVGProps } from 'react'
import { Ref, forwardRef, memo } from 'react'
const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
    width={223}
    height={75}
    viewBox='0 0 223 75'
    fill='none'
    ref={ref}
    {...props}>
    <path
      d='M36.9697 75L36.9697 45.8948L187.206 45.8948L187.206 75L223 38.9083L187.206 0L187.206 32.6646L36.9697 32.6646L36.9697 0L0 38.9083L36.9697 75Z'
      fill='#CCCCCC'
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
