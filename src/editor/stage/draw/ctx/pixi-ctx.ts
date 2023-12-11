import { IXY } from '~/shared/utils'
import { IStageElement } from '../../element'
import { PIXI } from '../../pixi'
import { StageCTXService } from './ctx'

export function customPixiCTX(stageCTXService: StageCTXService, shape: IStageElement) {
  const vector = <PIXI.Graphics>shape
  const text = <PIXI.Text>shape
  stageCTXService.customCTX((ctx) => {
    ctx.beginPath = () => {}
    ctx.closePath = () => vector.closePath()
    ctx.moveTo = (to: IXY) => vector.moveTo(to.x, to.y)
    ctx.lineTo = (to: IXY) => vector.lineTo(to.x, to.y)
    ctx.arcTo = (handle: IXY, to: IXY, radius: number) => {
      vector.arcTo(handle.x, handle.y, to.x, to.y, radius)
    }
    ctx.bezierTo = (handle1: IXY, handle2: IXY, to: IXY) => {
      vector.bezierCurveTo(handle1.x, handle1.y, handle2.x, handle2.y, to.x, to.y)
    }
    ctx.drawStroke = (element: IStageElement, option) => {
      vector.lineStyle(option.width, option.color)
    }
    ctx.drawRect = (x: number, y: number, width: number, height: number) => {
      vector.drawRect(x, y, width, height)
    }
  })
}
