// src/api/index.ts
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'

/**
 * 扩展 AxiosInstance，使它的 get/post 等方法
 * 在 TS 里都被声明为 Promise<T>
 */
interface RequestInstance extends AxiosInstance {
  <T = unknown>(config: AxiosRequestConfig): Promise<T>
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  head<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  options<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
}

const request = axios.create({
  baseURL: '/api', // 适应不同环境
  timeout: 10000,
}) as RequestInstance

// 请求拦截器：自动带上 token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 响应拦截器：自动取 data
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 这里可以对错误进行更多处理
    console.error('Response error:', error)
    return Promise.reject(error)
  }
)

export default request
