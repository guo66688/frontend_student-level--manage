// src/api/index.ts
import axios from 'axios'

const request = axios.create({
  baseURL: '/api', // 已配置 Vite 代理
  timeout: 10000,
})

// 请求拦截器：自动加 token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// —— 新增：把 response.data 直接返回 ——
request.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)

export default request
