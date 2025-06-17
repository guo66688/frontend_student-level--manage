<template>
  <div>
    <h2 class="scores-title">成绩管理</h2>

    <!-- 搜索框 -->
    <el-input
      v-model="searchQuery"
      placeholder="搜索学生姓名"
      class="scores-search"
      prefix-icon="el-icon-search"
      @keyup.enter="searchScores"
    />

    <el-input
      v-model="studentNoQuery"
      placeholder="学号"
      class="scores-search"
      prefix-icon="el-icon-search"
      @keyup.enter="searchScores"
    />
    <!-- 课程搜索框 -->
    <el-input
      v-model="courseQuery"
      placeholder="课程"
      class="scores-search"
      prefix-icon="el-icon-search"
      @keyup.enter="searchScores"
    />
    <!-- 新增成绩按钮 -->
    <el-button type="primary" @click="openAddDialog" class="add-score-button">
      新 增 成 绩
    </el-button>

    <div :class="['scores-header', theme]">
      <!-- 成绩列表 -->
      <el-table :data="scores" stripe>
        <el-table-column prop="student_no" label="学号" sortable align="center" />
        <el-table-column prop="student_name" label="姓名" sortable align="center" />
        <el-table-column prop="course_name" label="课程" align="center" />
        <el-table-column prop="score" label="成绩" align="center" />
        <el-table-column prop="exam_date" label="考试日期" align="center" />
        <!-- 显示操作按钮 -->
        <el-table-column label="操作" align="center">
          <template #default="{ row }: { row: Score }">
            <el-button size="small" @click="openEditDialog(row)" type="primary">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteScore(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件 -->
    <el-pagination
      v-bind:current-page="currentPage"
      :page-size="pageSize"
      :total="totalScores"
      @current-change="handlePageChange"
      layout="total, prev, pager, next, jumper"
      style="margin-top: 20px; text-align: center"
    />

    <el-dialog
      class="custom-dialog"
      :title="isEditing ? '编辑成绩' : '新增成绩'"
      v-model="dialogVisible"
      width="520px"
      :before-close="handleClose"
    >
      <el-form :model="form" :rules="formRules" ref="formRef">
        <el-form-item label="学号" prop="student_no">
          <el-input v-model="form.student_no" />
        </el-form-item>
        <el-form-item label="姓名" prop="student_name">
          <el-input v-model="form.student_name" />
          <!-- 修改为 student_name -->
        </el-form-item>
        <el-form-item label="课程" prop="course_name">
          <el-select v-model="form.course_id" placeholder="请选择课程">
            <el-option
              v-for="courseItem in courses"
              :key="courseItem.id"
              :label="courseItem.course_name"
              :value="courseItem.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="成绩" prop="score">
          <el-input v-model="form.score" type="number" />
        </el-form-item>
        <el-form-item label="考试日期" prop="exam_date">
          <el-date-picker v-model="form.exam_date" type="date" placeholder="请选择考试日期" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// import axios from 'axios'
import { ref, onMounted, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getScores, addScore, updateScore } from '@/api/scores'
import { deleteScore as apiDeleteScore } from '@/api/scores'
import type { Score } from '@/api/scores'
import type { Course } from '@/api/courses'
import type { FormInstance } from 'element-plus'
// import { getScores } from '@/api/scores'
// 明确声明 scores 的类型为 Score[]
const scores = ref<Score[]>([])
const courses = ref<Course[]>([])

const dialogVisible = ref(false)
const isEditing = ref(false)

const currentPage = ref(1) // 当前页
const pageSize = ref(10) // 每页条数
const totalScores = ref(0) // 成绩总数
const searchQuery = ref('') // 搜索框输入值
const studentNoQuery = ref('') // 学号查询
const courseQuery = ref('') // 课程查询

// form 表单验证规则
const formRules = reactive({
  student_no: [{ required: true, message: '学号不能为空', trigger: 'blur' }],
  student_name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }], // 修改为 student_name
  score: [{ required: true, message: '成绩不能为空', trigger: 'blur' }],
  course_name: [{ required: true, message: '课程不能为空', trigger: 'blur' }],
})

const theme = computed(() => {
  return document.body.classList.contains('dark') ? 'dark' : 'light'
})

const formRef = ref<FormInstance | null>(null)
const form = ref<Partial<Score>>({
  student_no: '',
  student_name: '', // 修改为 student_name
  score: 0,
  course_id: 0,
  exam_date: '',
})

// async function fetchCourses() {
//   try {
//     const res = await axios.get('/courses')
//     courses.value = res.data
//   } catch {
//     ElMessage.error('获取课程列表失败')
//   }
// }

async function fetchScores(page = 1, query = '', studentNo = '', courseName = '') {
  try {
    const res = await getScores(page, pageSize.value, query, studentNo, courseName)
    console.log('响应数据:', res) // 打印返回的数据
    console.log('总数:', res.total)
    // 确保响应数据包含 `data` 和 `total` 字段
    if (res && res.data && res.total !== undefined) {
      scores.value = res.data
      totalScores.value = res.total
    } else {
      throw new Error('返回的数据格式不正确')
    }
  } catch (error) {
    console.error('获取成绩列表失败', error)
    ElMessage.error('获取成绩列表失败')
  }
}

