// src/api/ranks.ts
import request from '@/api'

export function getAllRanks(): Promise<{
  student_avg: { student_name: string; avg_score: number }[]
  course_avg: {
    course_name: string
    avg_score: number
    max_score: number
    min_score: number
  }[]
  class_avg: { class_name: string; avg_score: number }[]
  pass_rate: { course_name: string; passed: number; total: number; rate: number }[]
}> {
  return request.get('/analysis/rank/all')
}
