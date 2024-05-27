import autobind from 'class-autobind-decorator'
import { createSignal } from 'src/shared/signal/signal'
import { IXY } from 'src/shared/utils/normal'
import { xy_ } from '../math/xy'
import { Pixi } from '../stage/pixi'

export type IEditorCursorType =
  | 'auto'
  | 'n-resize'
  | 'ne-resize'
  | 'e-resize'
  | 'se-resize'
  | 's-resize'
  | 'sw-resize'
  | 'w-resize'
  | 'nw-resize'
  | 'move'
  | 'crosshair'
  | 'pointer'
  | 'help'
  | 'not-allowed'
  | 'text'
  | 'wait'
  | 'progress'
  | 'alias'
  | 'copy'
  | 'no-drop'
  | 'zoom-in'
  | 'zoom-out'
  | 'grab'
  | 'grabbing'
  | 'v-resize'

type ICursorOption = {
  type: IEditorCursorType
  xy: IXY
  rotation: number
}

@autobind
class StageCursorService {
  show = false
  type = <IEditorCursorType>'select'
  xy = xy_()
  rotation = 0
  cursorChange$ = createSignal()
  private lockType = false
  private translate = xy_()
  inViewport = true
  private cursor = document.createElement('div')
  initHook() {
    // StageViewport.inited.hook(() => {
    //   addListener('mousemove', (e) => {
    //     this.setCursor({ xy: xy_client(e) })
    //     this.inViewport = StageViewport.inViewport(this.xy)
    //   })
    // })
    // this.createCursor()
  }
  setShow(show: boolean) {
    this.show = show
    return this
  }
  setLock(lock: boolean) {
    this.lockType = lock
    return this
  }
  setCursor(option: Partial<ICursorOption>) {
    this.type = option.type ?? this.type
    this.xy = option.xy ?? this.xy
    this.rotation = option.rotation ?? this.rotation
    Pixi.htmlContainer.style.cursor = this.type
  }
  private createCursor() {
    this.cursor.className = 'fixed left-0 top-0 pointer-events-none z-999'
    this.cursor.innerHTML = svg_select
    document.body.appendChild(this.cursor)
  }
  private renderCursor() {
    if (!this.inViewport) return (this.cursor.style.display = 'none')
    this.cursor.style.display = 'block'
    this.cursor.style.left = this.xy.x + 'px'
    this.cursor.style.top = this.xy.y + 'px'
    this.cursor.style.transform = ` rotate(${this.rotation}deg)`
  }
}

export const EditorCursor = new StageCursorService()

const svg_select = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" viewBox="0 0 152.5929718017578 167.26583862304688" fill="none">
<path d="M55.2046 167.266L84.7494 105.988L152.593 94.4981L0 0L55.2046 167.266Z"   fill="hsl(217 100 60)" >
</path>
</svg>
`
