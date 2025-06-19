<template>
  <div class="analysis-view">
    <!-- 卡片布局，显示前五个默认选项 -->
    <el-card class="option-card">
      <div class="option-header">
        <span>选择图表</span>
        <el-button @click="toggleTransfer" size="small" type="primary">更新选项</el-button>
      </div>
      <el-row :gutter="20">
        <el-col :span="4" v-for="(view, index) in displayedCharts" :key="view.id">
          <el-card>
            <h3>{{ view.meta[0]?.Value || '无标题' }}</h3>
            <!-- 使用安全操作符检查 view.meta -->
            <p>{{ view.type }}</p>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 穿梭框组件，悬浮显示 -->
    <el-transfer
      v-model="selectedCharts"
      :titles="['所有图表', '选中图表']"
      :data="chartOptions"
      filterable
      :keys="{ label: 'meta.title', value: 'id' }"
      :limit="5"
      v-if="isTransferVisible"
      @change="handleChange"
      class="transfer-dialog"
      style="margin-bottom: 20px"
    ></el-transfer>

    <!-- 使用 Tabs 来切换不同的图表 -->
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane
        v-for="(view, index) in selectedCharts"
        :label="view.meta[0]?.Value || '无标题'"
        :name="view.id"
      >
        <ChartDisplay
          v-if="view.chartData"
          :chartId="'chart_' + view.id"
          :chartData="view.chartData"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import ChartDisplay from '@/components/ChartDisplay.vue'
import { getChartOptions, getChartData } from '@/api/analysisApi'

export default {
  components: {
    ChartDisplay,
  },
  data() {
    return {
      selectedCharts: [],
      chartOptions: [],
      activeTab: '',
      isTransferVisible: false, // 控制穿梭框的显示与隐藏，初始值为 false
      displayedCharts: [], // 用来展示当前显示的图表选项
    }
  },
  mounted() {
    this.loadChartOptions()
  },
  methods: {
    // 加载图表选项
    async loadChartOptions() {
      try {
        const response = await getChartOptions()
        console.log('Chart options:', response.data) // 打印图表选项

        if (response.data && response.data.data && response.data.data.length > 0) {
          this.chartOptions = response.data.data // 使用返回的数据
          this.displayedCharts = this.chartOptions.slice(0, 5) // 默认显示前五个图表
          this.selectedCharts = [this.chartOptions[0]]
          this.activeTab = this.chartOptions[0].id
          this.loadChartData(this.chartOptions[0])

          console.log('displayedCharts:', this.displayedCharts) // 确认数据赋值后正确
        } else {
          console.warn('没有返回任何图表选项')
        }
      } catch (error) {
        console.error('加载图表选项失败', error)
      }
    },
    // 加载图表数据
    async loadChartData(view) {
      if (!view || !view.id || !view.data_source_type) {
        console.warn('无效的图表 ID 或 数据源类型')
        return
      }

      try {
        const response = await getChartData(view.id, view.type, view.data_source_type)
        console.log('后端返回的数据:', response.data) // 打印数据
        console.log('数据类型:', Array.isArray(response.data)) // 确认是否为数组
        // console.log('响应数据:', response.data); // 打印完整的响应数据
        // console.log('data 数组:', response.data.data); // 打印 data 数组
        if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          const chartData = response.data.data[0] // 获取第一个图表数据

          console.log('chartData:', chartData) // 打印chartData，确认它是否有效

          if (chartData) {
            const xAxis = chartData.x || []
            const yAxis = chartData.y || []

            // 确保 x 和 y 数据不为空
            if (xAxis.length === 0 || yAxis.length === 0) {
              console.warn('没有有效的 x 或 y 数据')
              return
            }

            // 设置图表数据
            view.chartData = {
              title: chartData.meta?.[0]?.Value || '无标题', // 设置标题
              xAxis: xAxis, // 设置 x 轴数据
              series: [
                {
                  data: yAxis, // 设置 y 轴数据
                  type: chartData.type || 'line', // 默认为折线图
                },
              ],
            }

            console.log('chartData 已赋值:', view.chartData) // 打印已赋值的chartData
          }
        } else {
          console.warn('返回的数据格式不正确或为空')
        }
      } catch (error) {
        console.error(`加载图表数据失败: ${view.meta?.[0]?.Value}`, error)
      }
    },
    // 处理穿梭框选项改变
    handleChange(newSelected) {
      if (newSelected.length > 0 && newSelected[0]) {
        // 确保 newSelected 中有有效的选项
        this.activeTab = newSelected[0].id
        this.loadChartData(newSelected[0])
      }
    },

    // 切换穿梭框显示状态
    toggleTransfer() {
      console.log('Toggling transfer visibility', this.isTransferVisible) // 添加调试日志
      this.isTransferVisible = !this.isTransferVisible
    },
  },
}
</script>

<style scoped>
.analysis-view {
  padding: 20px;
}

.option-card {
  margin-bottom: 20px;
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.el-row {
  margin-top: 10px;
}

/* 穿梭框的悬浮样式 */
.transfer-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 99999;
  /* 提高 z-index 以确保穿梭框在最上层 */
  width: 80%;
  /* 可以根据需要调整宽度 */
  max-width: 800px;
  /* 限制最大宽度 */
  background: white;
  /* 设置背景色 */
  border-radius: 10px;
  padding: 20px;
}
</style>
