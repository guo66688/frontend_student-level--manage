<!-- src/views/HomeView.vue -->
<template>
  <!-- 使用加载圈 -->
  <el-loading :loading="isLoading" spinner custom-class="custom-loading">
    <div class="main-content">
      <!-- 1. 统计卡片 -->
      <section class="stats">
        <div v-for="card in stats" :key="card.title" class="stat-item">
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
  </el-loading>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
// import { ElLoading } from 'element-plus'
import { LineChart, PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { watch } from 'vue'
// import type { Ref } from 'vue' // 使用类型导入
use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  LineChart,
  PieChart,
  CanvasRenderer,
])

import {
  getDashboardStats,
  getScoreTrend,
  getPassRate,
  getRankList,
  getExamCount,
} from '@/api/analytics'
import type { DashboardStats, PassRateItem, RankItem } from '@/api/analytics'
import { getClassAvg } from '@/api/analytics' // 导入 API 函数
import type { ClassAvgItem } from '@/api/analytics' // 使用 `import type` 来导入类型

interface StatCard {
  title: string
  value: number
}

// 创建自定义类型，继承 HTMLDivElement 并添加 chartInstance 属性
interface ChartDivElement extends HTMLDivElement {
  chartInstance?: echarts.ECharts
}

const stats = ref<StatCard[]>([
  { title: '总学生数', value: 0 },
  { title: '总课程数', value: 0 },
  { title: '总班级数', value: 0 },
  { title: '平均成绩', value: 0 },
])

const getCssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

const theme = computed(() => (document.body.classList.contains('dark') ? 'dark' : 'light'))

const chartColors = computed(() => {
  if (theme.value === 'dark') {
    return {
      primary: '#4c6fff', // 固定颜色
      success: '#3cd278',
      warning: '#f6bd16',
      danger: '#f2637b',
      accent: '#00e3ff',
      text: '#e4e8f3',
      muted: '#9ea5c3',
      heading: '#f2f6ff',
      border: '#353b64',
      bg: '#25294d', // 固定背景色
    }
  }
  return {
    primary: getCssVar('--color-primary'),
    success: getCssVar('--color-success'),
    warning: getCssVar('--color-warning'),
    danger: getCssVar('--color-danger'),
    accent: getCssVar('--color-accent'),
    text: getCssVar('--color-text'),
    muted: getCssVar('--color-muted'),
    heading: getCssVar('--color-heading'),
    border: getCssVar('--color-border'),
    bg: getCssVar('--color-card'),
  }
})

const isLoading = ref(true) // 加载状态

const scoreTrendOptions = shallowRef({}) // 浅层响应式
const passRateOptions = shallowRef({})
const rankList = ref<RankItem[]>([])

const chartLargeRef = ref<ChartDivElement | null>(null) // 使用自定义类型
const chartSmallRef = ref<ChartDivElement | null>(null) // 使用自定义类型
const classAvgRef = ref<ChartDivElement | null>(null) // 使用自定义类型

