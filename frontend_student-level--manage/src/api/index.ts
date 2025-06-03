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

export default request
