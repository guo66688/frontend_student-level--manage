// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

import router from './router'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import './assets/main.css'

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

// 注册 ECharts 组件
use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  LineChart,
  PieChart,
  CanvasRenderer,
])

const app = createApp(App)

// 全局注册 VChart 组件
app.component('v-chart', VChart)

app.use(router)
app.use(createPinia())
app.use(ElementPlus)

app.mount('#app')
