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
        <div class="chart-large">
          <v-chart :options="scoreTrendOptions" autoresize />
        </div>
        <div class="chart-small">
          <v-chart :options="passRateOptions" autoresize />
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
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

const scoreTrendOptions = ref({})
const passRateOptions = ref({})
const rankList = ref<RankItem[]>([])

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
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: trend.map((t) => t.month) },
    yAxis: { type: 'value' },
    series: [{ name: '平均成绩', type: 'line', data: trend.map((t) => t.avg), smooth: true }],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  }

  const pass: PassRateItem[] = await getPassRate()
  passRateOptions.value = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, left: 'center' },
    series: [
      {
        name: '通过率',
        type: 'pie',
        radius: ['40%', '70%'],
        data: pass.map((p) => ({ name: p.course, value: Number((p.rate * 100).toFixed(1)) })),
      },
    ],
  }

  rankList.value = (await getRankList()).slice(0, 10)
})
</script>

<style scoped>
.layout {
  display: flex;
  height: 100%;
}

/* 侧栏：正常流占位；collapsed 类控制宽度 */
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
.collapse-btn {
  text-align: center;
  padding: 12px 0;
}

/* 主区：flex:1 占满剩余宽度，自动紧贴侧栏 */
.main-content {
  flex: 1;
  background: #f5f7fa;
  overflow-y: auto;
  padding: 24px;
}

/* 内容板块都 100% 宽 */
.stats,
.charts,
.rank {
  width: 100%;
}

/* 1. 统计卡片 */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}
.stat-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
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

/* 2. 图表区 */
.charts {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 32px;
}
.chart-large,
.chart-small {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;
  height: 360px;
}
.chart-large:hover,
.chart-small:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

/* 3. 排行榜 */
.rank {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;
}
.rank:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}
.rank h3 {
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}

/* 表格内边距微调 */
:deep(.el-table th),
:deep(.el-table td) {
  padding: 12px 8px;
}

/* 响应式 */
@media (max-width: 992px) {
  .charts {
    grid-template-columns: 1fr;
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
