<!-- src/components/ChartDisplay.vue -->
<template>
  <div :id="chartId" style="height: 400px"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  props: {
    chartId: { type: String, required: true }, // 图表的唯一ID
    chartData: { type: Object, required: true }, // 图表的数据，包括标题、X轴、Y轴、系列数据等
  },
  mounted() {
    console.log('chartData:', this.chartData) // 打印传递到组件的数据
    this.renderChart()
  },
  methods: {
    renderChart() {
      if (
        !this.chartData ||
        !this.chartData.title ||
        !this.chartData.xAxis ||
        !this.chartData.series
      ) {
        console.error('图表数据无效', this.chartData)
        return
      }

      const chart = echarts.init(document.getElementById(this.chartId))
      const options = {
        title: {
          text: this.chartData.title || '无标题',
        },
        xAxis: {
          type: 'category',
          data: this.chartData.xAxis || [],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: this.chartData.series[0]?.data || [], // 获取 series 中的 y 数据
            type: this.chartData.series[0]?.type || 'line', // 默认为折线图
          },
        ],
      }
      chart.setOption(options)
    },
  },
}
</script>
