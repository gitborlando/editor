import { AxiosProgressEvent } from 'axios'
import { axiosInstance } from 'src/global/http/axios'

export async function USE_SIGNED_URL(
  signedUrl: string,
  file: File,
  options: {
    onUploadProgress?: (progress: AxiosProgressEvent) => void
    contentType?: string
    cacheControl?: string
  }
) {
  return await axiosInstance.put(signedUrl, file, {
    onUploadProgress: options.onUploadProgress,
    headers: {
      'Content-Type': options.contentType,
      'Cache-Control': options.cacheControl,
    },
  })
}
