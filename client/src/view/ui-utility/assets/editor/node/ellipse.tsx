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
    <g opacity={1} transform='translate(0 0)  rotate(0 10 10)'>
      <path
        id='\u270F\uFE0F (\u8F6E\u5ED3)'
        fillRule='evenodd'
        fill='currentColor'
        transform='translate(3.14999899999998 3.149998995659871)  rotate(0 6.850000500000001 6.850000500000001)'
        opacity={1}
        d='M11.69 2.01C11.06 1.38 10.34 0.89 9.52 0.54Q8.245 0 6.85 0Q5.455 0 4.18 0.54C3.36 0.89 2.64 1.38 2.01 2.01C1.38 2.64 0.89 3.36 0.54 4.18Q0 5.455 0 6.85Q0 8.245 0.54 9.52C0.89 10.34 1.38 11.06 2.01 11.69C2.64 12.33 3.36 12.81 4.18 13.16Q5.455 13.7 6.85 13.7Q8.245 13.7 9.52 13.16C10.34 12.81 11.06 12.33 11.69 11.69C12.33 11.06 12.81 10.34 13.16 9.52Q13.7 8.245 13.7 6.85Q13.7 5.455 13.16 4.18C12.81 3.36 12.33 2.64 11.69 2.01ZM4.65 12.06C3.98 11.77 3.38 11.37 2.86 10.84C2.33 10.32 1.93 9.72 1.64 9.05C1.35 8.35 1.2 7.62 1.2 6.85C1.2 6.08 1.35 5.35 1.64 4.65C1.93 3.98 2.33 3.38 2.86 2.86C3.38 2.33 3.98 1.93 4.65 1.64C5.35 1.35 6.08 1.2 6.85 1.2C7.62 1.2 8.35 1.35 9.05 1.64C9.72 1.93 10.32 2.33 10.84 2.86C11.37 3.38 11.77 3.98 12.06 4.65C12.35 5.35 12.5 6.08 12.5 6.85C12.5 7.62 12.35 8.35 12.06 9.05C11.77 9.72 11.37 10.32 10.84 10.84C10.32 11.37 9.72 11.77 9.05 12.06C8.35 12.35 7.62 12.5 6.85 12.5C6.08 12.5 5.35 12.35 4.65 12.06Z'
      />
    </g>
  </svg>
)
const ForwardRef = forwardRef(SvgComponent)
const Memo = memo(ForwardRef)
export default Memo
