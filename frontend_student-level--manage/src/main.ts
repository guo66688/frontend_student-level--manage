import { createApp } from 'vue'
import App from './App.vue'

import router from './router'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import './assets/main.css'

import * as ElIcons from '@element-plus/icons-vue'
console.log(ElIcons)
import axios from 'axios'
import { Expand, Fold } from '@element-plus/icons-vue'
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
// 导入图标组件
app.component('ElIconSUnfold', Fold) // 注册左箭头图标
app.component('ElIconSFold', Expand) // 注册右箭头图标
// 将 axios 挂载到全局属性中
app.config.globalProperties.$axios = axios

app.use(router)
app.use(createPinia())
app.use(ElementPlus)

app.mount('#app')
