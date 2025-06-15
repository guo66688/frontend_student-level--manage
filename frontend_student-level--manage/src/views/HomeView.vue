<!-- src/views/HomeView.vue -->
<template>
  <el-skeleton :loading="isLoading" animated>
    <template #default>
      <!-- 原 main-content 的 section 内容全都放进来 -->
      <div class="main-content">
        <!-- 1. 统计卡片 -->
        <section class="stats">
          <div v-for="card in stats" :key="card.title" class="stat-item">
            <!-- <div class="stat-icon"> -->
            <!-- 这里可以替换为你自己的图标 -->
            <!-- <i :class="card.icon"></i> 
        </div> -->
            <div class="stat-title">{{ card.title }}</div>
            <div class="stat-value">
              {{ card.title.includes('及格率') ? card.value + '%' : card.value }}
            </div>
          </div>
        </section>

        <!-- 2. 图表区 -->
        <section class="charts">
          <div class="chart-container">
            <!-- 折线图容器 -->
            <div class="chart-large" ref="chartLargeRef"></div>
            <!-- 饼图容器 -->
            <div class="chart-small" ref="chartSmallRef"></div>
            <!-- 3. 新图表：班级平均成绩柱状图 -->
            <div class="chart-small" ref="classAvgRef"></div>
          </div>
        </section>

        <!-- 3. 排行榜 -->
        <section class="rank">
          <h3>成绩排行榜（前 10 名）</h3>
          <el-table :data="rankList" stripe size="small">
            <el-table-column label="姓名">
              <template #default="{ row }">
                <i class="el-icon-user" style="margin-right: 4px; color: #409eff" />
                {{ row.student_name }}
              </template>
            </el-table-column>
            <el-table-column prop="avg_score" label="平均分" />
          </el-table>
        </section>
      </div>
    </template>
  </el-skeleton>
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
import { watch } from 'vue'

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

import {
  getDashboardStats,
  getScoreTrend,
  getPassRate,
  getRankList,
  getExamCount,
} from '@/api/analytics'
import type { DashboardStats, ScoreTrendItem, PassRateItem, RankItem } from '@/api/analytics'
import { getClassAvg, type ClassAvgItem } from '@/api/analytics'
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
// const stats = ref<StatCard[]>([
//   { title: '总学生数', value: 0, icon: 'el-icon-user' },  // 这里添加了 icon 字段
//   { title: '总课程数', value: 0, icon: 'el-icon-book' },
//   { title: '总班级数', value: 0, icon: 'el-icon-school' },
//   { title: '平均成绩', value: 0, icon: 'el-icon-pie-chart' }
// ])

const isLoading = ref(true)

const scoreTrendOptions = shallowRef({}) // 浅层响应式
const passRateOptions = shallowRef({})
const rankList = ref<RankItem[]>([])

const chartLargeRef = ref<HTMLElement | null>(null)
const chartSmallRef = ref<HTMLElement | null>(null)

const classAvgRef = ref<HTMLElement | null>(null)
const classAvgOptions = shallowRef({})

