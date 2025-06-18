// api/charts.ts
import axios from 'axios' // 导入 axios 实例
import type { AxiosInstance } from 'axios' // 仅导入类型 AxiosInstance
import type { AxiosResponse } from 'axios'
// 创建一个 Axios 实例
const request: AxiosInstance = axios.create({
  baseURL: '/api', // 设置你的 API 基本 URL
  headers: {
    'Content-Type': 'application/json',
  },
})

export default request

export interface Meta {
  Key: string
  Value: string
}

// export interface ChartValues {
//   x: string[]
//   y: number[]
// }

interface ChartData {
  id?: string
  type?: string
  meta?: { Key: string; Value: string }[]
  values?: { x: string[]; y: number[] }[] // 确保 values 是一个对象数组
  data_source_type?: 'static' | 'dynamic'
}
// 定义 ChartResponse 类型，包装 ChartData 和 total 字段
export interface ChartResponse {
  data: ChartData[] // 图表数据数组
  total: number // 数据总数
}

// 1. 显式定义返回类型接口
// 新增图表的接口返回类型
export interface CreateChartResponse {
  msg: string
  chart: ChartData
}

// 更新图表的接口返回类型
export interface UpdateChartResponse {
  msg: string
  chart: ChartData
}

// 获取图表列表
// 1. 更新 getCharts 函数：确保返回的数据符合 { data: ChartData[], total: number } 的结构
export const getCharts = (
  page: number = 1,
  pageSize: number = 10,
  query: string = ''
): Promise<{ data: ChartData[]; total: number }> => {
  return request.get('/charts', { params: { page, pageSize, query } }).then((response) => {
    // 假设后端返回的数据结构是 { data: ChartData[], total: number }
    return {
      data: response.data.data, // 图表数据数组
      total: response.data.total, // 数据总数
    }
  })
}

// 新增图表
export const createChart = (data: ChartData): Promise<ChartData> => {
  return request
    .post<CreateChartResponse>('/charts', data) // 指定返回值类型
    .then((response: AxiosResponse<CreateChartResponse>) => response.data.chart) // 访问 response.data.chart
}

// 更新图表
export const updateChart = (id: string, data: ChartData): Promise<ChartData> => {
  return request
    .put<UpdateChartResponse>(`/charts/${id}`, data) // 指定返回值类型
    .then((response: AxiosResponse<UpdateChartResponse>) => response.data.chart) // 访问 response.data.chart
}

// 删除图表
export const deleteChart = (id: string): Promise<void> => {
  return request.delete(`/charts/${id}`).then(() => {})
}
