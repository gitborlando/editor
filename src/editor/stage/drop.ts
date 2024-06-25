import autobind from 'class-autobind-decorator'
import { StageSelect } from 'src/editor/stage/interact/select'
import { StageScene } from 'src/editor/stage/render/scene'
import { Surface } from 'src/editor/stage/render/surface'
import { Uploader } from 'src/global/upload'
import { IClientXY, preventDefault } from 'src/shared/utils/event'
import { ImgManager } from '../editor/img-manager'
import { xy_, xy_client } from '../math/xy'
import { OperateNode } from '../operate/node'
import { OperatePage } from '../operate/page'
import { SvgParser } from '../parse/svg'
import { SchemaDefault } from '../schema/default'
import { Schema } from '../schema/schema'
import { INode, INodeParent } from '../schema/type'
import { StageViewport } from './viewport'

@autobind
export class StageDropService {
  private sceneXY = xy_(0, 0)
  private files: File[] = []
  private containerNode!: INodeParent
  private node!: INode

  initHook() {
    Surface.addEvent('dragover', preventDefault())
    Surface.addEvent('drop', preventDefault(this.onDrop))
  }

  private async onDrop(e: DragEvent) {
    this.sceneXY = StageViewport.toSceneXY(xy_client(e))
    this.getContainerNode(e)
    await this.onDropData(e)
    await this.onDropFile(e)
    StageSelect.onCreateSelect(this.node.id)
    Schema.finalOperation('drop 导入文件')
  }

  private async onDropData(e: DragEvent) {
    const transferData = e.dataTransfer?.getData('text/plain')
    if (!transferData) return

    const { event, data } = JSON.parse(transferData)
    switch (event) {
      case 'dropSvg':
        this.dropSvg(data.svgStr, data.name)
        break

      case 'dropImage':
        await this.dropImage(data.url)
        break
    }
  }

  private async onDropFile(e: DragEvent) {
    this.files = Array.from(e.dataTransfer?.files || [])

    for (const file of this.files) {
      switch (file.type) {
        case 'image/svg+xml':
          const svg = await Uploader.readAsText(file)
          this.dropSvg(svg, file.name)
          break

        case 'image/jpeg':
        case 'image/png':
        case 'image/jpg':
          const imageDataUrl = await Uploader.readAsDataUrl(file)
          await this.dropImage(imageDataUrl)
          break
      }
    }
  }

  private dropSvg(svgString: string, name: string) {
    this.node = new SvgParser(svgString, this.sceneXY).parse()
    this.node.name = name
    OperateNode.insertAt(this.containerNode, this.node)
  }

  private async dropImage(url: string) {
    const image = await ImgManager.getImageAsync(url)
    const option = { ...this.sceneXY, width: image.width, height: image.height }
    this.node = SchemaDefault.rect(option)
    this.node.fills = [SchemaDefault.fillImage(url)]
    OperateNode.addNodes([this.node])
    OperateNode.insertAt(this.containerNode, this.node)
  }

  private getContainerNode(e: IClientXY) {
    const hoverIds = StageScene.getElemsFromPoint(e).map((elem) => elem.id)

    this.containerNode =
      hoverIds.map(Schema.find<INodeParent>).find((node) => node?.type === 'frame') ||
      OperatePage.currentPage
  }
}

export const StageDrop = new StageDropService()
