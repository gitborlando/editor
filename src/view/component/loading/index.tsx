import { CSSProperties, FC } from 'react'
import './index.less'

export const Loading: FC<{
  size?: number
}> = observer(({ size = 37 }) => {
  return (
    <G className='loading' center>
      <svg
        className='loading-svg'
        x='0px'
        y='0px'
        viewBox='0 0 37 37'
        height='37'
        width='37'
        preserveAspectRatio='xMidYMid meet'
        style={{ overflow: 'visible', '--uib-size': `${size}px` } as CSSProperties}>
        <path
          className='track'
          fill='none'
          strokeWidth='5'
          pathLength='100'
          d='M0.37 18.5 C0.37 5.772 5.772 0.37 18.5 0.37 S36.63 5.772 36.63 18.5 S31.228 36.63 18.5 36.63 S0.37 31.228 0.37 18.5'></path>
        <path
          className='car'
          fill='none'
          strokeWidth='5'
          pathLength='100'
          d='M0.37 18.5 C0.37 5.772 5.772 0.37 18.5 0.37 S36.63 5.772 36.63 18.5 S31.228 36.63 18.5 36.63 S0.37 31.228 0.37 18.5'></path>
      </svg>
    </G>
  )
})
