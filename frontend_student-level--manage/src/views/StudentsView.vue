<!-- src\views\StudentsView.vue -->
<template>
  <div>
    <h2 class="students-title">学生管理</h2>

    <!-- 搜索框 -->
    <el-input
      v-model="searchQuery"
      placeholder="搜索学生"
      class="students-search"
      prefix-icon="el-icon-search"
      @keyup.enter="searchStudents"
    />
    <el-input
      v-model="studentNoQuery"
      placeholder="学号"
      class="students-search"
      prefix-icon="el-icon-search"
      @keyup.enter="searchStudents"
    />

    <!-- 班级搜索框 -->
    <el-input
      v-model="classNameQuery"
      placeholder="班级"
      class="students-search"
      prefix-icon="el-icon-search"
      @keyup.enter="searchStudents"
    />
    <!-- 新增学生按钮 -->
    <el-button type="primary" @click="openAddDialog" class="add-student-button">
      新 增 学 生
    </el-button>

    <div :class="['students-header', theme]">
      <!-- 学生列表 -->
      <el-table :data="students" stripe>
        <el-table-column prop="student_no" label="学号" sortable align="center" />
        <el-table-column prop="name" label="姓名" sortable align="center" />
        <el-table-column prop="gender" label="性别" align="center" />
        <el-table-column prop="class.name" label="班级" align="center" />
        <!-- 显示班级名称 -->
        <el-table-column label="操作" align="center">
          <template #default="{ row }: { row: Student }">
            <el-button size="small" @click="openEditDialog(row)" type="primary">编辑</el-button>

            <el-button size="small" type="danger" @click="deleteStudent(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件 -->
    <el-pagination
      v-bind:current-page="currentPage"
      :page-size="pageSize"
      :total="totalStudents"
      @current-change="handlePageChange"
      layout="total, prev, pager, next, jumper"
      style="margin-top: 20px; text-align: center"
    />

    <el-dialog
      class="custom-dialog"
      :title="isEditing ? '编辑学生' : '新增学生'"
      v-model="dialogVisible"
      width="520px"
      :before-close="handleClose"
    >
      <el-form :model="form" :rules="formRules" ref="formRef">
        <el-form-item label="学号" prop="student_no">
          <el-input v-model="form.student_no" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择性别">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
        <!-- 编辑学生时选择班级 -->
        <el-form-item label="班级" prop="class_name">
          <el-select v-model="form.class!.id" placeholder="请选择班级">
            <el-option
              v-for="classItem in classes"
              :key="classItem.id"
              :label="classItem.name"
              :value="classItem.id"
            />
          </el-select>
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
import axios from 'axios'
import { ref, onMounted, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getStudents, createStudent, updateStudent } from '@/api/students'
import { deleteStudent as apiDeleteStudent } from '@/api/students'
import type { Student, Class } from '@/api/students'
import type { FormInstance } from 'element-plus'

// 明确声明 students 的类型为 Student[]
const students = ref<Student[]>([]) // 初始化为空数组，并且指定类型为 Student[]
const classes = ref<Class[]>([]) // 班级数据
const dialogVisible = ref(false)
const isEditing = ref(false)

const currentPage = ref(1) // 当前页
const pageSize = ref(10) // 每页条数
const totalStudents = ref(0) // 学生总数
const searchQuery = ref('') // 搜索框输入值
const studentNoQuery = ref('') // 学号查询
const classNameQuery = ref('') // 班级查询

// form 表单验证规则
const formRules = reactive({
  student_no: [{ required: true, message: '学号不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  gender: [{ required: true, message: '性别不能为空', trigger: 'blur' }],
  class_name: [{ required: true, message: '班级不能为空', trigger: 'blur' }],
})

const theme = computed(() => {
  return document.body.classList.contains('dark') ? 'dark' : 'light'
})

// formRef 引用 el-form 组件实例
const formRef = ref<FormInstance | null>(null)
const form = ref<Partial<Student>>({
  student_no: '',
  name: '',
  gender: '',
  class: { id: 0, name: '' } as Class, // 确保 class 字段初始化
})

// 拉取班级数据
async function fetchClasses() {
  try {
    const res = await axios.get('/classes')
    classes.value = res.data
  } catch {
    ElMessage.error('获取班级列表失败')
  }
}

// 拉取学生数据
async function fetchStudents(
  page: number = 1,
  query: string = '',
  studentNo: string = '',
  className: string = ''
) {
  try {
    const res = await getStudents(page, pageSize.value, query, studentNo, className)
    students.value = res.data
    totalStudents.value = res.total
  } catch {
    ElMessage.error('获取学生列表失败')
  }
}

// 搜索学生
function searchStudents() {
  fetchStudents(currentPage.value, searchQuery.value, studentNoQuery.value, classNameQuery.value)
}
const handleClose = () => {
  dialogVisible.value = false
}
// 新增或编辑学生表单
function openAddDialog() {
  if (dialogVisible.value) return
  isEditing.value = false
  form.value = { student_no: '', name: '', gender: '', class: { id: 0, name: '' } } // 确保 form 包含基本字段
  dialogVisible.value = true
}

function openEditDialog(row: Student) {
  if (dialogVisible.value) return
  isEditing.value = true
  console.log(row) // 调试输出，确保 row 有 id 字段
  form.value = { ...row } // 确保 row 包含 id
  dialogVisible.value = true
}

// 提交表单
async function submitForm() {
  try {
    if (formRef.value) {
      await formRef.value.validate()
    }

    if (isEditing.value && form.value.id != null) {
      // 如果 id 存在，执行更新操作
      await updateStudent(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else if (!isEditing.value) {
      // 如果是新增操作
      await createStudent(form.value)
      ElMessage.success('新增成功')
    } else {
      throw new Error('表单没有正确提交，缺少 id')
    }

    dialogVisible.value = false
    fetchStudents(currentPage.value)
  } catch (error) {
    // 使用类型断言，认为 error 是 Error 类型
    const e = error as Error
    ElMessage.error(`操作失败: ${e.message}`)
  }
}

// 删除学生
async function deleteStudent(id: number) {
  try {
    await ElMessageBox.confirm('确认删除该学生？', '警告', { type: 'warning' })
    await apiDeleteStudent(id) // 使用别名 apiDeleteStudent 调用 API 删除学生
    ElMessage.success('删除成功')
    fetchStudents(currentPage.value)
  } catch {
    ElMessage.error('删除失败')
  }
}

// 分页处理
function handlePageChange(page: number) {
  currentPage.value = page
  fetchStudents(page, searchQuery.value, studentNoQuery.value, classNameQuery.value)
}

// 加载数据
onMounted(() => {
  fetchStudents(currentPage.value)
  fetchClasses()
})
</script>

<style scoped>
.students-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: var(--color-primary);
}

/* 学生管理头部样式 */
.students-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

/* 按钮、输入框与页面的整体间距 */
.el-button,
.el-input {
  margin: 0 10px; /* 按钮和输入框之间增加间距 */
}

.students-search {
  width: 200px;
  padding: 5px 8px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

.add-student-button {
  background: linear-gradient(45deg, #409eff, #79b8ff);
  border-radius: 8px;
  padding: 8px 15px;
  font-size: 16px;
  color: #fff;
}

.el-table {
  margin-top: 20px;
}

.el-pagination {
  margin-top: 20px;
  justify-content: center;
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
</style>
