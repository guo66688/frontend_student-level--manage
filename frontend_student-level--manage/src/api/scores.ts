// src/api/scores.ts
import request from '@/api'

// 定义成绩接口
export interface Score {
  id: number
  student_no: string
  student_name: string // 修改为 student_name
  course_id: number
  course_name: string
  score: number
  exam_date: string
}

// 获取成绩列表
export function getScores(
  page: number = 1,
  size: number = 10,
  query: string = '', // 添加 query 参数
  studentNo: string = '', // 学号查询
  courseName: string = '' // 课程查询
): Promise<{ data: Score[]; total: number }> {
  return request
    .get<{ data: Score[]; total: number }>('/scores', {
      params: { page, size, query, student_no: studentNo, course_name: courseName }, // 将查询条件作为请求参数
    })
    .then((response) => {
      // 确保返回的结构始终是 { data: Score[], total: number }
      // if (Array.isArray(response.data)) {
      //   // 如果返回的数据是数组，包装成符合结构的对象
      //   return { data: response.data, total: response.data.length }
      // }
      return response // 正常返回结构
    })
}

// 添加成绩
export function addScore(score: Score): Promise<Score> {
  return request.post<{ msg: string; score: Score }>('/scores', score).then((response) => {
    // 直接返回 response.data.score
    return response.score // 修正为 response.data.score
  })
}

// 更新成绩
export function updateScore(id: number, score: Score): Promise<Score> {
  return request.put<{ msg: string; score: Score }>(`/scores/${id}`, score).then((response) => {
    // 返回更新后的 score 字段
    return response.data.score // 修正为 response.data.score
  })
}

// 删除成绩
export function deleteScore(id: number): Promise<string> {
  return request.delete<{ msg: string }>(`/scores/${id}`).then((response) => {
    // 通过类型断言确保 `response.data` 确实有 `msg` 属性
    return (response.data as { msg: string }).msg
  })
}
