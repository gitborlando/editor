import type { SVGProps } from 'react'
import { Ref, forwardRef, memo } from 'react'
const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={16} height={16} fill='none' ref={ref} {...props}>
    <g fillRule='evenodd'>
      <path
        fill='black'
        d='M2.5 12.5h3c.28 0 .5-.22.5-.5V4c0-.28-.22-.5-.5-.5h-3c-.28 0-.5.22-.5.5v8c0 .28.22.5.5.5'
      />
      <path
        fill='black'
        d='M14 14.5H2c-1.1 0-2-.9-2-2v-9c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2m.56-11.56c.16.15.24.34.24.56v9c0 .22-.08.41-.24.56-.15.16-.34.24-.56.24H2c-.22 0-.41-.08-.56-.24a.74.74 0 0 1-.24-.56v-9c0-.22.08-.41.24-.56.15-.16.34-.24.56-.24h12c.22 0 .41.08.56.24'
      />
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
