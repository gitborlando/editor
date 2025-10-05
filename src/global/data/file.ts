import axios from 'axios'
import autobind from 'class-autobind-decorator'
import { Database } from 'types/supabase'
import { supabase } from '../sdk/supabase'

@autobind
class FileServiceClass {
  async getFiles() {
    try {
      const { data } = await supabase.from('files').select()
      return data
    } catch (error) {
      console.error(error)
      return []
    }
  }

  async getFileMeta(id: string) {
    const { data } = await supabase.from('files').select().eq('id', id)
    return data?.[0]
  }

  async addNewFile(file: Database['public']['Tables']['files']['Insert']) {
    return await supabase.from('files').insert(file)
  }

  async loadFile(url: string, onProgress?: (progress: number) => void) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      axios
        .get(url, {
          responseType: 'arraybuffer',
          onDownloadProgress: (e) => onProgress?.(Number((e.loaded / e.bytes).toFixed(2))),
        })
        .then((res) => {
          resolve(res.data)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
}

export const FileService = new FileServiceClass()
