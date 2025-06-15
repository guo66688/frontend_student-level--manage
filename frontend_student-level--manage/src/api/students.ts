// src\api\students.ts
import request from '@/api'

// 修改 Student 类型
export interface Class {
  id: number
  name: string
}

export interface Student {
  id: number
  student_no: string
  name: string
  gender: string
  class: Class // class 是一个对象，包含 id 和 class_name
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
}

// 获取学生列表，支持学号、班级以及姓名搜索
export function getStudents(
  page: number,
  size: number,
  query: string = '',
  student_no: string = '',
  class_name: string = ''
): Promise<PaginatedResponse<Student>> {
  return request.get<PaginatedResponse<Student>>('/students', {
    params: { page, size, query, student_no, class_name },
  })
}

// 创建学生
export function createStudent(student: Partial<Student>): Promise<Student> {
  return request.post<Student>('/students', student)
}

// 更新学生
export function updateStudent(id: number, student: Partial<Student>): Promise<Student> {
  return request.put<Student>(`/students/${id}`, student).then((response) => response.data)
}

// 删除学生，忽略返回值
export function deleteStudent(id: number): Promise<void> {
  return request.delete(`/students/${id}`).then(() => {}) // 直接返回一个空的 Promise
}