const classAvgOptions = shallowRef({})
// const loading = ref<any>(null) // 用于存储 loading 实例
onMounted(async () => {
  // 获取课程通过率
  const examRes = await getExamCount()
  const pass: PassRateItem[] = await getPassRate()
  const statRes: DashboardStats = await getDashboardStats()
  isLoading.value = true
  const currentColors = chartColors.value

  try {
    // loading.value = ElLoading.service({
    //   text: '加载中...',
    //   background: 'rgba(255, 255, 255, 0.7)', // 只对内容区域遮罩
    // })
    rankList.value = (await getRankList()).slice(0, 10) // 获取前10名
    console.log('排行榜数据:', rankList.value) // 检查是否成功获取数据
    console.log('当前主题:', theme.value)

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

    // const trend: ScoreTrendItem[] = await getScoreTrend()
    scoreTrendOptions.value = {
      title: {
        text: '月度平均成绩趋势',
        left: 'center',
        textStyle: { color: currentColors.heading },
      },
      tooltip: { trigger: 'axis' },
      legend: {
        data: ['平均成绩'],
        top: 30,
        left: 'center',
        textStyle: { color: currentColors.text },
      },
      xAxis: {
        type: 'category',
        data: (await getScoreTrend()).map((t) => t.month),
        axisLine: { lineStyle: { color: currentColors.border } },
        axisLabel: { color: currentColors.text },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: currentColors.border } },
        splitLine: { lineStyle: { color: currentColors.border, type: 'dashed' } },
        axisLabel: { color: currentColors.text },
      },
      series: [
        {
          name: '平均成绩',
          type: 'line',
          data: (await getScoreTrend()).map((t) => t.avg),
          smooth: true,
          lineStyle: { color: currentColors.primary, width: 4 },
          itemStyle: {
            color: currentColors.primary,
            borderColor: currentColors.primary,
            borderWidth: 2,
          },
          label: { color: currentColors.text, show: true, position: 'top' },
        },
      ],
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      backgroundColor: currentColors.bg,
    }

    // 动态更新饼图配置
    passRateOptions.value = {
      tooltip: { trigger: 'item' },
      legend: {
        bottom: 0,
        left: 'center',
        orient: 'horizontal',
        itemWidth: 30,
        itemHeight: 10,
        textStyle: { fontSize: 12, color: currentColors.muted },
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
            position: 'outside',
            formatter: '{b}',
            textStyle: {
              fontSize: 12,
              fontWeight: 'bold',
              color: currentColors.text,
            },
            distance: 10,
          },
          labelLine: { show: true, length: 15, lineStyle: { color: currentColors.border } },
          minAngle: 10,
        },
      ],
      backgroundColor: currentColors.bg,
    }

    const classAvg: ClassAvgItem[] = await getClassAvg()
    // 配置班级平均成绩柱状图
    classAvgOptions.value = {
      title: {
        text: '班级平均成绩对比',
        left: 'center',
        textStyle: { color: currentColors.heading },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }, // 使用阴影指示器以增强用户体验
        textStyle: { color: currentColors.text },
      },
      xAxis: {
        type: 'category',
        data: classAvg.map((item) => item.class_name), // 正确引用 classAvg 数组
        axisLabel: {
          color: currentColors.text,
          rotate: 30, // 设置标签旋转角度
        },
        axisLine: { lineStyle: { color: currentColors.border } },
      },
      yAxis: {
        type: 'value',
        name: '平均分',
        min: 0,
        max: 100,
        axisLabel: { color: currentColors.text },
        axisLine: { lineStyle: { color: currentColors.border } },
        splitLine: { lineStyle: { color: currentColors.border, type: 'dashed' } },
      },
      series: [
        {
          name: '班级平均分',
          type: 'bar',
          data: classAvg.map((item) => item.avg_score), // 正确访问每个元素的 avg_score
          itemStyle: {
            color: currentColors.primary, // 设置柱状图的颜色
          },
          label: {
            show: true,
            position: 'top',
            color: currentColors.text, // 标签的颜色
          },
          barWidth: '50%', // 控制柱宽
        },
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true, // 确保标签和图表内容不被遮挡
      },
      backgroundColor: currentColors.bg,
    }

    rankList.value = rankList.value.map((row) => ({
      ...row,
      rowStyle: {
        backgroundColor: theme.value === 'dark' ? currentColors.bg : '#ffffff',
        color: theme.value === 'dark' ? currentColors.text : '#2c3e50',
      },
    }))

    watch(isLoading, (val) => {
      if (!val) {
        nextTick(() => {
          const largeEl = chartLargeRef.value as ChartDivElement // 强制转换为 ChartDivElement
          if (largeEl && !largeEl.chartInstance) {
            echarts.getInstanceByDom(largeEl)?.dispose() // 防止重新初始化
            const chartLargeInstance = echarts.init(largeEl)
            chartLargeInstance.setOption(scoreTrendOptions.value)
            chartLargeInstance.resize()
            largeEl.style.opacity = '0'
            largeEl.style.transform = 'scale(0.8)'
            setTimeout(() => {
              largeEl.style.opacity = '1'
              largeEl.style.transform = 'scale(1)'
            }, 100)
            largeEl.chartInstance = chartLargeInstance // 将 chartInstance 赋值到元素上
          }

          // 对于其他图表同理
          const smallEl = chartSmallRef.value as ChartDivElement // 强制转换为 ChartDivElement
          if (smallEl && !smallEl.chartInstance) {
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
            smallEl.chartInstance = chartSmallInstance
          }

          const classAvgEl = classAvgRef.value as ChartDivElement // 强制转换为 ChartDivElement
          if (classAvgEl && !classAvgEl.chartInstance) {
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
            classAvgEl.chartInstance = chartInstance
          }
          const tableElement = document.querySelector('.el-table') // 获取 el-table 元素
          if (tableElement && tableElement instanceof HTMLElement) {
            // 确保类型为 HTMLElement
            // 强制更新 el-table
            tableElement.style.display = 'none' // 隐藏表格
            tableElement.offsetHeight // 强制触发重新渲染
            tableElement.style.display = '' // 恢复显示
          }
        })
      }
    })
    // // 在数据加载完毕后，关闭加载圈并渲染内容
    // isLoading.value = false
    // loading.value.close() // 关闭加载圈
  } finally {
    isLoading.value = false
    // console.log('关闭加载圈...')
    // loading.value.close()
  }
})
</script>

