import autobind from 'class-autobind-decorator'
import { Uploader } from '~/global/upload'
import { preventDefault } from '~/shared/utils/event'
import { XY } from '~/shared/xy'
import { OperateMeta } from '../operate/meta'
import { OperateNode } from '../operate/node'
import { parseSvg } from '../parse/svg'
import { Schema } from '../schema/schema'
import { INodeParent } from '../schema/type'
import { Pixi } from './pixi'
import { StageViewport } from './viewport'

@autobind
export class StageDropService {
  private sceneXY = { x: 0, y: 0 }
  private files: File[] = []
  private hoverIds: string[] = []
  initHook() {
    Pixi.inited.hook(() => {
      Pixi.addListener('dragover', preventDefault())
      Pixi.addListener('drop', preventDefault(this.onDrop))
    })
  }
  private async onDrop(e: DragEvent) {
    this.files = Array.from(e.dataTransfer?.files || [])
    this.sceneXY = StageViewport.toSceneStageXY(XY.From(e, 'client'))
    this.hoverIds = [...OperateNode.hoverIds.value]
    for (const file of this.files) {
      if (file.type === 'image/svg+xml') await this.dropSvg(file)
    }
    Schema.finalOperation('drop 导入文件')
  }
  private async dropSvg(file: File) {
    const svg = await Uploader.readAsText(file)
    const hoverNode =
      this.hoverIds.reverse().find((id) => {
        const node = Schema.find(id)
        return node?.type === 'frame'
      }) || OperateMeta.curPage.value
    const svgNode = parseSvg(svg)
    OperateNode.insertAt(hoverNode as INodeParent, svgNode)
  }
}

export const StageDrop = new StageDropService()
