<!-- src/components/ThemeToggle.vue -->
<template>
  <el-button @click="toggleTheme" circle :icon="themeIcon" />
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits } from 'vue'
import { Sunny, Moon } from '@element-plus/icons-vue'

const theme = ref<'light' | 'dark'>('light')
const themeIcon = ref(Sunny)

const emit = defineEmits(['toggle-theme']) // 定义 toggle-theme 事件

onMounted(() => {
  const saved = localStorage.getItem('theme')
  theme.value = saved === 'dark' ? 'dark' : 'light'

  if (!saved) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.value = prefersDark ? 'dark' : 'light'
  }

  document.body.classList.add(theme.value)
  themeIcon.value = theme.value === 'dark' ? Sunny : Moon
})

function toggleTheme() {
  const newTheme = theme.value === 'light' ? 'dark' : 'light'
  document.body.classList.remove(theme.value)
  document.body.classList.add(newTheme)
  theme.value = newTheme
  localStorage.setItem('theme', newTheme)
  themeIcon.value = newTheme === 'dark' ? Sunny : Moon

  emit('toggle-theme') // 发送事件通知父组件
}
</script>

<style scoped>
/* 样式部分保持不变 */
</style>
