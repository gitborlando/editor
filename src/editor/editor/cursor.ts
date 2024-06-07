import { Surface } from 'src/editor/stage/render/surface'
import { createObjCache } from 'src/shared/utils/cache'

export type IEditorCursorType = 'select' | 'resize' | 'rotate' | 'copy'

class EditorCursorService {
  show = false
  type = <IEditorCursorType>'select'
  rotation = 0

  initHook() {
    Surface.inited.hook(() => this.setCursor('select'))
    Surface.addEvent('mousedown', () => this.lock())
    addEventListener('mouseup', () => this.unLock())
  }

  setShow(show: boolean) {
    this.show = show
    return this
  }

  setCursor(type: IEditorCursorType, rotation = 0) {
    //  if (this.locked) return

    this.type = type
    this.rotation = rotation
    Surface.canvas.style.cursor = this.getSvgUrl(type, rotation)
  }

  private locked = false

  lock() {
    this.locked = true
  }
  unLock() {
    this.locked = false
  }

  private svgCache = createObjCache<string>()

  private getSvgUrl(type: IEditorCursorType, rotation: number) {
    return this.svgCache.getSet(`${type}-${rotation}`, () => {
      switch (type) {
        case 'select':
          return `url("${URL.createObjectURL(
            new Blob([this.selectSvg], { type: 'image/svg+xml' })
          )}") 5 5, auto`

        case 'copy':
          return `url("${URL.createObjectURL(
            new Blob([this.copySvg], { type: 'image/svg+xml' })
          )}") 5 5, auto`

        case 'resize':
          return `url("${URL.createObjectURL(
            new Blob([this.resizeSvg(rotation)], { type: 'image/svg+xml' })
          )}") 10 10, auto`

        case 'rotate':
          return `url("${URL.createObjectURL(
            new Blob([this.rotateSvg(rotation)], { type: 'image/svg+xml' })
          )}") 10 10, auto`

        default:
          return ''
      }
    })
  }

  private selectSvg = `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.61549 19.9233L5.35746 5.17568L19.0755 12.8854L13.1067 14.4694L12.9128 14.5209L12.8082 14.6922L9.61549 19.9233Z" fill="black" stroke="white"/>
    </svg>`

  private copySvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.033 19.0965L7.21341 4.50721L20.9759 12.242L14.7155 13.9371L14.5379 13.9852L14.4338 14.137L11.033 19.0965Z" fill="black" stroke="white"/>
    <path d="M9.641 7.58417L17.054 11.8743L13.7069 12.789L11.7756 15.9271L9.641 7.58417Z" fill="white"/>
    <path d="M9.641 7.58417L17.054 11.8743L13.7069 12.789L11.7756 15.9271L9.641 7.58417Z" stroke="white"/>
    <path d="M6.79025 19.2755L2.53223 4.5279L16.2503 12.2376L10.2815 13.8217L10.0875 13.8731L9.98297 14.0445L6.79025 19.2755Z" fill="black" stroke="white"/>
    </svg>`

  private resizeSvg = (
    degree: number
  ) => `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path transform="rotate(${degree} 12.5 12.5)" d="M23.9611 11.8673L20.2565 16.2419V13.301V12.901H19.8565H12.4758H5.00089H4.60089V13.301V16.2169L1.02101 11.8627L4.60089 7.78206V10.6414V11.0414H5.00089H12.4758H19.6995H20.0995V10.6414V7.7337L23.9611 11.8673Z" fill="black" stroke="white" stroke-width="0.8"/>
    </svg>`

  private rotateSvg = (
    degree: number
  ) => `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path transform="rotate(${degree} 12.5 12.5)" d="M11.6693 21.7421L11.2829 22.0735L11.6213 22.4539L13.2393 24.2725L8.07739 23.3754V18.0086L9.63044 19.9493L9.95368 20.3532L10.3463 20.0164C11.294 19.2035 12.2806 18.025 12.8572 16.796C13.4259 15.5839 13.7597 14.2441 13.8376 12.8704C13.9156 11.4967 13.736 10.1185 13.3102 8.83163C13.0854 8.15241 12.6547 7.41043 12.1947 6.73945C11.7305 6.06226 11.216 5.42816 10.7996 4.96004L10.4265 4.5407L10.0529 4.95951L8.07739 7.17383V1.31741L13.8705 0.953182L12.0653 2.62069L11.7048 2.95366L12.031 3.3203C12.5845 3.94255 13.2496 4.70604 13.8439 5.51808C14.4419 6.33518 14.9463 7.17227 15.2001 7.93915C15.7404 9.57196 16.0002 11.0898 15.9023 12.8138C15.8036 14.5536 15.3432 16.4622 14.6315 17.9792C13.9279 19.4788 12.8718 20.7106 11.6693 21.7421Z" fill="black" stroke="white"/>
    </svg>`
}

export const EditorCursor = new EditorCursorService()
