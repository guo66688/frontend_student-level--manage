<template>
  <div>
    <h2 class="classes-title">班级管理</h2>

    <!-- 搜索框 -->
    <el-input
      v-model="searchName"
      placeholder="搜索班级名称"
      class="classes-search"
      prefix-icon="el-icon-search"
      @keyup.enter="searchClasses"
    />

    <!-- 新增班级按钮 -->
    <el-button type="primary" @click="openAddDialog" class="add-class-button">
      新 增 班 级
    </el-button>

    <!-- 班级表格 -->
    <el-table :data="classes" stripe style="margin-top: 20px">
      <el-table-column prop="ID" label="ID" width="80" align="center" />
      <el-table-column prop="name" label="班级名称" align="center" />
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteClass(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      @current-change="handlePageChange"
      layout="total, prev, pager, next, jumper"
      style="margin-top: 20px; text-align: center"
    />

    <!-- 新增/编辑对话框 -->
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getClasses, createClass, updateClass, deleteClass as apiDeleteClass } from '@/api/classes'
import type { Class } from '@/api/classes'
import type { FormInstance } from 'element-plus'

const classes = ref<Class[]>([])
const total = ref(0)
const searchName = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const dialogVisible = ref(false)
const isEditing = ref(false)
const formRef = ref<FormInstance | null>(null)
const form = ref<Partial<Class>>({ name: '' })

const rules = reactive({
  name: [{ required: true, message: '班级名称不能为空', trigger: 'blur' }],
})

// 拉取班级列表
async function fetchClasses(name = '') {
  try {
    const res = await getClasses(currentPage.value, pageSize.value, name)
    classes.value = res.data
    total.value = res.total
  } catch {
    ElMessage.error('获取班级列表失败')
  }
}

// 搜索班级
function searchClasses() {
  currentPage.value = 1
  fetchClasses(searchName.value)
}

// 页码切换
function handlePageChange(page: number) {
  currentPage.value = page
  fetchClasses(searchName.value)
}

// 新增对话框
function openAddDialog() {
  isEditing.value = false
  form.value = { name: '' }
  dialogVisible.value = true
}

// 编辑对话框
function openEditDialog(row: Class) {
  isEditing.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

// 提交表单
async function submitForm() {
  try {
    if (formRef.value) await formRef.value.validate()
    if (isEditing.value && form.value.id != null) {
      await updateClass(form.value.id, { name: form.value.name! })

      ElMessage.success('更新成功')
    } else {
      await createClass({ name: form.value.name! }) // 确保 name 是 string

      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchClasses(searchName.value)
  } catch {
    ElMessage.error('操作失败')
  }
}

// 删除班级
async function deleteClass(id: number) {
  try {
    await ElMessageBox.confirm('确认删除该班级？', '警告', { type: 'warning' })
    await apiDeleteClass(id)
    ElMessage.success('删除成功')
    fetchClasses(searchName.value)
  } catch {
    ElMessage.error('删除失败')
  }
}

function handleClose() {
  dialogVisible.value = false
}

onMounted(() => fetchClasses())
</script>

<style scoped>
.classes-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: var(--color-primary);
}
.classes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.classes-search {
  width: 200px;
  padding: 5px 8px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}
.add-class-button {
  background: linear-gradient(45deg, #409eff, #79b8ff);
  border-radius: 8px;
  padding: 8px 15px;
  font-size: 16px;
  color: #fff;
}
/* 按钮、输入框与页面的整体间距 */
.el-button,
.el-input {
  margin: 0 10px; /* 按钮和输入框之间增加间距 */
}
.el-table {
  margin-top: 20px;
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
