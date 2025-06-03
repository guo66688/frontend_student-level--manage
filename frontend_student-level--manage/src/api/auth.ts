// src/api/auth.ts
import request from './index'

interface LoginRequest {
  username: string
  password: string
}

export function login(data: LoginRequest) {
  return request.post('/auth/login', data)
}
