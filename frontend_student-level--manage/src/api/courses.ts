// src/api/courses.ts
import request from '@/api'

// 定义课程接口
export interface Course {
  id: number
  course_code: string
  course_name: string
  credit: number
}

// 获取课程列表
export function getCourses(
  page: number = 1,
  size: number = 10
): Promise<{ data: Course[]; total: number }> {
  return request
    .get<{ data: Course[]; total: number }>('/api/courses', { params: { page, size } })
    .then((response) => {
      // 确保返回的结构始终是 { data: Course[], total: number }
      // response.data 直接是我们需要的结构，避免类型不匹配
      if (Array.isArray(response.data)) {
        return { data: response.data, total: response.data.length }
      }
      return response.data // 正常返回结构
    })
}

// 添加课程
export function addCourse(course: Course): Promise<Course> {
  return request.post<{ msg: string; course: Course }>('/api/courses', course).then((response) => {
    // response.data 中包含 msg 和 course
    return response.course // 返回 course 字段
  })
}

// 更新课程
export function updateCourse(id: number, course: Course): Promise<Course> {
  return request
    .put<{ msg: string; course: Course }>(`/api/courses/${id}`, course)
    .then((response) => {
      // response.data 中包含 msg 和 course
      return response.data.course // 返回 course 字段
    })
}

// 删除课程
export function deleteCourse(id: number): Promise<string> {
  return request.delete<{ msg: string }>(`/api/courses/${id}`).then((response) => {
    // response.data 中只有 msg
    return response.data.msg // 返回 msg 字段
  })
}
