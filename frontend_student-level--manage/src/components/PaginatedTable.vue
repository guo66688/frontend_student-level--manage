<!-- src\components\PaginatedTable.vue -->
<template>
  <div>
    <div class="filter-bar">
      <!-- 自定义字段过滤 -->
      <el-input
        v-for="f in filters"
        :key="f.prop"
        v-model="filterValues[f.prop]"
        :placeholder="f.placeholder"
        clearable
        @keyup.enter="onFilterChange"
        class="filter-input"
      />
      <!-- 可选全文搜索 -->
      <el-input
        v-if="options.searchable"
        v-model="searchText"
        placeholder="全文搜索..."
        clearable
        @keyup.enter="onFilterChange"
        class="filter-input"
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
        :sortable="options.sortable ? 'custom' : false"
        min-width="100"
        align="center"
      />
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-if="options.paginated"
      background
      layout="sizes, prev, pager, next, jumper"
      :total="filtered.length"
      :page-size="pageSize"
      :current-page="currentPage"
      :page-sizes="pageSizeOptions"
      class="custom-pagination"
      @size-change="onSizeChange"
      @current-change="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import type { PropType } from 'vue'

interface Column {
  prop: string
  label: string
  formatter?: (row: any) => string
}

interface FilterDef {
  prop: string
  placeholder: string
}

const props = defineProps<{
  data: Record<string, any>[]
  columns: Column[]
  options?: {
    searchable?: boolean
    sortable?: boolean
    paginated?: boolean
  }
  pageSizeOptions?: number[]
  filters?: FilterDef[]
}>()

// 默认配置
const options = {
  searchable: true,
  sortable: true,
  paginated: true,
  ...props.options,
}
const pageSizeOptions = props.pageSizeOptions || [10, 20, 30, 50]
const filters = props.filters || []

// 过滤值
const filterValues = reactive<Record<string, string>>(
  filters.reduce(
    (acc, f) => {
      acc[f.prop] = ''
      return acc
    },
    {} as Record<string, string>
  )
)
const searchText = ref('')

// 排序 & 分页状态
const sortProp = ref('')
const sortOrder = ref<'ascending' | 'descending' | null>(null)
const currentPage = ref(1)
const pageSize = ref(pageSizeOptions[0])

// 计算过滤、排序后的数据
const filtered = computed(() => {
  let list = props.data.slice()
  // 字段过滤
  filters.forEach((f) => {
    const val = filterValues[f.prop].trim().toLowerCase()
    if (val) {
      list = list.filter((row) => String(row[f.prop]).toLowerCase().includes(val))
    }
  })
  // 全文搜索
  if (options.searchable && searchText.value) {
    const kw = searchText.value.toLowerCase()
    list = list.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(kw))
    )
  }
  // 排序
  if (options.sortable && sortProp.value && sortOrder.value) {
    list.sort((a, b) => {
      const v1 = a[sortProp.value]
      const v2 = b[sortProp.value]
      if (typeof v1 === 'number' && typeof v2 === 'number') {
        return sortOrder.value === 'ascending' ? v1 - v2 : v2 - v1
      }
      return 0
    })
  }
  return list
})

// 分页数据
const pagedData = computed(() => {
  if (!options.paginated) return filtered.value
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

// 事件处理
function onFilterChange() {
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

// 动态计算 pageSize
function calculatePageSize() {
  const height = window.innerHeight
  const rowH = 50
  const reserved = 300
  const rows = Math.floor((height - reserved) / rowH)
  pageSize.value = Math.max(pageSizeOptions[0], Math.min(rows, pageSizeOptions.slice(-1)[0]))
}

onMounted(() => {
  calculatePageSize()
  window.addEventListener('resize', calculatePageSize)
})
onUnmounted(() => {
  window.removeEventListener('resize', calculatePageSize)
})

// data 变化重置分页
watch(
  () => props.data,
  () => {
    currentPage.value = 1
  }
)
</script>

<style scoped>
.custom-pagination {
  position: sticky;
  bottom: 0;
  background: inherit; /* 让它背景跟父一样 */
  padding-top: 8px;
  padding-bottom: 8px;
  z-index: 10;
}
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}
.filter-input {
  width: 180px;
}
</style>
