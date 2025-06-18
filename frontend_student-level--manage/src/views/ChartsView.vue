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
        <el-table-column prop="meta.title" label="图表标题" align="center" />
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

        <el-form-item label="图表标题" prop="meta.title">
          <el-input v-model="form.meta!.title" />
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
            <el-table-column label="X轴" prop="x">
              <template #default="{ row }">
                <el-input v-model="row.x" placeholder="请输入 X 值" size="small" />
              </template>
            </el-table-column>

            <el-table-column label="Y轴" prop="y">
              <template #default="{ row }">
                <el-input v-model="row.y" placeholder="请输入 Y 值" size="small" />
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
import { toRaw } from 'vue'; // 引入 toRaw
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
  id: '', // 初始化为字符串类型，而不是 undefined
  type: '',
  meta: { title: '' },
  data_source_type: 'static', // 默认静态数据
  values: [], // 确保 values 为一个空数组，而不是 undefined
})

// 获取图表数据
async function fetchCharts(page: number = 1, query: string = '') {
  try {
    const res = await getCharts(page, pageSize.value, query)
    charts.value = res.data || []  // 确保给 charts 初始化一个默认值
    totalCharts.value = res.total
  } catch (error) {
    console.error('获取图表列表失败:', error)
    ElMessage.error('获取图表列表失败')
  }
}



// 搜索图表
function searchCharts() {
  fetchCharts(currentPage.value, searchQuery.value)
}

// 打开新增图表弹窗
function openAddDialog() {
  if (dialogVisible.value) return
  isEditing.value = false
  form.value = { type: '', meta: { title: '' }, data_source_type: 'static', values: [] }
  dialogVisible.value = true
}

// 打开编辑图表弹窗

function openEditDialog(row: ChartData) {
  if (dialogVisible.value) return
  isEditing.value = true

  // 通过复制 row 的数据确保 form 被正确更新
  form.value = { ...row }
  form.value.values = form.value.values || []
  // console.log(form.value.values)

  // 处理 values 数据，确保解析 x 和 y 字符串为数组
  form.value.values = form.value.values.map((item) => {
    // console.log('Item:', item);
    const rawItem = toRaw(item); // 获取原始数据，去掉 Vue 的 Proxy

    // console.log(rawItem.x); // 查看 x 的值
    // console.log(rawItem.y); // 查看 y 的值

    const x = rawItem.x;
    const y = rawItem.y;

    // console.log('x:', x);
    // console.log('y:', y);
      return {
      // 保持 x 和 y 为字符串，如果是有效字符串或数组，保持原样
      x: item.x ? (typeof item.x === 'string' ? item.x : JSON.stringify(item.x)) : '', // 转换为字符串
      y: item.y ? (typeof item.y === 'string' ? item.y : JSON.stringify(item.y)) : '', // 转换为字符串
    }
  })

  // console.log(form.value.values) // 打印以确认数据解析成功
  dialogVisible.value = true
}

// 提交表单
async function submitForm() {
  try {
    if (formRef.value) {
      await formRef.value.validate()
    }

    const formData = {
      ...form.value,
      id: form.value.id || '',
      type: form.value.type || '',
      meta: form.value.meta || { title: '' },
      data_source_type: form.value.data_source_type || 'static', // 确保选择了数据源类型
      values: form.value.values || [], // 如果没有 values，则用空数组替代
    }
    // console.log('Fetched charts:', charts.value)
    console.log('formData.id:', formData.id); // 输出 id 检查值

    if (isEditing.value && formData.id) {
      await updateChart(formData.id, formData)
      ElMessage.success('更新成功')
    } else if (!isEditing.value) {
      await createChart(formData)
      ElMessage.success('新增成功')
    } else {
      throw new Error('表单没有正确提交，缺少 id')
    }
    console.log('Fetched charts:', charts.value)

    // await fetchCharts(currentPage.value)

    // console.log('Fetched charts:', charts.value)

    dialogVisible.value = false
  } catch (error) {
    console.error('操作失败:', error)  // 输出详细的错误信息
    const e = error as Error
    ElMessage.error(`操作失败: ${e.message}`)
  }
}

// 删除图表（重命名为 handleDeleteChart，避免与导入的 deleteChart 冲突）
async function handleDeleteChart(id: string) {
  try {
    await ElMessageBox.confirm('确认删除该图表？', '警告', { type: 'warning' })
    await apiDeleteChart(id) // 使用 apiDeleteChart 调用后端接口
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

// 添加数据
function addData() {
  form.value.values = form.value.values || []
  form.value.values.push({ x: '', y: '0' }) // 默认添加一个空的数据项
}

// 删除数据行
function removeData(index: number) {
  form.value.values = form.value.values || []
  form.value.values.splice(index, 1) // 删除指定索引的数据行
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
