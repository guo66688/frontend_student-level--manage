// api/charts.ts
import request from '@/api'

// ChartMeta 依旧保持不变
export interface ChartMeta {
  title: string
  [key: string]: string | number | boolean | string[] | number[] | boolean[] // 支持的类型
}

// 泛型 ChartData 接口
export interface ChartData<T = { x: string; y: string }> {
  id: string
  type: string
  meta?: { title: string }
  values: T[] // 让 values 使用泛型，支持传入不同的数据结构
  data_source_type: 'static' | 'dynamic' // 数据源类型
}

// 获取图表列表
export const getCharts = (
  page: number = 1,
  pageSize: number = 10,
  query: string = ''
): Promise<{ data: ChartData[]; total: number }> => {
  return request.get('/charts', { params: { page, pageSize, query } })
}

// 新增图表
export const createChart = (data: ChartData): Promise<ChartData> => {
  return request
    .post<{ msg: string; chart: ChartData }>('/charts', data)
    .then((response) => response.chart) // 访问 response.chart
}

// 更新图表
export const updateChart = (id: string, data: ChartData): Promise<ChartData> => {
  return request
    .put<{ msg: string; chart: ChartData }>(`/charts/${id}`, data)
    .then((response) => response.data.chart) // 访问 response.data.chart
}

// 删除图表
export const deleteChart = (id: string): Promise<void> => {
  return request.delete(`/charts/${id}`).then(() => {})
}
