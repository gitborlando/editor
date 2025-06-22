import axios from 'axios'

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
})

export function post(url: string, data: any) {
  return axiosInstance.post(url, data)
}

export async function get<T>(url: string, params: any): Promise<T> {
  let data: T
  try {
    const res = await axiosInstance.get(url, { params })
    data = res.data
  } catch (error) {
    console.error(error)
    throw error
  }
  return data as T
}
