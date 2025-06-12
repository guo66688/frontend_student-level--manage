<template>
  <el-page-header content="课程管理" />
  <el-button type="primary" @click="openAddDialog">新 增 课 程</el-button>
  <el-table :data="courses" style="width: 100%; margin-top: 20px">
    <el-table-column prop="course_code" label="课程代码" />
    <el-table-column prop="course_name" label="课程名称" />
    <el-table-column prop="credit" label="学 分" />
    <el-table-column label="操作">
      <template #default="{ row }">
        <el-button size="mini" @click="openEditDialog(row)">编辑</el-button>
        <el-button size="mini" type="danger" @click="deleteCourse(row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 新增/编辑对话框 -->
  <el-dialog :title="isEditing ? '编辑课程' : '新增课程'" v-model:visible="dialogVisible">
    <el-form :model="form">
      <el-form-item label="课程代码">
        <el-input v-model="form.course_code" />
      </el-form-item>
      <el-form-item label="课程名称">
        <el-input v-model="form.course_name" />
      </el-form-item>
      <el-form-item label="学 分">
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
import { ref, onMounted } from 'vue'
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

// 拉取课程列表
async function fetchCourses() {
  try {
    const res = await axios.get<Course[]>('/courses')
    courses.value = res.data
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
    if (isEditing.value && form.value.id != null) {
      await axios.put(`/courses/${form.value.id}`, form.value)
      ElMessage.success('更新成功')
    } else {
      await axios.post('/courses', form.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchCourses()
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
    fetchCourses()
  } catch {
    ElMessage.error('删除失败')
  }
}

onMounted(fetchCourses)
</script>
