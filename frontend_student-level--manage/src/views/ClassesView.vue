<template>
  <div>
    <h2 class="classes-title">班级管理</h2>

    <!-- 搜索班级 -->
    <el-input
      v-model="searchName"
      placeholder="搜索班级"
      class="classes-search"
      prefix-icon="el-icon-search"
      @keyup.enter="searchClasses"
    />
    <!-- 新增班级按钮 -->
    <el-button type="primary" @click="openAddDialog" class="add-class-button">
      新 增 班 级
    </el-button>

    <el-table :data="filteredClasses" stripe style="margin-top: 20px">
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="name" label="班级名称" align="center" />
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteClass(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑班级对话框 -->
    <el-dialog
      :title="isEditing ? '编辑班级' : '新增班级'"
      v-model="dialogVisible"
      width="500px"
      :before-close="handleClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="form.name" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getClasses, createClass, updateClass, deleteClass as apiDeleteClass } from '@/api/classes'
import type { Class } from '@/api/classes'
import type { FormInstance } from 'element-plus'

const classes = ref<Class[]>([])
const searchName = ref('')

const dialogVisible = ref(false)
const isEditing = ref(false)
const formRef = ref<FormInstance | null>(null)
const form = ref<Partial<Class>>({ name: '' })

const rules = reactive({
  name: [{ required: true, message: '班级名称不能为空', trigger: 'blur' }]
})

// 拉取班级列表
async function fetchClasses() {
  try {
    const res = await getClasses()
    classes.value = res
  } catch {
    ElMessage.error('获取班级列表失败')
  }
}

// 搜索（本地过滤）
const filteredClasses = computed(() => {
  const key = searchName.value.trim().toLowerCase()
  return key
    ? classes.value.filter(item => item.name.toLowerCase().includes(key))
    : classes.value
})
function searchClasses() {
  // 如果后端支持查询，可改为带参数 fetchClasses(searchName.value)
  // 目前本地过滤即可
}

function openAddDialog() {
  isEditing.value = false
  form.value = { name: '' }
  dialogVisible.value = true
}

function openEditDialog(row: Class) {
  isEditing.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

function handleClose() {
  dialogVisible.value = false
}

// 提交表单
async function submitForm() {
  try {
    if (formRef.value) await formRef.value.validate()
    if (isEditing.value && form.value.id != null) {
      await updateClass(form.value.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await createClass(form.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchClasses()
  } catch (err) {
    const e = err as Error
    ElMessage.error(`操作失败: ${e.message}`)
  }
}

// 删除
async function deleteClass(id: number) {
  try {
    await ElMessageBox.confirm('确认删除该班级？', '警告', { type: 'warning' })
    await apiDeleteClass(id)
    ElMessage.success('删除成功')
    fetchClasses()
  } catch {
    ElMessage.error('删除失败')
  }
}

onMounted(fetchClasses)
</script>

<style scoped>
.classes-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: var(--color-primary);
}

.classes-search {
  width: 200px;
  margin-right: 20px;
}

.add-class-button {
  background: linear-gradient(45deg, #409eff, #79b8ff);
  color: #fff;
}
</style>
