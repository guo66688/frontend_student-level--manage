<!-- src/views/RanksView.vue -->
<template>
  <div class="rankings-page">
    <div class="rankings-container">
      <h2>综合成绩排行榜</h2>
      <el-tabs type="border-card">
        <!-- 学生平均成绩 -->
        <el-tab-pane label="学生平均成绩">
          <div class="rank-table-wrapper">
            <rank-table
              :columns="columnsStudent"
              :data="rankAvgStudent"
              searchable
              sortable
              paginated
              :filters="[
                { prop: 'student_name', placeholder: '搜索学生姓名' },
                { prop: 'avg_score', placeholder: '搜索平均成绩' },
              ]"
            />
          </div>
        </el-tab-pane>

        <!-- 课程平均分 -->
        <el-tab-pane label="课程平均分">
          <div class="rank-table-wrapper">
            <rank-table
              :columns="columnsCourse"
              :data="rankAvgCourse"
              searchable
              sortable
              paginated
              :filters="[
                { prop: 'course_name', placeholder: '搜索课程名称' },
                { prop: 'avg_score', placeholder: '搜索平均分' },
              ]"
            />
          </div>
        </el-tab-pane>

        <!-- 班级平均分 -->
        <el-tab-pane label="班级平均分">
          <div class="rank-table-wrapper">
            <rank-table
              :columns="columnsClass"
              :data="rankAvgClass"
              searchable
              sortable
              paginated
              :filters="[
                { prop: 'class_name', placeholder: '搜索班级名称' },
                { prop: 'avg_score', placeholder: '搜索平均成绩' },
              ]"
            />
          </div>
        </el-tab-pane>

        <!-- 课程通过率 -->
        <el-tab-pane label="课程通过率">
          <div class="rank-table-wrapper">
            <rank-table
              :columns="columnsPassRate"
              :data="rankPassRate"
              searchable
              sortable
              paginated
              :filters="[
                { prop: 'course_name', placeholder: '搜索课程名称' },
                { prop: 'pass_rate_str', placeholder: '搜索通过率 (%)' },
              ]"
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
  /* background-color: var(--color-card) !important; */
  min-height: 0;
  overflow: hidden;
}

::v-deep .el-table {
  border-radius: 10px;
  overflow: hidden; /* 避免内容溢出 */
}
::v-deep .el-table th {
  background-color: var(--color-card) !important;
  color: var(--color-text) !important;
  text-align: center;
  padding: 12px 15px;
  font-weight: bold !important;
}

::v-deep .el-table td {
  background-color: var(--color-card) !important;
  color: inherit !important;
}

::v-deep .el-table__body tr:nth-child(odd) {
  background-color: var(--color-background-odd) !important;
}
::v-deep .el-table__body tr:nth-child(even) {
  background-color: var(--color-background-even) !important;
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

::v-deep .el-pagination {
  display: flex;
  align-items: center;
  justify-content: center; /* 新增这行：水平居中 */
  margin: 16px 0;
  font-size: 14px;
}

::v-deep .el-pagination .el-pager {
  margin: 0 8px;
  display: flex;
  padding: 0;
}

::v-deep .el-pagination .el-pager li {
  margin: 0 4px;
}

::v-deep .el-pagination .el-pager li button {
  display: flex; /* 改为 flex 布局 */
  align-items: center; /* 垂直居中内容 */
  justify-content: center; /* 水平居中内容 */
  width: 32px;
  height: 32px;
  line-height: 32px;
  padding: 0;
  border-radius: 50%;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid transparent;
  transition: all 0.2s;
}
/* 悬停（普通页码／prev/next） */
::v-deep .el-pagination .el-pager li button:hover,
::v-deep .el-pagination .btn--prev button:hover,
::v-deep .el-pagination .btn--next button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: #fff;
}

/* 当前页只亮边框＋文字 */
::v-deep .el-pagination .el-pager li.is-active button {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: #fff;
  font-weight: bold;
  /* 可选：加个微弱阴影 */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 当前页悬停 */
::v-deep .el-pagination .el-pager li.is-active button:hover {
  background-color: rgba(66, 133, 244, 0.25) !important;
}

/* 上一页/下一页按钮悬停 */
::v-deep .el-pagination .btn--prev button:hover,
::v-deep .el-pagination .btn--next button:hover {
  background-color: rgba(66, 133, 244, 0.1) !important;
  color: var(--color-primary) !important;
}

/* 禁用态 */
::v-deep .el-pagination .btn--prev.is-disabled button,
::v-deep .el-pagination .btn--next.is-disabled button {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 省略号 */
::v-deep .el-pagination .el-pager li.is-ellipsis button {
  background: transparent;
  color: #999;
  box-shadow: none;
  cursor: default;
}

/* 每页条数选择 */
::v-deep .el-pagination__sizes select {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  background-color: #fafafa;
  transition: border-color 0.2s;
}
::v-deep .el-pagination__sizes select:hover {
  border-color: var(--color-primary);
}
</style>
