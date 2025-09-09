// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

import router from './router'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // 确保 Element Plus 样式优先加载
import './assets/main.css' // 自定义样式

import '@/assets/styles/variables.css' // 自定义变量样式（如果需要的话）

// 引入 Element Plus 的图标库
import * as ElIcons from '@element-plus/icons-vue' // 批量导入所有图标
console.log(ElIcons) // 你可以检查在控制台输出所有导入的图标

import axios from 'axios'

// 引入 vue-echarts 和 ECharts
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { LineChart, PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  LineChart,
  PieChart,
  CanvasRenderer,
])

// 配置 axios
axios.defaults.baseURL = '/api'
axios.defaults.withCredentials = true
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const app = createApp(App)

// 注册 VChart 组件
app.component('v-chart', VChart)

// 通过解构从 ElIcons 导入你需要的图标
const { Fold, Expand } = ElIcons

// 注册图标组件
app.component('ElIconSUnfold', Fold) // 左箭头
app.component('ElIconSFold', Expand) // 右箭头

// 将 axios 挂载到全局属性中
app.config.globalProperties.$axios = axios

app.use(router)
app.use(createPinia())
app.use(ElementPlus)

app.mount('#app')
