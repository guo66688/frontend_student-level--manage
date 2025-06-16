// src/api/classes.ts
import request from '@/api'

export interface Class {
  id: number
  name: string
  // 如果你的模型里还有 grade、created_at、updated_at 等字段，也可以在这里补充：
  // grade?: number
  // created_at?: string
  // updated_at?: string
}

// 获取所有班级列表
export function getClasses(): Promise<Class[]> {
  return request
    .get<Class[]>('/classes')
    .then(res => res.data)
}

// 新增班级
export function createClass(payload: { name: string }): Promise<Class> {
  return request
    .post<{ msg: string; class: Class }>('/classes', payload)
    .then(res => res.data.class)
}

// 更新班级
export function updateClass(id: number, payload: { name: string }): Promise<Class> {
  return request
    .put<{ msg: string; class: Class }>(`/classes/${id}`, payload)
    .then(res => res.data.class)
}

// 删除班级
export function deleteClass(id: number): Promise<void> {
  return request
    .delete(`/classes/${id}`)
    .then(() => {})
}
