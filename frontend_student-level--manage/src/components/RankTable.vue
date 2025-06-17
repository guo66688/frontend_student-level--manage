<!-- src/components/RankTable.vue -->
<template>
  <div>
    <el-input
      v-model="searchText"
      placeholder="搜索..."
      clearable
      style="margin-bottom: 12px; max-width: 300px"
    />

    <el-table
      :data="filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
      style="width: 100%"
      stripe
      border
      size="small"
      :default-sort="{ prop: columns[0]?.prop, order: 'descending' }"
      @sort-change="onSortChange"
    >
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :formatter="col.formatter"
        sortable="custom"
        min-width="100"
        align="center"
      />
    </el-table>

    <el-pagination
      v-if="paginated"
      background
      layout="sizes, prev, pager, next, jumper"
      :total="filteredData.length"
      :page-size="pageSize"
      :current-page="currentPage"
      @size-change="onSizeChange"
      @current-change="onPageChange"
      :page-sizes="[10, 20, 30, 50]"
      class="custom-pagination"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  data: Record<string, any>[]
  columns: { label: string; prop: string; formatter?: (row: any) => string }[] // 动态列配置
  searchable?: boolean
  sortable?: boolean
  paginated?: boolean
}>()

const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const sortProp = ref('')
const sortOrder = ref<'ascending' | 'descending' | null>(null)

const filteredData = computed(() => {
  let result = props.data || []

  if (props.searchable && searchText.value) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(keyword))
    )
  }

  if (props.sortable && sortProp.value) {
    result = result.slice().sort((a, b) => {
      const v1 = a[sortProp.value]
      const v2 = b[sortProp.value]
      if (typeof v1 === 'number' && typeof v2 === 'number') {
        return sortOrder.value === 'ascending' ? v1 - v2 : v2 - v1
      }
      return 0
    })
  }

  return result
})

function onSortChange({ prop, order }: { prop: string; order: 'ascending' | 'descending' | null }) {
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

function calculatePageSize() {
  const height = window.innerHeight
  const estimatedRowHeight = 50
  const reservedHeight = 300
  const rows = Math.floor((height - reservedHeight) / estimatedRowHeight)
  pageSize.value = Math.max(10, Math.min(rows, 50))
}

onMounted(() => {
  calculatePageSize()
  window.addEventListener('resize', calculatePageSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', calculatePageSize)
})
</script>
