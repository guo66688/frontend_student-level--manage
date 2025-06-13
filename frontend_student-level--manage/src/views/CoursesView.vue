<!-- src/views/CoursesView.vue -->
<template>
  <el-page-header content="课程管理" />

  <!-- 新增课程按钮 -->
  <el-button type="primary" @click="openAddDialog" class="add-course-button">
    新 增 课 程
  </el-button>

  <!-- 表格部分 -->
  <el-table :data="courses" style="width: 100%; margin-top: 20px; border-radius: 8px" stripe>
    <el-table-column prop="course_code" label="课程代码" sortable align="center" />
    <el-table-column prop="course_name" label="课程名称" sortable align="center" />
    <el-table-column prop="credit" label="学 分" sortable align="center" />
    <el-table-column label="操作" align="center">
      <template #default="{ row }">
        <!-- 修改 size="mini" 为 size="small" -->
        <el-button
          size="small"
          @click="openEditDialog(row)"
          type="primary"
          style="margin-right: 8px"
          >编辑</el-button
        >
        <el-button size="small" type="danger" @click="deleteCourse(row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页组件 -->
  <el-pagination
    :current-page="currentPage"
    :page-size="pageSize"
    :total="totalCourses"
    @current-change="handlePageChange"
    layout="total, prev, pager, next, jumper"
    style="margin-top: 20px; text-align: center"
  />

  <!-- 新增/编辑对话框 -->
  <el-dialog
    :title="isEditing ? '编辑课程' : '新增课程'"
    v-model:visible="dialogVisible"
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
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 全局设置 axios 请求基础路径
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

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalCourses = ref(0)

// 表单验证规则
const formRules = reactive({
  course_code: [{ required: true, message: '课程代码不能为空', trigger: 'blur' }],
  course_name: [{ required: true, message: '课程名称不能为空', trigger: 'blur' }],
  credit: [
    { required: true, message: '学分不能为空', trigger: 'blur' },
    { type: 'number', message: '学分必须是数字', trigger: 'blur' },
  ],
})

// 拉取课程列表
async function fetchCourses(page: number = 1) {
  try {
    const res = await axios.get<{ data: Course[]; total: number }>('/courses', {
      params: { page, size: pageSize.value },
    })
    courses.value = res.data.data
    totalCourses.value = res.data.total
  } catch {
    ElMessage.error('获取课程列表失败')
  }
}

// 打开“新增”对话框
function openAddDialog() {
  isEditing.value = false
  form.value = {}
  dialogVisible.value = true
}

// 打开“编辑”对话框
function openEditDialog(row: Course) {
  isEditing.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

// 提交新增或更新
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

// 删除课程
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

// 页码变更时触发
function handlePageChange(page: number) {
  currentPage.value = page
  fetchCourses(page)
}

// 关闭对话框时触发
const handleClose = () => {
  dialogVisible.value = false // 关闭对话框
}

onMounted(() => fetchCourses(currentPage.value))
</script>

<style scoped>
/* 主区的间距和布局 */
.main-content {
  padding: 24px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
.add-course-button {
  margin-bottom: 20px;
  background: linear-gradient(45deg, #409eff, #79b8ff);
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
}
/* 表格样式优化 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.el-table th {
  background-color: #f4f6f9;
  color: #409eff;
}

.el-table td {
  font-size: 14px;
}

.el-table tr:hover {
  background-color: #e6f7ff;
}

.el-button {
  transition: all 0.3s ease;
}

.el-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 对话框样式优化 */
.el-dialog {
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.el-form-item {
  margin-bottom: 20px;
}

.el-input,
.el-input-number {
  border-radius: 6px;
  padding: 10px;
}

/* 按钮样式 */
.el-button[type='primary'] {
  background-color: #409eff;
  border-color: #409eff;
}

.el-button[type='primary']:hover {
  background-color: #3e8ef7;
  border-color: #3e8ef7;
}

.el-button[type='danger'] {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

.el-button[type='danger']:hover {
  background-color: #f24e4e;
  border-color: #f24e4e;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }

  .el-button {
    font-size: 14px;
  }

  .el-table {
    font-size: 12px;
  }

  .el-dialog {
    width: 90%;
  }
}
</style>
