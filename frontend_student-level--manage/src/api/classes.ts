import request from '@/api'

export interface Class {
  id: number
  name: string
  grade?: number
  created_at?: string
  updated_at?: string
}

// 获取所有班级列表
export function getClasses(
  page = 1,
  size = 10,
  name = ''
): Promise<{ data: Class[]; total: number }> {
  return request.get('/classes', {
    params: { page, size, name },
  })
}

// 新增班级
export function createClass(payload: { name: string }): Promise<Class> {
  return request.post<{ msg: string; class: Class }>('/classes', payload).then((res) => res.class) // ✅ 使用括号包裹参数
}

// 更新班级
export function updateClass(id: number, payload: { name: string }): Promise<Class> {
  return request
    .put<{ msg: string; class: Class }>(`/classes/${id}`, payload)
    .then((res) => res.class) // ✅ 兼容 AxiosResponse
}

// 删除班级
export function deleteClass(id: number): Promise<void> {
  return request.delete(`/classes/${id}`).then(() => {})
}
