<!-- src/components/ChartDisplay.vue -->
<template>
  <div :id="chartId" style="height: 400px;"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  props: {
    chartId: { type: String, required: true },  // 图表的唯一ID
    chartData: { type: Object, required: true }, // 图表的数据，包括标题、X轴、Y轴、系列数据等
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    renderChart() {
      const chart = echarts.init(document.getElementById(this.chartId));
      const options = {
        title: {
          text: this.chartData.title || '无标题'
        },
        xAxis: {
          type: 'category',
          data: this.chartData.xAxis || []  // X轴数据
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: this.chartData.series || [],  // Y轴数据
          type: this.chartData.type || 'line'  // 默认图表类型为折线图
        }]
      };
      chart.setOption(options);
    }
  }
};
</script>

<style scoped>
/* 可以根据需要为图表增加一些样式 */
</style>
