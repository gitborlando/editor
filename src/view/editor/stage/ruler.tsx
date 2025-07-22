import { Flex } from '@gitborlando/widget'
import { FC, ReactNode, memo } from 'react'
import { OperateNode } from 'src/editor/operate/node'
import { StageViewport } from 'src/editor/stage/viewport'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { useMemoComp } from 'src/shared/utils/react'

type IRulerComp = {}

export const RulerComp: FC<IRulerComp> = memo(({}) => {
  const zoom = useHookSignal(StageViewport.zoom$)
  const bound = useHookSignal(StageViewport.bound)
  const stageOffset = useHookSignal(StageViewport.offset$)
  const datumXY = OperateNode.datumXY

  useHookSignal(OperateNode.datumId)

  const drawHorizontal = () => {
    const hLabels: ReactNode[] = []
    const width = bound.width / zoom
    const offsetX = (stageOffset.x + datumXY.x) / zoom
    const step = getStepByZoom()
    const start = getNearestIntMultiple(-offsetX, step)
    const end = getNearestIntMultiple(width - offsetX, step)
    for (let i = start; i <= end; i += step) {
      const x = (i + offsetX) * zoom
      hLabels.push(<HLabelComp key={i} x={x} text={i} />)
    }
    return hLabels
  }

  const drawVertical = () => {
    const vLabels: ReactNode[] = []
    const height = bound.height / zoom
    const offsetY = (stageOffset.y + datumXY.y) / zoom
    const step = getStepByZoom()
    const start = getNearestIntMultiple(-offsetY, step)
    const end = getNearestIntMultiple(height - offsetY, step)
    for (let i = start; i <= end; i += step) {
      const y = (i + offsetY) * zoom
      vLabels.push(<VLabelComp key={i} y={y} text={i} />)
    }
    return vLabels
  }

  const getStepByZoom = () => {
    const steps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
    const base = 50 / zoom
    return steps.find((i) => i >= base) || steps[0]
  }
  const getNearestIntMultiple = (number: number, rate: number) => {
    const n = Math.floor(number / rate)
    const left = rate * n
    const right = rate * (n + 1)
    return number - left <= right - number ? left : right
  }

  const HLabelComp = useMemoComp<{ x: number; text: number }>([], ({ x, text }) => {
    return (
      <Flex layout='v' className='wh-fit absolute -translate-x-50%' style={{ left: x, top: 0 }}>
        <Flex layout='c' className='wh-1-4 b-1-#9F9F9F'></Flex>
        <Flex layout='c' className='text-10 text-[#9F9F9F]'>
          {text}
        </Flex>
      </Flex>
    )
  })

  const VLabelComp = useMemoComp<{ y: number; text: number }>([], ({ y, text }) => {
    return (
      <Flex layout='h' className='wh-fit absolute -translate-y-50%' style={{ left: 0, top: y }}>
        <Flex layout='c' className='wh-4-1 b-1-#9F9F9F'></Flex>
        <Flex layout='c' className='wh-14-10 text-10 text-[#9F9F9F] -rotate-90'>
          {text}
        </Flex>
      </Flex>
    )
  })

  return (
    <Flex
      className='wh-100% absolute of-hidden pointer-events-none'
      style={{ width: bound.width, height: bound.height }}>
      <Flex layout='h' className='wh-100%-20 '>
        {drawHorizontal()}
      </Flex>
      <Flex className='wh-20-100% absolute left-0 '>{drawVertical()}</Flex>
      <Flex layout='c' className='wh-20 absolute left-0 top-0 bg-[#F7F8FA]'></Flex>
    </Flex>
  )
})