onMounted(async () => {
  // 获取课程通过率
  const examRes = await getExamCount()
  const pass: PassRateItem[] = await getPassRate()
  const statRes: DashboardStats = await getDashboardStats()
  isLoading.value = true
  try {
    const avgPassRate =
      pass.length === 0
        ? 0
        : Number((pass.reduce((sum, item) => sum + item.rate, 0) / pass.length).toFixed(1))

    stats.value.push({ title: '考试总次数', value: examRes.total })
    stats.value = [
      { title: '总学生数', value: statRes.students },
      { title: '总课程数', value: statRes.courses },
      { title: '总班级数', value: statRes.classes },
      { title: '平均成绩', value: Number(statRes.avgScore.toFixed(1)) },
      { title: '及格率（全校）', value: avgPassRate }, // ⬅️ 新增项
      { title: '考试总次数', value: examRes.total },
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

    const classAvg: ClassAvgItem[] = await getClassAvg()
    classAvgOptions.value = {
      title: {
        text: '班级平均成绩对比',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: classAvg.map((item) => item.class_name),
        axisLabel: { rotate: 30 },
      },
      yAxis: {
        type: 'value',
        name: '平均分',
        min: 0,
        max: 100,
      },
      series: [
        {
          type: 'bar',
          data: classAvg.map((item) => item.avg_score),
          barWidth: '50%',
          label: {
            show: true,
            position: 'top',
            formatter: '{c} 分',
          },
        },
      ],
    }

    rankList.value = (await getRankList()).slice(0, 10)

    watch(isLoading, (val) => {
      if (!val) {
        nextTick(() => {
          const largeEl = chartLargeRef.value
          if (largeEl) {
            echarts.getInstanceByDom(largeEl)?.dispose()
            const chartLargeInstance = echarts.init(largeEl)
            chartLargeInstance.setOption(scoreTrendOptions.value)
            chartLargeInstance.resize()
            largeEl.style.opacity = '0'
            largeEl.style.transform = 'scale(0.8)'
            setTimeout(() => {
              largeEl.style.opacity = '1'
              largeEl.style.transform = 'scale(1)'
            }, 100)
          }

          const smallEl = chartSmallRef.value
          if (smallEl) {
            echarts.getInstanceByDom(smallEl)?.dispose()
            const chartSmallInstance = echarts.init(smallEl)
            chartSmallInstance.setOption(passRateOptions.value)
            chartSmallInstance.resize()
            smallEl.style.opacity = '0'
            smallEl.style.transform = 'scale(0.8)'
            setTimeout(() => {
              smallEl.style.opacity = '1'
              smallEl.style.transform = 'scale(1)'
            }, 100)
          }
          const classAvgEl = classAvgRef.value
          if (classAvgEl) {
            echarts.getInstanceByDom(classAvgEl)?.dispose()
            const chartInstance = echarts.init(classAvgEl)
            chartInstance.setOption(classAvgOptions.value)
            chartInstance.resize()
            classAvgEl.style.opacity = '0'
            classAvgEl.style.transform = 'scale(0.8)'
            setTimeout(() => {
              classAvgEl.style.opacity = '1'
              classAvgEl.style.transform = 'scale(1)'
            }, 100)
          }
        })
      }
    })
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.main-content {
  flex: 1;
  background: #f5f7fa;
  padding: 15px;
  overflow-y: auto;
}

/* 统计卡片容器 */
.stats {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;
  flex-wrap: wrap; /* 统计卡片可以换行 */
}

/* 每个统计卡片 */
.stat-item {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s; /* 添加过渡效果 */
  width: 100%;
  max-width: 200px;
  flex: 1 1 calc(33% - 20px); /* 在大屏上三列排列 */
  cursor: pointer; /* 添加点击指针 */
}

.stat-item:hover {
  transform: translateY(-4px); /* 悬停时的位移效果 */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1); /* 增加阴影 */
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
  width: 100%;
  flex-wrap: wrap; /* 图表区域可以换行 */
}
/* 图表区域容器 */
.chart-container {
  display: flex; /* 使用flex布局 */
  gap: 20px; /* 图表之间的间距 */
  justify-content: space-between; /* 确保图表占满可用空间 */
  width: 100%; /* 确保容器占满父容器 */
  flex-wrap: wrap; /* 让元素在空间不足时换行 */
  box-sizing: border-box;
}

/* 图表容器（大图和小图） */
.chart-large,
.chart-small {
  background: rgb(248, 245, 245);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 360px;
  min-width: 0;
  flex: 1 1 calc(32%); /* 每张图占三分之一 */
  transition:
    transform 0.3s ease,
    opacity 0.5s ease;
  opacity: 0;
  transform: scale(0.8);
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
:deep(.el-table__body tr:nth-child(odd)) {
  background-color: #f9f9f9;
}
:deep(.el-table__body tr:hover) {
  background-color: #e6f7ff;
  cursor: pointer;
}

/* 小屏幕时图表纵向排列 */
@media (max-width: 992px) {
  .chart-container {
    flex-direction: column; /* 让图表在小屏幕上纵向排列 */
  }

  .chart-large,
  .chart-small {
    min-width: 100%; /* 确保图表占满宽度 */
    flex: 1 1 100%; /* 在小屏幕下每个图表占满一行 */
  }
}

@media (max-width: 768px) {
  .stats {
    flex-direction: column; /* 让统计卡片在小屏幕上纵向排列 */
  }

  .stat-item {
    margin-bottom: 16px; /* 增加卡片之间的间距 */
  }
}
</style>
