import { Container, Graphics } from '@pixi/react'
import * as PIXI from 'pixi.js'
import { FC, memo, useRef } from 'react'
import { radianfy } from '~/editor/math/base'
import { OperateNode } from '~/editor/operate/node'
import { StageViewport } from '~/editor/stage/viewport'
import { useHookSignal } from '~/shared/signal/signal-react'

type IRulerComp = {}

export const RulerComp: FC<IRulerComp> = memo(({}) => {
  const zoom = StageViewport.zoom.value
  const bound = StageViewport.bound.value
  const stageOffset = StageViewport.stageOffset.value
  const datumXY = OperateNode.datumXY
  const labels = useRef<PIXI.Text[]>([]).current
  while (labels.length) labels.pop()?.destroy()

  useHookSignal(OperateNode.datumId)
  useHookSignal(StageViewport.zoom)
  useHookSignal(StageViewport.stageOffset)

  const drawHorizontal = (g: PIXI.Graphics) => {
    const width = bound.width / zoom
    const offsetX = (stageOffset.x + datumXY.x) / zoom
    g.beginFill('#F5F5F5')
    g.drawRect(0, 0, width, 20)
    const step = getStepByZoom()
    const start = getNearestIntMultiple(-offsetX, step)
    const end = getNearestIntMultiple(width - offsetX, step)
    g.clear()
    g.lineStyle(0.5, '#9F9F9F')
    for (let i = start; i <= end; i += step) {
      const x = (i + offsetX) * zoom
      g.moveTo(x, 0)
      g.lineTo(x, 4)
      const label = new PIXI.Text(i, { fontSize: 10, fill: '#9F9F9F' })
      labels.push(label)
      g.addChild(label)
      label.x = x - label.getBounds().width / 2
      label.y = 6
    }
  }
  const drawVertical = (g: PIXI.Graphics) => {
    const height = bound.height / zoom
    const offsetY = (stageOffset.y + datumXY.y) / zoom
    g.beginFill('#F5F5F5')
    g.drawRect(0, 0, 20, height)
    const step = getStepByZoom()
    const start = getNearestIntMultiple(-offsetY, step)
    const end = getNearestIntMultiple(height - offsetY, step)
    g.clear()
    g.lineStyle(0.5, '#9F9F9F')
    for (let i = start; i <= end; i += step) {
      const y = (i + offsetY) * zoom
      g.moveTo(0, y)
      g.lineTo(4, y)
      const label = new PIXI.Text(i, { fontSize: 10, fill: '#9F9F9F' })
      labels.push(label)
      g.addChild(label)
      label.x = 6
      label.y = y + label.getBounds().width / 2
      label.rotation = radianfy(-90)
    }
  }
  const drawCorner = (g: PIXI.Graphics) => {
    g.beginFill('#F5F5F5')
    g.drawRect(0, 0, 20, 20)
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

  return (
    <Container>
      <Graphics draw={drawHorizontal} />
      <Graphics draw={drawVertical} />
      <Graphics draw={drawCorner} />
    </Container>
  )
})

RulerComp.displayName = 'RulerComp'
