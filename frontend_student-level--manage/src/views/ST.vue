<template>
  <div>
    <h1>数据统计页面</h1>

    <!-- 总考试次数 -->
    <section>
      <h2>考试总次数</h2>
      <el-card class="stat-card" v-if="examCountData">
        <h3>总考试次数</h3>
        <p>
          <strong>{{ examCountData.total }} 次</strong>
        </p>
      </el-card>
      <p v-else>加载中...</p>
      <!-- 加载数据时的提示 -->
    </section>

    <!-- 其他部分的展示 -->
    <!-- 班级平均成绩 -->
    <section>
      <h2>班级平均成绩</h2>
      <el-table :data="classAvgData" style="width: 100%">
        <el-table-column prop="class_name" label="班级名称"></el-table-column>
        <el-table-column prop="avg_score" label="平均成绩"></el-table-column>
      </el-table>
    </section>

    <!-- 月度平均成绩 -->
    <section>
      <h2>月度平均成绩趋势</h2>
      <el-table :data="monthlyAvgData" style="width: 100%">
        <el-table-column prop="month" label="月份"></el-table-column>
        <el-table-column prop="avg" label="平均成绩"></el-table-column>
      </el-table>
    </section>

    <!-- 课程通过率 -->
    <section>
      <h2>课程通过率</h2>
      <el-table :data="passRateData" style="width: 100%">
        <el-table-column prop="course_name" label="课程名称"></el-table-column>
        <el-table-column prop="rate" label="通过率"></el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script>
import { getClassAvg, getExamCount, getScoreTrend, getPassRate } from '@/api/analytics'

export default {
  data() {
    return {
      classAvgData: null,
      examCountData: null,
      monthlyAvgData: null,
      passRateData: null,
    }
  },
  mounted() {
    this.fetchClassAvg()
    this.fetchExamCount()
    this.fetchMonthlyAvg()
    this.fetchPassRate()
  },
  methods: {
    fetchClassAvg() {
      getClassAvg().then((data) => {
        this.classAvgData = data
      })
    },
    fetchExamCount() {
      getExamCount()
        .then((data) => {
          // 确保数据返回正确并提供默认值
          this.examCountData = data || { total: 0 }
        })
        .catch(() => {
          // 如果接口请求失败，给默认值
          this.examCountData = { total: 0 }
        })
    },
    fetchMonthlyAvg() {
      getScoreTrend().then((data) => {
        this.monthlyAvgData = data
      })
    },
    fetchPassRate() {
      getPassRate().then((data) => {
        this.passRateData = data
      })
    },
  },
}
</script>

<style scoped>
.stat-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-align: center;
}

.stat-card h3 {
  font-size: 16px;
  color: #333;
}

.stat-card p {
  font-size: 18px;
  color: #666;
}

.el-table {
  margin-top: 20px;
  border: 1px solid #ddd;
}
</style>
