// utils/columns.ts

interface RankData {
  student_name?: string
  course_name?: string
  class_name?: string
  avg_score?: number
  max_score?: number
  min_score?: number
  rate?: number
  [key: string]: string | number | undefined
}

interface Column {
  label: string
  prop: string
  formatter?: (row: RankData) => string // 使用 RankData 类型
}

// 更新 `toFixedColumn` 函数，确保 formatter 正常使用 row
export function toFixedColumn(label: string, prop: string): Column {
  return {
    label,
    prop,
    formatter: (row: RankData) => {
      const value = row[prop] // 使用 prop 获取字段值
      if (typeof value === 'number') {
        return value.toFixed(2) // 格式化数字
      }
      return '0.00' // 默认返回 0.00
    },
  }
}
