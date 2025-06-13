<!-- src/views/HomeView.vue -->
<template>
  <div class="main-content">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef, nextTick } from 'vue'
// import { useRoute } from 'vue-router'
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

// const route = useRoute()
// const isCollapsed = ref(false)

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

const chartLargeRef = ref<HTMLElement | null>(null)
const chartSmallRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  const statRes: DashboardStats = await getDashboardStats()
  stats.value = [
    { title: '总学生数', value: statRes.students },
    { title: '总课程数', value: statRes.courses },
    { title: '总班级数', value: statRes.classes },
    { title: '平均成绩', value: Number(statRes.avgScore.toFixed(1)) },
  ]

  const trend: ScoreTrendItem[] = await getScoreTrend()
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

  // 获取课程通过率
  const pass: PassRateItem[] = await getPassRate()

  // 动态更新饼图配置
  passRateOptions.value = {
    tooltip: { trigger: 'item' },
    legend: {
      bottom: 0,
      left: 'center',
      orient: 'horizontal', // 图例水平排列
      itemWidth: 30, // 每个图例项的宽度
      itemHeight: 10, // 每个图例项的高度
      textStyle: {
        fontSize: 12,
      },
    },
    series: [
      {
        name: '通过率',
        type: 'pie',
        radius: ['40%', '70%'],
        data: pass.map((item) => ({
          name: `课程 ${item.course_id}`,
          value: item.rate,
        })),
        label: {
          show: true,
          position: 'outside', // 标签显示在外部
          formatter: '{b}', // 只显示课程名称
          textStyle: {
            fontSize: 12, // 调整文字大小
            fontWeight: 'bold',
          },
          distance: 10, // 设置标签距离图形的距离
          overflow: 'truncate', // 防止标签超出
        },
        labelLine: {
          show: true, // 显示指向标签的线
          length: 15, // 增加指向线的长度
        },
        minAngle: 10, // 确保小区块的标签也能显示
      },
    ],
  }

  rankList.value = (await getRankList()).slice(0, 10)

  nextTick(() => {
    // 确保图表容器存在后再初始化图表
    if (chartLargeRef.value) {
      const chartLargeInstance = echarts.init(chartLargeRef.value)
      chartLargeInstance.setOption(scoreTrendOptions.value)
      chartLargeInstance.resize()
    }

    if (chartSmallRef.value) {
      const chartSmallInstance = echarts.init(chartSmallRef.value)
      chartSmallInstance.setOption(passRateOptions.value)
      chartSmallInstance.resize()
    }
  })
})
</script>

<style scoped>
.main-content {
  flex: 1;
  background: #f5f7fa;
  padding: 24px;
  overflow-y: auto;
}

.stats {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;
}

.stat-item {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  width: 100%;
  max-width: 220px;
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
  color: #409eff;
}

.charts {
  display: flex; /* 使用flex布局 */
  gap: 20px; /* 图表之间的间距 */
  justify-content: space-between; /* 确保图表占满可用空间 */
  margin-bottom: 32px;
  width: 100%; /* 保证图表区的宽度占满 */
  flex-wrap: wrap; /* 让元素在空间不足时换行 */
}

.chart-container {
  display: flex; /* 使用flex布局 */
  gap: 20px; /* 图表之间的间距 */
  justify-content: space-between; /* 确保图表占满可用空间 */
  width: 100%; /* 确保容器占满父容器 */
  flex-wrap: wrap; /* 让元素在空间不足时换行 */
}

.chart-large,
.chart-small {
  background: rgb(248, 245, 245);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 360px; /* 设置固定高度 */
  min-width: 395px; /* 设置最小宽度，保证图表不被压缩 */
  /* width: 48%; 让两个图表占据父容器的一半宽度 */
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

@media (max-width: 992px) {
  .charts {
    flex-direction: column; /* 让图表在小屏幕上纵向排列 */
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
