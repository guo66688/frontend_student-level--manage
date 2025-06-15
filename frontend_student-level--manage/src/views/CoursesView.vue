<!-- src\views\CoursesView.vue -->
<template>
  <!-- <div :class="['courses-header', theme]"> -->
  <!-- 课程管理标题 -->
  <h2 class="courses-title">课程管理</h2>

  <!-- 搜索框 -->
  <el-input
    v-model="searchQuery"
    placeholder="搜索课程"
    class="courses-search"
    prefix-icon="el-icon-search"
    @keyup.enter="searchCourses"
  />
  <!-- </div> -->

  <!-- 新增课程按钮 -->
  <el-button type="primary" @click="openAddDialog" class="add-course-button">
    新 增 课 程
  </el-button>
  <div :class="['courses-header', theme]">
    <el-table :data="courses" stripe>
      <el-table-column prop="course_code" label="课程代码" sortable align="center" />
      <el-table-column prop="course_name" label="课程名称" sortable align="center" />
      <el-table-column prop="credit" label="学 分" sortable align="center" />
      <el-table-column label="操作" align="center">
        <template #default="{ row, column, $index }">
          <el-button size="small" @click="openEditDialog(row)" type="primary">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteCourse(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <!-- 分页组件 -->
  <el-pagination
    v-bind:current-page="currentPage"
    :page-size="pageSize"
    :total="totalCourses"
    @current-change="handlePageChange"
    layout="total, prev, pager, next, jumper"
    style="margin-top: 20px; text-align: center"
  />

  <!-- 新增/编辑对话框 -->
  <el-dialog
    class="custom-dialog"
    :title="isEditing ? '编辑课程' : '新增课程'"
    v-model="dialogVisible"
    width="500px"
    :before-close="handleClose"
  >
    <el-form :model="form" :rules="formRules" ref="formRef">
      <el-form-item label="课程代码" prop="course_code">
        <el-input v-model="form.course_code" />
      </el-form-item>
      <el-form-item label="课程名称" prop="course_name">
        <el-input v-model="form.course_name" />
      </el-form-item>
      <el-form-item label="学分" prop="credit">
        <el-input-number v-model="form.credit" :min="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted, reactive, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 使用 import type 来避免与局部声明冲突
import type { FormItemRule } from 'element-plus'

type Arrayable<T> = T | T[]

axios.defaults.baseURL = '/api'

interface Course {
  id: number
  course_code: string
  course_name: string
  credit: number
}

const courses = ref<Course[]>([])
const dialogVisible = ref(false)
const isEditing = ref(false)
const form = ref<Partial<Course>>({})
const formRef = ref<any>(null)

const currentPage = ref(1)
const pageSize = ref(10)
const totalCourses = ref(0)

const formRules: Partial<Record<string, Arrayable<FormItemRule>>> = reactive({
  course_code: [{ required: true, message: '课程代码不能为空', trigger: 'blur' }],
  course_name: [{ required: true, message: '课程名称不能为空', trigger: 'blur' }],
  credit: [
    { required: true, message: '学分不能为空', trigger: 'blur' },
    { required: true, type: 'number', message: '学分必须是数字', trigger: 'blur' },
  ],
})

const searchQuery = ref('')

// 获取当前主题
const theme = computed(() => {
  const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light'
  console.log('当前主题:', currentTheme)
  // 使用 nextTick 确保 DOM 更新完毕
  return currentTheme
})

// 拉取课程列表并根据搜索过滤
async function fetchCourses(page: number = 1, query: string = '') {
  try {
    const res = await axios.get<{ data: Course[]; total: number }>('/courses', {
      params: { page, size: pageSize.value, query },
    })
    courses.value = res.data.data
    totalCourses.value = res.data.total
  } catch {
    ElMessage.error('获取课程列表失败')
  }
}

// 搜索课程并触发过滤
function searchCourses() {
  fetchCourses(currentPage.value, searchQuery.value) // 传递搜索关键词
}

// 打开“新增”对话框
function openAddDialog() {
  if (dialogVisible.value) return
  isEditing.value = false
  form.value = {}
  dialogVisible.value = true
}

// 打开“编辑”对话框
function openEditDialog(row: Course) {
  if (dialogVisible.value) return
  isEditing.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

async function submitForm() {
  try {
    await formRef.value.validate()
    if (isEditing.value && form.value.id != null) {
      await axios.put(`/courses/${form.value.id}`, form.value)
      ElMessage.success('更新成功')
    } else {
      await axios.post('/courses', form.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchCourses(currentPage.value)
  } catch {
    ElMessage.error('操作失败')
  }
}

async function deleteCourse(id: number) {
  try {
    await ElMessageBox.confirm('确认删除该课程？', '警告', { type: 'warning' })
    await axios.delete(`/courses/${id}`)
    ElMessage.success('删除成功')
    fetchCourses(currentPage.value)
  } catch {
    ElMessage.error('删除失败')
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchCourses(page, searchQuery.value)
}

const handleClose = () => {
  dialogVisible.value = false
}

onMounted(() => {
  fetchCourses(currentPage.value) // 加载数据
  nextTick(() => {
    // 确保数据加载完成后，强制应用样式
    const tableElement = document.querySelector('.el-table')
    if (tableElement && tableElement instanceof HTMLElement) {
      tableElement.style.display = 'none' // 隐藏表格
      tableElement.offsetHeight // 强制触发重新渲染
      tableElement.style.display = '' // 恢复显示
    }
  })
})
</script>

<style scoped>
/* 课程管理标题 */
.courses-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: var(--color-primary);
}
/* 调整搜索框和新增按钮的布局 */
.courses-header {
  display: flex;
  justify-content: space-between; /* 让内容均匀分布 */
  align-items: center; /* 垂直居中对齐 */
  gap: 20px; /* 增加间距，让元素之间不再显得过于紧凑 */
  margin-bottom: 20px; /* 给表格和标题之间留出间距 */
}

/* 搜索框样式 */
.courses-search {
  width: 200px; /* 设置固定宽度，避免过宽 */
  padding: 5px 8px; /* 给输入框增加内边距 */
  border-radius: 8px; /* 圆角效果 */
  border: 1px solid #dcdfe6; /* 边框颜色 */
}

/* 新增课程按钮样式 */
.add-course-button {
  background: linear-gradient(45deg, #409eff, #79b8ff);
  border-radius: 8px;
  padding: 8px 15px; /* 按钮的内边距更大一些 */
  font-size: 16px; /* 按钮字体大小适中 */
  color: #fff; /* 按钮文字颜色 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 按钮的阴影效果 */
  transition: all 0.3s ease; /* 按钮悬停效果 */
}

.add-course-button:hover {
  background: linear-gradient(45deg, #3e8ef7, #66aaff);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); /* 增加悬停时的阴影 */
  cursor: pointer; /* 鼠标悬停时显示指针 */
}

/* 调整分页器样式 */
.el-pagination {
  margin-top: 20px; /* 给分页器留出更多的空间 */
  justify-content: center; /* 使分页器居中对齐 */
}

/* 按钮、输入框与页面的整体间距 */
.el-button,
.el-input {
  margin: 0 8px; /* 按钮和输入框之间增加间距 */
}

/* 表格与搜索框之间的间距 */
.el-table {
  margin-top: 20px; /* 给表格增加顶部外边距，使其与搜索框有更多间隔 */
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

/* 确认按钮 */
::v-deep .el-button--primary {
  background-color: #409eff !important;
  color: #fff !important;
  border-color: #409eff !important;
}

::v-deep .el-button--primary:hover {
  background-color: #66aaff !important;
  border-color: #66aaff !important;
}

/* 取消按钮 */
::v-deep .el-button--text {
  color: #606266 !important;
}

::v-deep .el-button--text:hover {
  color: #409eff !important;
}
</style>
