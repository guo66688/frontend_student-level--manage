// src/api/analytics.ts
import request from '@/api'
import type { AxiosResponse } from 'axios'

/** 仪表盘统计数据 */
export interface DashboardStats {
  students: number
  courses: number
  classes: number
  avgScore: number
}

/** 月度成绩趋势项 */
export interface ScoreTrendItem {
  month: string
  avg: number
}

/** 课程通过率项 */
export interface PassRateItem {
  course: string
  rate: number
}

/** 排行榜项 */
export interface RankItem {
  student_name: string
  avg_score: number
}

/** 通用查询参数类型 */
export type AnalysisParams = Record<string, string | number | boolean>

/** 获取仪表盘统计数据 */
export function getDashboardStats(): Promise<DashboardStats> {
  return request
    .get<DashboardStats>('/dashboard/stats')
    .then((res: AxiosResponse<DashboardStats>) => res.data)
}

/** 获取月度成绩趋势 */
export function getScoreTrend(params: AnalysisParams = {}): Promise<ScoreTrendItem[]> {
  return request
    .get<ScoreTrendItem[]>('/analysis/monthly', { params })
    .then((res: AxiosResponse<ScoreTrendItem[]>) => res.data)
}

/** 获取课程通过率 */
export function getPassRate(params: AnalysisParams = {}): Promise<PassRateItem[]> {
  return request
    .get<PassRateItem[]>('/analysis/pass_rate', { params })
    .then((res: AxiosResponse<PassRateItem[]>) => res.data)
}

/** 获取成绩排行榜 */
export function getRankList(params: AnalysisParams = {}): Promise<RankItem[]> {
  return request
    .get<RankItem[]>('/analysis/rank', { params })
    .then((res: AxiosResponse<RankItem[]>) => res.data)
}
