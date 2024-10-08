import autobind from 'class-autobind-decorator'
import { createObjCache } from 'src/shared/utils/cache'

export type IImage = {
  objectUrl: string
  arrayBuffer: ArrayBuffer
  width: number
  height: number
  image: HTMLImageElement
}

const prefix = 'local:editor-image/'

@autobind
class ImgService {
  private imageCache = createObjCache<IImage>()

  getImage(url: string) {
    return this.imageCache.get(url)
  }

  async getImageAsync(url: string) {
    const image = this.getImage(url)
    if (image) return await image
    return this.imageCache.set(url, await this.loadImage(url))
  }

  async uploadLocal(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        const base64String = e.target?.result
        resolve(base64String as string)
      }
    })
    // const url = prefix + nanoid()
    // this.imageStore.set(url, await file.arrayBuffer())
    // return url
  }

  private async loadImage(url: string) {
    const image = <IImage>{}
    const htmlImage = new Image()
    // if (url.startsWith(prefix)) {
    //   image.arrayBuffer = await this.imageStore.get(url)
    // } else {
    //   image.arrayBuffer = await (await fetch(url)).arrayBuffer()
    // }
    // image.objectUrl = URL.createObjectURL(new Blob([image.arrayBuffer]))
    image.objectUrl = url
    await new Promise<void>((resolve) => {
      image.image = htmlImage
      htmlImage.src = image.objectUrl
      htmlImage.onload = () => {
        image.width = htmlImage.width
        image.height = htmlImage.height
        resolve()
      }
    })
    return image
  }
}

export const ImgManager = new ImgService()
