import Konva from 'konva'
import { makeObservable } from 'mobx'
import { EditorService } from '../editor/editor'
import { StageService } from './stage'

type IDrawType = 'rect' | 'ellipse' | 'polygon' | 'line' | 'text'

export class StageDraw {
  type: IDrawType = 'rect'
  constructor(private stage: StageService, private editor: EditorService) {
    makeObservable(this, {
      type: true,
    })
  }
  setType(type: IDrawType) {
    this.type = type
    return this
  }
  clearAll() {
    this.stage.mainLayer.destroyChildren()
    //this.stage.transformer.hide()
  }
  rect() {
    const item = new Konva.Rect()
    this.stage.mainLayer.add(item)
    return item
  }
  ellipse() {
    const item = new Konva.Ellipse()
    this.stage.mainLayer.add(item)
    return item
  }
}
