import autoBind from 'class-autobind-decorator'
import { floor } from 'src/editor/math/base'
import { Surface } from 'src/editor/stage/render/surface'
import { createObjCache } from 'src/shared/utils/cache'
import { listen, listenOnce } from 'src/shared/utils/event'

export type IStageCursorType = 'select' | 'move' | 'resize' | 'rotate' | 'copy'

@autoBind
class StageCursorService {
  private type: IStageCursorType = 'select'
  private rotation = 0
  private locked = false

  initHook() {
    Surface.inited$.hook(() => this.setCursor('select'))
    listen('mouseup', () => (this.locked = false))
  }

  setCursor(type: IStageCursorType, rotation = 0) {
    if (this.locked) return this

    this.type = type
    this.rotation = floor(rotation)
    Surface.canvas.style.cursor = this.getSvgUrl()

    return this
  }

  lock() {
    this.locked = true
    return this
  }

  unlock() {
    this.locked = false
    return this
  }

  upReset() {
    listenOnce('mouseup', () => {
      this.unlock().setCursor('select', 0)
    })
    return this
  }

  private svgCache = createObjCache<string>()

  private getSvgUrl() {
    return this.svgCache.getSet(`${this.type}-${this.rotation}`, () => {
      if (this.type === 'resize') {
        return `url('${URL.createObjectURL(
          new Blob([this.resizeSvg(this.rotation)], { type: 'image/svg+xml' })
        )}') 14 14, auto`
      }
      return `url('${URL.createObjectURL(
        new Blob([this[this.type]], { type: 'image/svg+xml' })
      )}') 5 5, auto`
    })
  }

  private select = `<svg width='25' height='25' viewBox='0 0 25 25' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path d='M9.61549 19.9233L5.35746 5.17568L19.0755 12.8854L13.1067 14.4694L12.9128 14.5209L12.8082 14.6922L9.61549 19.9233Z' fill='black' stroke='white'/>
    </svg>`

  private move = `<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.9537 11.6419H12.4537V11.1419V6.85634V6.35634H11.9537H10.1024L13.522 2.7111L17.3165 6.35634H15.0455H14.5455V6.85634V11.1419V11.6419H15.0455H19.718H20.218V11.1419V9.18733L23.2996 12.5703L20.218 16.0889V14.0702V13.5702H19.718H15.0455H14.5455V14.0702V18.6662V19.1662H15.0455H17.0041L13.5124 22.3184L10.1988 19.1662H11.9537H12.4537V18.6662V14.0702V13.5702H11.9537H7.61706H7.11706V14.0702V16.2289L3.66881 12.8509L7.11706 9.16283V11.1419V11.6419H7.61706H11.9537Z" fill="black" stroke="white"/>
    </svg>`

  private rotate = `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.9707 7.24795L18.2712 7.59065L18.6402 7.32306L20.1869 6.20135L19.5201 10.8038L14.5657 10.4403L16.2 9.14298L16.6113 8.81652L16.2651 8.42172C15.4904 7.53823 14.5245 7.09714 13.4344 6.84246C12.3085 6.57941 11.1257 6.66971 10.0553 7.10094C8.98475 7.53223 8.07983 8.28319 7.47273 9.24854C6.86548 10.2141 6.58825 11.3435 6.68272 12.4739C6.77718 13.6043 7.23815 14.6745 7.99673 15.5312C8.7551 16.3876 9.77159 16.9864 10.8988 17.2442C12.026 17.502 13.2083 17.4061 14.2766 16.9698C15.1921 16.596 15.9848 15.988 16.5719 15.2125L18.405 16.288C17.5835 17.4239 16.4458 18.3175 15.1177 18.8598C13.6272 19.4685 11.9756 19.6027 10.4009 19.2426C8.82632 18.8826 7.41225 18.0474 6.36075 16.86C5.30945 15.6727 4.67444 14.1943 4.54437 12.6378C4.4143 11.0813 4.79554 9.52374 5.63512 8.18873C6.47484 6.85347 7.73058 5.80862 9.22392 5.20702C10.7174 4.60535 12.3697 4.47889 13.9425 4.84637C15.5153 5.21382 16.9252 6.05559 17.9707 7.24795Z" fill="black" stroke="white"/>
    </svg>`

  private copy = `<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path d='M11.033 19.0965L7.21341 4.50721L20.9759 12.242L14.7155 13.9371L14.5379 13.9852L14.4338 14.137L11.033 19.0965Z' fill='black' stroke='white'/>
    <path d='M9.641 7.58417L17.054 11.8743L13.7069 12.789L11.7756 15.9271L9.641 7.58417Z' fill='white'/>
    <path d='M9.641 7.58417L17.054 11.8743L13.7069 12.789L11.7756 15.9271L9.641 7.58417Z' stroke='white'/>
    <path d='M6.79025 19.2755L2.53223 4.5279L16.2503 12.2376L10.2815 13.8217L10.0875 13.8731L9.98297 14.0445L6.79025 19.2755Z' fill='black' stroke='white'/>
    </svg>`

  private resizeSvg = (
    degree: number
  ) => `<svg width='25' height='25' viewBox='0 0 25 25' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path transform='rotate(${degree} 12.5 12.5)' d='M23.9611 11.8673L20.2565 16.2419V13.301V12.901H19.8565H12.4758H5.00089H4.60089V13.301V16.2169L1.02101 11.8627L4.60089 7.78206V10.6414V11.0414H5.00089H12.4758H19.6995H20.0995V10.6414V7.7337L23.9611 11.8673Z' fill='black' stroke='white' stroke-width='0.8'/>
    </svg>`
}

export const StageCursor = new StageCursorService()
