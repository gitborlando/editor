import autobind from 'class-autobind-decorator'
import { Database } from 'types/supabase'
import { supabase } from './supabase'

@autobind
class FileService {
  async getFiles() {
    try {
      const { data } = await supabase.from('files').select()
      return data
    } catch (error) {
      console.error(error)
      return []
    }
  }

  async addFile(file: Database['public']['Tables']['files']['Insert']) {
    return await supabase.from('files').insert(file)
  }
}

export const fileService = new FileService()