<style scoped>
.main-content {
  flex: 1;
  background: var(--color-bg);
  padding: 15px;
  overflow-y: auto;
}

.el-loading-spinner {
  z-index: 9999; /* 提高 z-index 确保加载圈在最上层 */
  visibility: visible; /* 确保加载圈不会被隐藏 */
}

.custom-loading .el-loading-spinner {
  border-color: #4c6fff; /* 你可以设置颜色 */
}
/* 统计卡片容器 */
.stats {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

/* 每个统计卡片 */
.stat-item {
  background: var(--color-card);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  width: 100%;
  max-width: 200px;
  flex: 1 1 calc(33% - 20px);
  cursor: pointer;
  color: var(--color-text);
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-title {
  font-size: 14px;
  color: var(--color-muted);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-primary);
}

.charts {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 32px;
  width: 100%;
  flex-wrap: wrap;
}

.chart-container {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
  box-sizing: border-box;
}

.chart-large,
.chart-small {
  background: var(--color-card); /* 保持背景颜色 */
  border: 2px solid var(--color-border); /* 增加边框，提升对比 */
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); /* 深色阴影增加立体感 */
  height: 360px;
  min-width: 0;
  flex: 1 1 calc(32%);
  transition:
    transform 0.3s ease,
    opacity 0.5s ease;
  opacity: 0;
  transform: scale(0.8);
  color: var(--color-text); /* 确保字体颜色鲜明 */
}

.rank {
  background: var(--color-card);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  color: var(--color-text);
}

.rank h3 {
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-heading) !important;
}

/* 深层覆盖样式 */
::v-deep .el-table {
  background-color: var(--color-panel) !important; /* 面板背景颜色 */
  color: var(--color-text) !important; /* 默认文本颜色 */
  border-radius: 8px !important; /* 边框圆角 */
  border: 1px solid var(--color-border) !important; /* 表格边框颜色 */
}

::v-deep .el-table th {
  background-color: var(--color-card) !important; /* 表头背景色 */
  color: var(--color-text) !important; /* 表头文本颜色 */
  font-weight: bold !important; /* 表头字体加粗 */
}

::v-deep .el-table td {
  background-color: var(--color-card) !important; /* 单元格背景色 */
  color: inherit !important; /* 继承父级的文本颜色 */
}

/* 偶数行背景色 */
::v-deep .el-table__body tr:nth-child(odd) {
  background-color: var(--color-background-odd) !important;
}

/* 奇数行背景色 */
::v-deep .el-table__body tr:nth-child(even) {
  background-color: var(--color-background-even) !important;
}

/* 偶数行文本颜色 */
::v-deep .el-table__body tr:nth-child(odd) td {
  color: var(--color-muted) !important;
}

/* 奇数行文本颜色 */
::v-deep .el-table__body tr:nth-child(even) td {
  color: var(--color-text) !important;
}

/* 鼠标悬停行的背景色 */
::v-deep .el-table__body tr:hover {
  background-color: var(--color-hover) !important;
  cursor: pointer !important;
}

@media (max-width: 992px) {
  .chart-container {
    flex-direction: column;
  }

  .chart-large,
  .chart-small {
    min-width: 100%;
    flex: 1 1 100%;
  }
}

@media (max-width: 768px) {
  .stats {
    flex-direction: column;
  }

  .stat-item {
    margin-bottom: 16px;
  }
}
</style>
