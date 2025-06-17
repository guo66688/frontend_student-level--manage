<!-- src/views/RanksView.vue -->
<template>
  <div class="rankings-page">
    <div class="rankings-container">
      <h2>综合成绩排行榜</h2>
      <el-tabs type="border-card">
        <el-tab-pane label="学生平均成绩">
          <div class="rank-table-wrapper">
            <rank-table
              :columns="columnsStudent"
              :data="rankAvgStudent"
              searchable
              sortable
              paginated
            />
          </div>
        </el-tab-pane>
        <el-tab-pane label="课程平均分">
          <div class="rank-table-wrapper">
            <rank-table
              :columns="columnsCourse"
              :data="rankAvgCourse"
              searchable
              sortable
              paginated
            />
          </div>
        </el-tab-pane>
        <el-tab-pane label="班级平均分">
          <div class="rank-table-wrapper">
            <rank-table
              :columns="columnsClass"
              :data="rankAvgClass"
              searchable
              sortable
              paginated
            />
          </div>
        </el-tab-pane>
        <el-tab-pane label="课程通过率">
          <div class="rank-table-wrapper">
            <rank-table
              :columns="columnsPassRate"
              :data="rankPassRate"
              searchable
              sortable
              paginated
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAllRanks } from '@/api/ranks'
import RankTable from '../components/RankTable.vue'
import { toFixedColumn } from '@/utils/columns'

import type { Ref } from 'vue'

const rankAvgStudent: Ref<{ student_name: string; avg_score: number }[]> = ref([])
const rankAvgCourse: Ref<
  { course_name: string; avg_score: number; max_score: number; min_score: number }[]
> = ref([])
const rankAvgClass: Ref<{ class_name: string; avg_score: number }[]> = ref([])
const rankPassRate: Ref<{ course_name: string; rate: number }[]> = ref([])

const columnsStudent = [
  { label: '姓名', prop: 'student_name' },
  toFixedColumn('平均成绩', 'avg_score'),
]

const columnsCourse = [
  { label: '课程名称', prop: 'course_name' },
  toFixedColumn('平均分', 'avg_score'),
  toFixedColumn('最高分', 'max_score'),
  toFixedColumn('最低分', 'min_score'),
]

const columnsClass = [{ label: '班级', prop: 'class_name' }, toFixedColumn('平均成绩', 'avg_score')]

const columnsPassRate = [
  { label: '课程名称', prop: 'course_name' },
  toFixedColumn('通过率 (%)', 'rate'),
]

onMounted(async () => {
  const res = await getAllRanks()
  rankAvgStudent.value = res.student_avg
  rankAvgCourse.value = res.course_avg
  rankAvgClass.value = res.class_avg
  rankPassRate.value = res.pass_rate.sort((a, b) => b.rate - a.rate)
})
</script>

<style scoped>
.rankings-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.rankings-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: var(--color-card);
  color: var(--color-text);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 增加阴影 */
  border-radius: 10px; /* 圆角效果 */
  overflow: hidden;
}

.rank-table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

::v-deep .el-table th {
  background-color: var(--color-card) !important;
  color: var(--color-text) !important;
  font-weight: bold !important;
}

::v-deep .el-table td {
  background-color: var(--color-card) !important;
  color: inherit !important;
}

::v-deep .el-table__body tr:nth-child(odd) {
  background-color: var(--color-background-odd, #1d1d2f) !important;
}
::v-deep .el-table__body tr:nth-child(even) {
  background-color: var(--color-background-even, #232336) !important;
}

::v-deep .el-table__body tr:nth-child(odd) td {
  color: var(--color-muted, #a5adc0) !important;
}
::v-deep .el-table__body tr:nth-child(even) td {
  color: var(--color-text, #e4e8f3) !important;
}

::v-deep .el-table__body tr:hover td {
  background-color: var(--color-hover, #2e3454) !important;
  color: var(--color-text, #ffffff) !important;
}

::v-deep .el-pagination {
  justify-content: center;
  padding: 12px 0;
  /* background-color: var(--color-card); */
  border-radius: 10px;
  margin-top: 20px; /* 分页与表格之间添加间距 */
}

::v-deep .el-pagination button {
  background-color: var(--color-primary) !important;
  border: 1px solid var(--color-primary) !important;
  color: #ffffff !important;
  border-radius: 50%;
  padding: 8px 12px;
}

::v-deep .el-pagination button:hover {
  background-color: var(--color-hover) !important;
  border-color: var(--color-hover) !important;
}

::v-deep .el-tabs__nav {
  /* background-color: var(--color-card); */
  padding: 10px 0;
  /* border-bottom: 2px solid var(--color-card); */
}

::v-deep .el-tabs__item {
  font-size: 14px;
  color: var(--color-text);
}

::v-deep .el-tabs__item.is-active {
  color: var(--color-primary);
  font-weight: bold;
}

</style>
