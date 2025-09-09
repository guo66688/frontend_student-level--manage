// src/api/analysisApi.ts

import axios from 'axios'

// 获取所有图表选项的函数
export const getChartOptions = () => {
  return axios.get('/charts') // 这里修改成 /charts 路由，符合后端的 ListCharts 接口
}

// 获取图表数据的函数
export const getChartData = (id: string, type: string, dataSourceType: string) => {
  return axios.get('/charts/data', {
    params: {
      id: id, // 添加 id 参数
      type: type, // 传递图表类型
      data_source_type: dataSourceType, // 传递数据源类型
    },
  })
}
