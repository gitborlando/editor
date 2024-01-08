import { autobind } from '~/shared/decorator'

@autobind
export class FileService {
  private inputRef!: HTMLInputElement
  setInputRef(input: HTMLInputElement) {
    this.inputRef = input
  }
  async openFile() {
    this.inputRef.click()
    const file = await new Promise<File | undefined>((resolve) => {
      this.inputRef.onchange = () => resolve(this.inputRef.files?.[0])
    })
    return file
  }
  downloadFile(blob: Blob): void {
    const downloadLink = document.createElement('a')
    downloadLink.href = URL.createObjectURL(blob)
    downloadLink.download = '文件' + new Date().getTime()
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }
}

export const File = new FileService()
