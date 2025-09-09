<template>
  <!-- 横向搜索栏：固定宽度，禁止换行 -->
  <div
    class="filter-bar"
    style="display: flex; flex-wrap: nowrap; gap: 12px; margin-bottom: 12px; align-items: center"
  >
    <!-- 字段搜索框：宽度 200px -->
    <el-input
      v-for="f in filters"
      :key="f.prop"
      v-model="fieldSearch[f.prop]"
      :placeholder="f.placeholder"
      clearable
      @keyup.enter="applyFilters"
      style="width: 200px"
    />

    <!-- 全文搜索框：也宽度 200px -->
    <el-input
      v-if="searchable"
      v-model="searchText"
      placeholder="全文搜索..."
      clearable
      @keyup.enter="applyFilters"
      style="width: 200px"
    />
  </div>

  <!-- 主表格 -->
  <el-table
    :data="pagedData"
    stripe
    border
    size="small"
    style="width: 100%"
    @sort-change="onSortChange"
    :default-sort="{ prop: sortProp, order: sortOrder }"
  >
    <el-table-column
      v-for="col in columns"
      :key="col.prop"
      :prop="col.prop"
      :label="col.label"
      :formatter="col.formatter"
      :sortable="sortable ? 'custom' : false"
      min-width="100"
      align="center"
    />
  </el-table>

  <!-- 分页 -->
  <el-pagination
    v-if="paginated"
    background
    layout="sizes, prev, pager, next, jumper"
    :total="filtered.length"
    :page-size="pageSize"
    :current-page="currentPage"
    :page-sizes="[10, 20, 30, 50]"
    class="custom-pagination"
    @size-change="onSizeChange"
    @current-change="onPageChange"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'

type Column = { prop: string; label: string; formatter?: (row: any) => string }
type FilterDef = { prop: string; placeholder: string }

const props = defineProps<{
  data: Record<string, any>[]
  columns: Column[]
  searchable?: boolean
  sortable?: boolean
  paginated?: boolean
  filters?: FilterDef[]
}>()

// props 默认值
const searchable = props.searchable ?? false
const sortable = props.sortable ?? false
const paginated = props.paginated ?? false
const filters = props.filters ?? []

// 多字段搜索模型
const fieldSearch = reactive(
  filters.reduce(
    (acc, f) => {
      acc[f.prop] = ''
      return acc
    },
    {} as Record<string, string>
  )
)

// 全文搜索模型
const searchText = ref('')

// 排序 & 分页 状态
const sortProp = ref('')
const sortOrder = ref<'ascending' | 'descending' | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)

// 先根据字段搜索 & 全文搜索 & 排序 得到 filtered
const filtered = computed(() => {
  let list = props.data.slice()

  // 多字段过滤
  filters.forEach((f) => {
    const kw = fieldSearch[f.prop].trim().toLowerCase()
    if (kw) {
      list = list.filter((row) => String(row[f.prop]).toLowerCase().includes(kw))
    }
  })

  // 全文搜索
  if (searchable && searchText.value.trim()) {
    const kw = searchText.value.trim().toLowerCase()
    list = list.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(kw))
    )
  }

  // 排序
  if (sortable && sortProp.value && sortOrder.value) {
    list.sort((a, b) => {
      const v1 = a[sortProp.value],
        v2 = b[sortProp.value]
      if (typeof v1 === 'number' && typeof v2 === 'number') {
        return sortOrder.value === 'ascending' ? v1 - v2 : v2 - v1
      }
      return 0
    })
  }

  return list
})

// 再根据分页得到 pagedData
const pagedData = computed(() => {
  if (!paginated) return filtered.value
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

// 事件处理
function applyFilters() {
  currentPage.value = 1
}
function onSortChange({ prop, order }: any) {
  sortProp.value = prop
  sortOrder.value = order
}
function onSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
}
function onPageChange(page: number) {
  currentPage.value = page
}

// 动态 pageSize
function calculatePageSize() {
  const rows = Math.floor((window.innerHeight - 300) / 50)
  pageSize.value = Math.max(10, Math.min(rows, 50))
}
onMounted(() => {
  calculatePageSize()
  window.addEventListener('resize', calculatePageSize)
})
onUnmounted(() => {
  window.removeEventListener('resize', calculatePageSize)
})

// 数据变化重置页码
watch(
  () => props.data,
  () => (currentPage.value = 1)
)
</script>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.filter-input {
  margin-right: 12px;
}
.custom-pagination {
  margin-top: 16px;
  text-align: center;
}
</style>
