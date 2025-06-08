<!-- src\views\HomeView.vue -->
<template>
  <div class="layout">
    <!-- 可折叠侧栏 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="collapse-btn">
        <el-button
          :icon="isCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
          @click="isCollapsed = !isCollapsed"
          circle
          size="small"
        />
      </div>
      <el-menu
        :collapse="isCollapsed"
        router
        :default-active="route.path"
        background-color="#fff"
        text-color="#303133"
        active-text-color="#409EFF"
        unique-opened
      >
        <el-menu-item index="/home"> <i class="el-icon-s-home" /><span>首页</span> </el-menu-item>
        <el-menu-item index="/students">
          <i class="el-icon-user" /><span>学生管理</span>
        </el-menu-item>
        <el-menu-item index="/courses">
          <i class="el-icon-notebook-1" /><span>课程管理</span>
        </el-menu-item>
        <el-menu-item index="/scores">
          <i class="el-icon-document" /><span>成绩管理</span>
        </el-menu-item>
        <el-menu-item index="/analysis">
          <i class="el-icon-data-analysis" /><span>统计分析</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <!-- 主区：flex:1 自动占满剩余 -->
    <main class="main-content">
      <!-- 1. 统计卡片 -->
      <section class="stats">
        <div v-for="card in stats" :key="card.title" class="stat-item">
          <div class="stat-title">{{ card.title }}</div>
          <div class="stat-value">{{ card.value }}</div>
        </div>
      </section>
      <!-- 2. 图表区 -->
      <section class="charts">
        <div class="chart-container">
          <div class="chart-large" ref="chartLargeRef"></div>
          <!-- 折线图容器 -->
          <div class="chart-small" ref="chartSmallRef"></div>
          <!-- 饼图容器 -->
        </div>
      </section>
      <!-- 3. 排行榜 -->
      <section class="rank">
        <h3>成绩排行榜（前 10 名）</h3>
        <el-table :data="rankList" stripe size="small">
          <el-table-column prop="student_name" label="姓名" />
          <el-table-column prop="avg_score" label="平均分" />
        </el-table>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
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

const route = useRoute()
const isCollapsed = ref(false)

import { getDashboardStats, getScoreTrend, getPassRate, getRankList } from '@/api/analytics'
import type { DashboardStats, ScoreTrendItem, PassRateItem, RankItem } from '@/api/analytics'

interface StatCard {
  title: string
  value: number
}
const stats = ref<StatCard[]>([
  { title: '总学生数', value: 0 },
  { title: '总课程数', value: 0 },
  { title: '总班级数', value: 0 },
  { title: '平均成绩', value: 0 },
])

const scoreTrendOptions = shallowRef({}) // 浅层响应式
const passRateOptions = shallowRef({})
const rankList = ref<RankItem[]>([])

// 使用 ECharts 实例类型
const chartLargeRef = ref<echarts.ECharts | null>(null)
const chartSmallRef = ref<echarts.ECharts | null>(null)

onMounted(async () => {
  const statRes: DashboardStats = await getDashboardStats()
  stats.value = [
    { title: '总学生数', value: statRes.students },
    { title: '总课程数', value: statRes.courses },
    { title: '总班级数', value: statRes.classes },
    { title: '平均成绩', value: Number(statRes.avgScore.toFixed(1)) },
  ]

  const trend: ScoreTrendItem[] = await getScoreTrend()
  console.log('拿到趋势数据：', trend)

  scoreTrendOptions.value = {
    title: { text: '月度平均成绩趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['平均成绩'], top: 30, left: 'center' },
    xAxis: { type: 'category', data: trend.map((t) => t.month) },
    yAxis: { type: 'value' },
    series: [
      {
        name: '平均成绩',
        type: 'line',
        data: trend.map((t) => t.avg),
        smooth: true,
      },
    ],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  }

  const pass: PassRateItem[] = await getPassRate()
  console.log('拿到通过率数据：', pass)

  passRateOptions.value = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, left: 'center' },
    series: [
      {
        name: '通过率',
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { name: '数学', value: 85 },
          { name: '语文', value: 90 },
          { name: '英语', value: 75 },
        ],
      },
    ],
  }

  rankList.value = (await getRankList()).slice(0, 10)
  console.log('scoreTrendOptions:', scoreTrendOptions.value)
  console.log('passRateOptions:', passRateOptions.value)

  nextTick(() => {
    if (chartLargeRef.value) {
      const chartLargeInstance = echarts.init(chartLargeRef.value as HTMLElement)
      chartLargeInstance.setOption(scoreTrendOptions.value)
      chartLargeInstance.resize()
    }

    if (chartSmallRef.value) {
      const chartSmallInstance = echarts.init(chartSmallRef.value as HTMLElement)
      chartSmallInstance.setOption(passRateOptions.value)
      chartSmallInstance.resize()
    }
  })
})
</script>

<style scoped>
.layout {
  display: flex;
  height: 100%;
  overflow: hidden; /* 触发BFC布局计算 */
}

.sidebar {
  width: 200px;
  transition: width 0.2s;
  background: #fff;
  border-right: 1px solid #ebeef5;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 64px;
}

.main-content {
  flex: 1; /* 使其占据剩余空间 */
  background: #f5f7fa;
  overflow-y: auto;
  padding: 24px;
  width: 100%; /* 确保它的宽度占满 */
  min-height: 0;
}

/* 1. 统计卡片 */
.stats {
  display: flex;
  justify-content: space-between; /* 使卡片水平排列 */
  flex-wrap: wrap; /* 允许卡片换行 */
  gap: 20px;
  margin-bottom: 32px;
}

.stat-item {
  background: #fff;
  border-radius: 12px;
  padding: 24px; /* 增加内边距使卡片内容更加分明 */
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  width: 100%; /* 默认100%的宽度 */
  max-width: 200px; /* 限制每个卡片的最大宽度 */
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-title {
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #409eff; /* 卡片中的数字颜色 */
}

/* 图表区 */
.charts {
  display: flex;
  gap: 20px; /* 增加图表间距 */
  justify-content: space-between; /* 保证图表间有足够的空间 */
  margin-bottom: 32px;
  width: 100%; /* 保证图表区的宽度占满 */
}

/* 折线图 */
.chart-large {
  background: rgb(248, 245, 245);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex: 2; /* 折线图占较大的空间 */
  height: 360px;
  min-width: 320px; /* 设置最小宽度 */
  width: 100%;
  position: relative;
}

/* 饼图 */
.chart-small {
  background: rgb(248, 245, 245);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  flex: 1; /* 饼图占较小空间 */
  height: 360px;
  min-width: 320px; /* 设置最小宽度 */
  width: 100%;
  position: relative;
}

.chart-container {
  display: flex; /* 使用 flexbox 来排列图表 */
  gap: 20px; /* 图表之间的间距 */
  justify-content: space-between; /* 保证图表左右对齐 */
  flex-wrap: wrap; /* 在容器宽度不足时换行 */
}

.rank {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.rank h3 {
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}

:deep(.el-table th),
:deep(.el-table td) {
  padding: 12px 8px;
}

/* 响应式布局 */
@media (max-width: 992px) {
  .charts {
    grid-template-columns: 1fr;
  }

  .chart-container {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .stats {
    grid-template-columns: 1fr;
  }

  .stat-item {
    margin-bottom: 16px;
  }
}
</style>
