import { get } from 'src/global/http/axios'

export async function GET_SIGNED_URL(fileType: { ext: string; mineType: string }) {
  return await get<{ signedUploadUrl: string; url: string }>('/upload/static/get-signed-url', {
    ext: fileType.ext,
    mineType: fileType.mineType,
  })
}
