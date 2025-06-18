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
            <h3>{{ view.meta.title }}</h3>
            <p>{{ view.meta.description }}</p>
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
        :label="view.meta.title"
        :key="view.id"
        :name="view.id"
      >
        <ChartDisplay :chartId="view.id" :chartData="view.chartData" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import ChartDisplay from '@/components/ChartDisplay.vue';
import { getChartOptions, getChartData } from '@/api/analysisApi';

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
    };
  },
  mounted() {
    this.loadChartOptions();
  },
  methods: {
    // 加载图表选项
    async loadChartOptions() {
      try {
        const response = await getChartOptions();
        console.log('Chart options:', response.data); // 打印图表选项
        this.chartOptions = response.data.data; // 使用返回的数据
        if (this.chartOptions.length > 0) {
          this.displayedCharts = this.chartOptions.slice(0, 5); // 默认显示前五个图表
          this.selectedCharts = [this.chartOptions[0]];
          this.activeTab = this.chartOptions[0].id;
          this.loadChartData(this.chartOptions[0]);
        } else {
          console.warn("没有返回任何图表选项");
        }
      } catch (error) {
        console.error("加载图表选项失败", error);
      }
    },

    // 加载图表数据
    async loadChartData(view) {
      if (!view || !view.id || !view.data_source_type) {
        console.warn('无效的图表 ID 或 数据源类型');
        return;
      }

      try {
        // 传递 view.id 作为查询参数
        const response = await getChartData(view.id, view.type, view.data_source_type);
        console.log(`加载图表数据: ${view.meta.title}`, response.data); // 打印返回的数据

        // 处理数据
        const chartData = response.data[0]; // 假设返回的是数组，取第一个图表数据

        // 解析 values 数据
        const xAxis = [];
        const yAxis = [];

        chartData.values.forEach(item => {
          const x = item.find(value => value.Key === 'x');
          const y = item.find(value => value.Key === 'y');

          if (x && y) {
            // 将字符串解析为数组
            const xValue = JSON.parse(x.Value);  // 解析 x 的值
            const yValue = JSON.parse(y.Value);  // 解析 y 的值

            xValue.forEach((xItem, index) => {
              xAxis.push(xItem);
              yAxis.push(yValue[index]);
            });
          }
        });

        console.log('xAxis:', xAxis, 'yAxis:', yAxis); // 打印解析后的 x 和 y 数据

        // 设置图表数据
        view.chartData = {
          title: chartData.meta.title || '无标题',
          xAxis: xAxis,
          series: [{
            data: yAxis,
            type: chartData.type || 'line',  // 默认图表类型为折线图
          }],
        };

      } catch (error) {
        console.error(`加载图表数据失败: ${view.meta.title}`, error);
      }
    },



    // 处理穿梭框选项改变
    handleChange(newSelected) {
      if (newSelected.length > 0 && newSelected[0]) { // 确保 newSelected 中有有效的选项
        this.activeTab = newSelected[0].id;
        this.loadChartData(newSelected[0]);
      }
    },

    // 切换穿梭框显示状态
    toggleTransfer() {
      console.log('Toggling transfer visibility', this.isTransferVisible); // 添加调试日志
      this.isTransferVisible = !this.isTransferVisible;
    }
  }
};
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
