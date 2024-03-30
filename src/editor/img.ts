import autobind from 'class-autobind-decorator'
import { nanoid } from 'nanoid'
import { createCache } from '~/shared/cache'
import { createIDBStore } from '~/shared/idb-store'

export type IImage = {
  objectUrl: string
  arrayBuffer: ArrayBuffer
  width: number
  height: number
}

const prefix = 'local:editor-image/'

@autobind
export class ImgService {
  imageStore = createIDBStore<ArrayBuffer>('editor-image')
  imageCache = createCache<IImage>()
  getImage(url: string) {
    return this.imageCache.get(url)
  }
  async getImageAsync(url: string) {
    const image = this.getImage(url)
    if (image) return await image
    return this.imageCache.set(url, await this.loadImage(url))
  }
  async uploadLocal(file: File) {
    const url = prefix + nanoid()
    this.imageStore.set(url, await file.arrayBuffer())
    return url
  }
  private async loadImage(url: string) {
    const image = <IImage>{}
    const htmlImage = new Image()
    if (url.startsWith(prefix)) {
      image.arrayBuffer = await this.imageStore.get(url)
    } else {
      image.arrayBuffer = await (await fetch(url)).arrayBuffer()
    }
    image.objectUrl = URL.createObjectURL(new Blob([image.arrayBuffer]))
    await new Promise<void>((resolve) => {
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

export const Img = new ImgService()
