// src/api/auth.ts
import request from './index'

export interface LoginResponse {
  msg: string
  token: string
}

export function login(data: { username: string; password: string }): Promise<LoginResponse> {
  return request.post<LoginResponse>('/auth/login', data)
}
