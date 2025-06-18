<template>
  <div>
    <h2 class="charts-title">图表管理</h2>

    <!-- 搜索框 -->
    <el-input
      v-model="searchQuery"
      placeholder="搜索图表类型"
      class="charts-search"
      prefix-icon="el-icon-search"
      @keyup.enter="searchCharts"
    />

    <!-- 新增图表按钮 -->
    <el-button type="primary" @click="openAddDialog" class="add-chart-button">
      新 增 图 表
    </el-button>

    <div :class="['charts-header', theme]">
      <!-- 图表列表 -->
      <el-table :data="charts" stripe>
        <el-table-column prop="type" label="图表类型" sortable align="center" />

        <!-- 修改图表标题显示 -->
        <el-table-column label="图表标题" align="center">
          <template #default="{ row }">
            {{ row.meta && row.meta.length > 0 ? row.meta[0].Value : '无标题' }}
            <!-- 显示 meta[0].Value -->
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="openEditDialog(row)" type="primary">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteChart(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件 -->
    <el-pagination
      v-bind:current-page="currentPage"
      :page-size="pageSize"
      :total="totalCharts"
      @current-change="handlePageChange"
      layout="total, prev, pager, next, jumper"
      style="margin-top: 20px; text-align: center"
    />

    <!-- 图表新增/编辑弹窗 -->
    <el-dialog
      class="custom-dialog"
      :title="isEditing ? '编辑图表' : '新增图表'"
      v-model="dialogVisible"
      width="520px"
      :before-close="handleClose"
    >
      <el-form :model="form" :rules="formRules" ref="formRef">
        <el-form-item label="图表类型" prop="type">
          <el-input v-model="form.type" />
        </el-form-item>

        <!-- 图表标题 -->
        <el-form-item label="图表标题" prop="meta.title">
          <el-input v-model="form.meta[0].Value" placeholder="请输入图表标题" />
        </el-form-item>

        <el-form-item label="数据源类型" prop="data_source_type">
          <el-select v-model="form.data_source_type" placeholder="请选择数据源类型">
            <el-option label="静态数据" value="static" />
            <el-option label="动态数据" value="dynamic" />
          </el-select>
        </el-form-item>

        <!-- 图表数据输入 -->
        <el-form-item label="图表数据" prop="values">
          <el-table
            :data="form.values"
            style="width: 100%"
            border
            :show-summary="false"
            :stripe="true"
            :empty-text="'暂无数据'"
          >
            <el-table-column label="X轴数据" prop="x">
              <template #default="{ row }">
                <el-input v-model="row.x" placeholder="请输入 X 值，使用逗号分隔" size="small" />
              </template>
            </el-table-column>

            <el-table-column label="Y轴数据" prop="y">
              <template #default="{ row }">
                <el-input v-model="row.y" placeholder="请输入 Y 值，使用逗号分隔" size="small" />
              </template>
            </el-table-column>

            <el-table-column label="操作">
              <template #default="{ $index }">
                <el-button size="small" type="danger" @click="removeData($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-button size="small" @click="addData">添加数据</el-button>
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
import { ref, onMounted, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCharts, createChart, updateChart, deleteChart as apiDeleteChart } from '@/api/charts.ts'
import type { ChartData } from '@/api/charts.ts'
import type { FormInstance } from 'element-plus'
import { toRaw } from 'vue'

// 图表数据
const charts = ref<ChartData[]>([])
const dialogVisible = ref(false)
const isEditing = ref(false)

const currentPage = ref(1)
const pageSize = ref(10)
const totalCharts = ref(0)
const searchQuery = ref('')

// 表单验证规则
const formRules = reactive({
  type: [{ required: true, message: '图表类型不能为空', trigger: 'blur' }],
  'meta.title': [{ required: true, message: '图表标题不能为空', trigger: 'blur' }],
  data_source_type: [{ required: true, message: '请选择数据源类型', trigger: 'blur' }],
  values: [{ required: true, message: '图表数据不能为空', trigger: 'blur' }],
})

const theme = computed(() => {
  return document.body.classList.contains('dark') ? 'dark' : 'light'
})

// form 引用
const formRef = ref<FormInstance | null>(null)

const form = ref<Partial<ChartData>>({
  id: '',
  type: '',
  meta: [{ Key: '', Value: '' }],
  data_source_type: 'static',
  values: [{ x: [], y: [] }],
})

// 获取图表数据
async function fetchCharts(page: number = 1, query: string = '') {
  const pageSize = 10
  try {
    const res = await getCharts(page, pageSize, query)

    // 确保返回的数据是一个数组
    if (Array.isArray(res.data)) {
      charts.value = res.data
      totalCharts.value = res.total || 0
    } else {
      console.error('返回的数据格式不正确，res.data 应该是数组')
      charts.value = []
      totalCharts.value = 0
    }
  } catch (error) {
    console.error('获取图表列表失败:', error)
    ElMessage.error('获取图表列表失败')
    charts.value = []
    totalCharts.value = 0
  }
}
function someFunction(data: any) {
  if (Array.isArray(data) && data.includes('someValue')) {
    // 执行包含操作
  } else {
    console.error('data 不是数组，无法调用 includes 方法')
  }
}
// 搜索图表
function searchCharts() {
  fetchCharts(currentPage.value, searchQuery.value)
}

// 打开新增图表弹窗
function openAddDialog() {
  if (dialogVisible.value) return // 删除这行代码
  isEditing.value = false
  form.value = {
    type: '',
    meta: [{ Key: 'title', Value: '' }],
    data_source_type: 'static',
    values: [{ x: [], y: [] }],
  }
  console.log('打开对话框前 dialogVisible:', dialogVisible.value)
  dialogVisible.value = true // 确保 dialogVisible 为 true
  console.log('打开对话框后 dialogVisible:', dialogVisible.value)
}

// 打开编辑图表弹窗
function openEditDialog(row: ChartData) {
  if (dialogVisible.value) return
  isEditing.value = true
  form.value = {
    ...row,
    meta: row.meta || [{ Key: 'title', Value: '' }],
    values: row.values || [{ x: [], y: [] }],
  }
  dialogVisible.value = true
}

// 提交表单
// async function submitForm() {
//   try {
//     if (formRef.value) {
//       await formRef.value.validate()
//     }
//     form.value.meta = form.value.meta || [{ Key: 'title', Value: '' }]
//     const xValues = form.value.values?.map((item: any) => item.x) || []
//     const yValues = form.value.values?.map((item: any) => item.y) || []

//     const formData = {
//       ...form.value,
//       meta: [{ Key: 'title', Value: form.value.meta[0]?.Value || '' }],
//       values: { x: xValues, y: yValues }, // 确保 values 是包含 x 和 y 数组的对象
//     }

//     if (isEditing.value && formData.id) {
//       await updateChart(formData.id, formData)
//       ElMessage.success('更新成功')
//     } else if (!isEditing.value) {
//       await createChart(formData)
//       ElMessage.success('新增成功')
//     } else {
//       throw new Error('表单没有正确提交，缺少 id')
//     }

//     dialogVisible.value = false
//   } catch (error) {
//     console.error('操作失败:', error)
//     // ElMessage.error(`操作失败: ${error.message}`)
//   }
// }
async function submitForm() {
  try {
    if (formRef.value) {
      await formRef.value.validate() // 表单验证
    }

    // 如果 values 为空，重新初始化
    form.value.values = form.value.values || [{ x: [], y: [] }]

    form.value.meta = form.value.meta || [{ Key: 'title', Value: '' }]
    const xValues = form.value.values?.map((item: any) => item.x) || []
    const yValues = form.value.values?.map((item: any) => item.y) || []

    const formData = {
      ...form.value,
      meta: [{ Key: 'title', Value: form.value.meta[0]?.Value || '' }],
      values: [{ x: xValues, y: yValues }], // 确保 values 包含 x 和 y 数组
    }

    if (isEditing.value && formData.id) {
      await updateChart(formData.id, formData) // 更新图表
      ElMessage.success('更新成功')
    } else if (!isEditing.value) {
      await createChart(formData) // 创建新图表
      ElMessage.success('新增成功')
    } else {
      throw new Error('表单没有正确提交，缺少 id')
    }

    dialogVisible.value = false // 关闭对话框
  } catch (error) {
    console.error('操作失败:', error)
    // ElMessage.error(`操作失败: ${error.message}`);
  }
}

// 删除图表
async function handleDeleteChart(id: string) {
  try {
    await ElMessageBox.confirm('确认删除该图表？', '警告', { type: 'warning' })
    await apiDeleteChart(id)
    ElMessage.success('删除成功')
    fetchCharts(currentPage.value)
  } catch {
    ElMessage.error('删除失败')
  }
}

// 分页处理
function handlePageChange(page: number) {
  currentPage.value = page
  fetchCharts(page, searchQuery.value)
}

// 加载图表数据
onMounted(() => {
  fetchCharts(currentPage.value)
})

// 关闭弹窗
function handleClose() {
  dialogVisible.value = false
}

function addData() {
  if (!Array.isArray(form.value.values)) {
    form.value.values = [] // 如果 values 不是数组，重设为数组
  }
  form.value.values.push({ x: [], y: [] }) // 添加新的 { x: [], y: [] }
}

function removeData(index: number) {
  if (Array.isArray(form.value.values)) {
    form.value.values.splice(index, 1) // 删除指定索引的数据
  }
}
</script>

<style scoped>
.charts-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: bold;
  color: var(--color-primary);
}

/* 学生管理头部样式 */
.charts-header {
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

.charts-search {
  width: 200px;
  padding: 5px 8px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

.add-charts-button {
  background: linear-gradient(45deg, #409eff, #79b8ff);
  border-radius: 8px;
  padding: 8px 15px;
  font-size: 16px;
  color: #fff;
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
</style>
