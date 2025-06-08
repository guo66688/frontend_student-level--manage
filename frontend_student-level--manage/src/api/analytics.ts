// src/api/analytics.ts
import request from '@/api'

export interface DashboardStats {
  students: number
  courses: number
  classes: number
  avgScore: number
}
export interface ScoreTrendItem {
  month: string
  avg: number
}
export interface PassRateItem {
  course_id: number
  passed: number
  total: number
  rate: number // 如果你仍想把 rate 传百分比字符串，就改成 string
}

export interface RankItem {
  student_name: string
  avg_score: number
}

export function getDashboardStats(): Promise<DashboardStats> {
  return request.get<DashboardStats>('/dashboard/stats')
}

export function getScoreTrend(): Promise<ScoreTrendItem[]> {
  return request.get<ScoreTrendItem[]>('/analysis/monthly')
}

export function getPassRate(): Promise<PassRateItem[]> {
  return request.get<PassRateItem[]>('/analysis/pass_rate')
}

export function getRankList(): Promise<RankItem[]> {
  return request.get<RankItem[]>('/analysis/rank')
}
