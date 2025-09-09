<template>
  <div>
    <h1>数据统计页面</h1>

    <!-- 班级平均成绩 -->
    <section>
      <h2>班级平均成绩</h2>
      <div v-if="classAvgData">
        <ul>
          <li v-for="item in classAvgData" :key="item.class_name">
            {{ item.class_name }}: {{ item.avg_score }}
          </li>
        </ul>
      </div>
    </section>

    <!-- 考试总次数 -->
    <section>
      <h2>考试总次数</h2>
      <div v-if="examCountData">
        <p>总考试次数: {{ examCountData.total }}</p>
      </div>
    </section>

    <!-- 月度平均成绩 -->
    <section>
      <h2>月度平均成绩趋势</h2>
      <div v-if="monthlyAvgData">
        <ul>
          <li v-for="item in monthlyAvgData" :key="item.month">{{ item.month }}: {{ item.avg }}</li>
        </ul>
      </div>
    </section>

    <!-- 课程通过率 -->
    <section>
      <h2>课程通过率</h2>
      <div v-if="passRateData">
        <ul>
          <li v-for="item in passRateData" :key="item.course_name">
            {{ item.course_name }}: {{ item.rate }}%
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script>
// import { getClassAvg, getExamCount, getMonthlyAvg, getPassRate } from '@/api/analytics'

// export default {
//   data() {
//     return {
//       classAvgData: null,
//       examCountData: null,
//       monthlyAvgData: null,
//       passRateData: null,
//     }
//   },
//   mounted() {
//     this.fetchClassAvg()
//     this.fetchExamCount()
//     this.fetchMonthlyAvg()
//     this.fetchPassRate()
//   },
//   methods: {
//     fetchClassAvg() {
//       getClassAvg().then((data) => {
//         this.classAvgData = data
//       })
//     },
//     fetchExamCount() {
//       getExamCount().then((data) => {
//         this.examCountData = data
//       })
//     },
//     fetchMonthlyAvg() {
//       getMonthlyAvg().then((data) => {
//         this.monthlyAvgData = data
//       })
//     },
//     fetchPassRate() {
//       getPassRate().then((data) => {
//         this.passRateData = data
//       })
//     },
//   },
// }
</script>
