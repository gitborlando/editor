import { IStageElement } from '../../element'
import { PIXI } from '../../pixi'
import { StageCTXService } from './ctx'

export function customPixiCTX(stageCTXService: StageCTXService, shape: IStageElement) {
  const vector = <PIXI.Graphics>shape
  const text = <PIXI.Text>shape
  stageCTXService.customCTX((ctx) => {
    ctx.beginPath = () => {}
    ctx.closePath = () => vector.closePath()
    ctx.moveTo = (x: number, y: number) => vector.moveTo(x, y)
    ctx.lineTo = (x: number, y: number) => vector.lineTo(x, y)
    ctx.arcTo = (x1: number, y1: number, x2: number, y2: number, radius: number) => {
      vector.arcTo(x1, y1, x2, y2, radius)
    }
  })
}
