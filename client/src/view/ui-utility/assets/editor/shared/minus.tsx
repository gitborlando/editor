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
    <g
      opacity={1}
      transform='translate(-5.684341886080802e-14 -1.7053025658242404e-13)  rotate(0 8 8)'>
      <path
        id='Rectangle 5'
        fillRule='evenodd'
        fill='currentColor'
        transform='translate(3 7.399999999999636)  rotate(0 5 0.6)'
        opacity={1}
        d='M10,1.2L10,0L0,0L0,1.2L10,1.2Z '
      />
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
