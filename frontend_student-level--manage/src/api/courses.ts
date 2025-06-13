// src/api/courses.ts
import request from '@/api'
import type { AxiosResponse } from 'axios' // 使用类型导入 AxiosResponse 类型

// 定义课程接口
export interface Course {
  id: number
  course_code: string
  course_name: string
  credit: number
}

// 获取课程列表
export function getCourses(page: number = 1, size: number = 10): Promise<Course[]> {
  return request
    .get<AxiosResponse<Course[]>>('/courses', { params: { page, size } })
    .then((response) => response.data) // 提取数据，返回正确的类型
}

// 添加课程
export function addCourse(course: Course): Promise<Course> {
  return request.post<AxiosResponse<Course>>('/courses', course).then((response) => response.data) // 提取数据，返回正确的类型
}

// 更新课程
export function updateCourse(id: number, course: Course): Promise<Course> {
  return request
    .put<AxiosResponse<Course>>(`/courses/${id}`, course)
    .then((response) => response.data) // 提取数据，返回正确的类型
}

// 删除课程
export function deleteCourse(id: number): Promise<void> {
  return request.delete<AxiosResponse<void>>(`/courses/${id}`).then((response) => response.data) // 提取数据，返回正确的类型
}
