// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

import router from './router'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import './assets/main.css'

// —— 在这里引入并配置 axios ——
import axios from 'axios'

// 1. 如果你的后端接口都以 /api 开头，可以统一 baseURL
axios.defaults.baseURL = '/api'

// 2. 如果是基于 Cookie 的 Session 认证，允许跨域携带凭证
axios.defaults.withCredentials = true

// 3. 如果是 JWT 认证，从 localStorage 中取 token 并加到每个请求头
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 可选：把 axios 挂到全局，这样在模板里也能直接用 this.$axios
const app = createApp(App)
app.config.globalProperties.$axios = axios
// —— 配置结束 ——

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

// 全局注册 VChart 组件
app.component('v-chart', VChart)

app.use(router)
app.use(createPinia())
app.use(ElementPlus)

app.mount('#app')
