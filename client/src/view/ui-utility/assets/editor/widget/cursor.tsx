import type { SVGProps } from 'react'
import { Ref, forwardRef, memo } from 'react'
const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
    width={216.23065185546875}
    height={212.7095947265625}
    viewBox='0 0 216.23065185546875 212.7095947265625'
    ref={ref}
    {...props}>
    <path
      d='M106.031 204.708L128.18 121.163L208.229 103.288L7.53156 7.53088L106.031 204.708Z'
      strokeWidth={16}
      strokeLinejoin='round'
    />
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
