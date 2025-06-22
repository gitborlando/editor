import { GET_SIGNED_URL } from 'src/global/http/api/upload/static/get-signed-url'
import { USE_SIGNED_URL } from 'src/global/http/api/upload/static/use-signed-url'

export const API = {
  upload: {
    static: {
      getSignedUrl: GET_SIGNED_URL,
      useSignedUrl: USE_SIGNED_URL,
    },
  },
}