function searchScores() {
  fetchScores(currentPage.value, searchQuery.value, studentNoQuery.value, courseQuery.value)
}

const handleClose = () => {
  dialogVisible.value = false
}

function openAddDialog() {
  if (dialogVisible.value) return
  isEditing.value = false
  form.value = { student_no: '', student_name: '', score: 0, course_id: 0, exam_date: '' }
  dialogVisible.value = true
}

function openEditDialog(row: Score) {
  if (dialogVisible.value) return
  isEditing.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

async function submitForm() {
  try {
    // 校验表单
    if (formRef.value) {
      await formRef.value.validate() // 如果验证失败，会抛出异常，跳过后续代码
    }

    // 确保 form.value 是完整的 Score 类型
    const scoreData: Score = {
      id: isEditing.value && form.value.id != null ? form.value.id : 0, // 如果是编辑，保留 id，如果是新增，设置为 0
      student_no: form.value.student_no!,
      student_name: form.value.student_name!,
      course_id: form.value.course_id!,
      course_name: form.value.course_name!,
      score: form.value.score!,
      exam_date: form.value.exam_date!,
    }
    // 判断是新增还是编辑
    if (isEditing.value && form.value.id != null) {
      // 编辑模式，更新成绩
      await updateScore(form.value.id, scoreData)
      ElMessage.success('更新成功')
    } else if (!isEditing.value) {
      // 新增模式，添加成绩
      await addScore(scoreData)
      ElMessage.success('新增成功')
    } else {
      // 如果没有 id，抛出错误
      throw new Error('表单没有正确提交，缺少 id')
    }

    // 关闭弹窗
    dialogVisible.value = false

    // 刷新成绩列表
    await fetchScores(currentPage.value) // 使用 await 确保成绩刷新完成
  } catch (error) {
    const e = error as Error
    ElMessage.error(`操作失败: ${e.message}`)
  }
}

async function deleteScore(id: number) {
  try {
    await ElMessageBox.confirm('确认删除该成绩？', '警告', { type: 'warning' })
    await apiDeleteScore(id)
    ElMessage.success('删除成功')
    fetchScores(currentPage.value)
  } catch {
    ElMessage.error('删除失败')
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchScores(page, searchQuery.value, studentNoQuery.value, courseQuery.value)
}

onMounted(() => {
  fetchScores(currentPage.value)
  // fetchCourses()
})
</script>

<style scoped>
.scores-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: var(--color-primary);
}
/* 调整搜索框的间距 */
:deep.scores-search {
  max-width: 150px;
  margin-top: 15px;
  margin-right: 15px; /* 为搜索框添加右外边距 */
  margin-bottom: 15px; /* 为搜索框添加底部外边距 */
  width: 200px; /* 设置固定宽度，避免过宽 */
  padding: 5px 8px; /* 给输入框增加内边距 */
  border-radius: 8px; /* 圆角效果 */
  border: 1px solid #dcdfe6; /* 边框颜色 */
}
.scores-header {
  display: flex;
  justify-content: space-between; /* 让内容均匀分布 */
  align-items: center; /* 垂直居中对齐 */
  gap: 20px; /* 增加间距，让元素之间不再显得过于紧凑 */
  margin-bottom: 20px; /* 给表格和标题之间留出间距 */
}

.el-button,
.el-input {
  margin: 0 10px; /* 按钮和输入框之间的间距 */
}
/* 成绩管理头部样式 */
.scores-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.el-table {
  margin-top: 20px;
}

/* 表格与搜索框之间的间距 */
.el-table {
  margin-top: 10px; /* 给表格增加顶部外边距，使其与搜索框有更多间隔 */
}
:deep(.el-table th) {
  background-color: var(--color-panel) !important; /* 表头背景色 */
  color: var(--color-text) !important; /* 表头文本颜色 */
  font-weight: bold !important; /* 表头字体加粗 */
}

:deep.el-table__row--striped {
  background-color: unset !important; /* 禁用条纹效果 */
}

::v-deep .el-table td {
  background-color: var(--color-card) !important; /* 单元格背景色 */
  color: inherit !important; /* 继承父级的文本颜色 */
}
/* 自定义奇偶行样式 */
::v-deep .el-table__body tr:nth-child(odd) {
  background-color: var(--color-background-odd) !important;
}

::v-deep .el-table__body tr:nth-child(even) {
  background-color: var(--color-background-even) !important;
}

:deep(.el-table .el-table__body tr:hover) {
  background-color: var(--color-hover) !important;
  cursor: pointer !important;
}

/* 使用 ::v-deep 来穿透 scoped 样式 */
::v-deep .el-dialog {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  z-index: 9999 !important;
  width: 500px !important;
  padding: 20px !important;
  border-radius: 12px !important;
  background-color: #fff !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
}

/* 弹窗标题 */
::v-deep .el-dialog__header {
  font-size: 18px !important;
  font-weight: bold !important;
  color: #409eff !important;
  padding-bottom: 10px !important;
}

/* 弹窗内容区样式 */
::v-deep .el-dialog__body {
  padding: 20px !important; /* 增加内容区域的间距 */
}

/* 按钮样式 */
::v-deep .el-button {
  padding: 12px 20px !important;
  font-size: 16px !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
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
