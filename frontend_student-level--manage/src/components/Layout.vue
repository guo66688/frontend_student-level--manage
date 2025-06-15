<!-- src\components\Layout.vue -->
<template>
  <div class="app-container">
    <!-- 状态栏 -->
    <header class="header">
      <div class="header-left">
        <img src="@/assets/logo.png" class="header-logo" />
        <span class="header-title">学生成绩管理系统</span>
        <ThemeToggle @toggle-theme="toggleTheme" />
        <!-- 监听主题切换事件 -->
      </div>
      <div class="user-info">
        <el-avatar src="path-to-user-avatar" alt="user-avatar" />
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            <i class="el-icon-arrow-down"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click="logout">退出账户</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </header>

    <!-- 内容容器 -->
    <div class="content-container">
      <!-- 侧边栏 -->
      <aside class="sidebar" :class="{ collapsed: isCollapsed }">
        <div class="collapse-btn-wrapper">
          <!-- 使用注册的图标组件 -->
          <el-button
            :icon="isCollapsed ? 'ElIconSFold' : 'ElIconSUnfold'"
            @click="isCollapsed = !isCollapsed"
            circle
            size="small"
          />
        </div>

        <el-menu
          :collapse="isCollapsed"
          router
          :default-active="route.path"
          background-color="transparent"
          text-color="var(--color-subtext)"
          active-text-color="var(--color-primary)"
          unique-opened
        >
          <el-menu-item index="/home">
            <el-icon class="sidebar-icon"><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/students">
            <el-icon class="sidebar-icon"><UserFilled /></el-icon>
            <span>学生管理</span>
          </el-menu-item>
          <el-menu-item index="/courses">
            <el-icon class="sidebar-icon"><Notebook /></el-icon>
            <span>课程管理</span>
          </el-menu-item>
          <el-menu-item index="/scores">
            <el-icon class="sidebar-icon"><Document /></el-icon>
            <span>成绩管理</span>
          </el-menu-item>
          <el-menu-item index="/analysis">
            <el-icon class="sidebar-icon"><DataAnalysis /></el-icon>
            <span>统计分析</span>
          </el-menu-item>
        </el-menu>
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        <!-- 渲染页面的内容 -->
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { HomeFilled, UserFilled, Notebook, Document, DataAnalysis } from '@element-plus/icons-vue'

const route = useRoute()
const isCollapsed = ref(false)

const logout = () => {
  // 退出逻辑，比如清除 token 并重定向到登录页面
  localStorage.removeItem('token')
  window.location.href = '/login'
}

// 切换主题时调用
const toggleTheme = () => {
  const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark'
  document.body.classList.toggle('dark', newTheme === 'dark')
  updateThemeColors(newTheme)
  window.location.reload() // 切换主题后刷新页面
}

// 更新主题颜色
const updateThemeColors = (theme: 'light' | 'dark') => {
  if (theme === 'dark') {
    document.documentElement.style.setProperty('--color-bg', '#25294d')
    document.documentElement.style.setProperty('--color-text', '#e4e8f3')
  } else {
    document.documentElement.style.setProperty('--color-bg', '#ffffff')
    document.documentElement.style.setProperty('--color-text', '#000000')
  }
}
</script>

<style scoped>
/* 外层容器 */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* 状态栏样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: var(--color-panel);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  height: 60px;
  z-index: 1000;
  position: relative;
  border-radius: 8px 8px 0 0;
  color: var(--color-text);
}

.header-left {
  display: flex;
  align-items: center;
  position: absolute;
  left: 16px;
  top: 50%;
  gap: 12px;
  transform: translateY(-50%);
}

.header-logo {
  width: 32px;
  height: 32px;
  padding: 4px;
  background-color: var(--color-panel);
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  margin-right: 8px;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.header-logo:hover {
  transform: scale(1.05) rotate(3deg);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text);
  letter-spacing: 1px;
}

.header-left :deep(.el-button) {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
  background-color: transparent;
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
  color: var(--color-text);
}

.header-left :deep(.el-button):hover {
  background-color: var(--color-bg);
  box-shadow: 0 0 8px rgba(76, 111, 255, 0.15);
}

.user-info {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.el-avatar {
  margin-right: 15px;
}

.content-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  width: 100%;
}

.sidebar {
  display: flex;
  flex-direction: column;
  background: var(--color-card);
  border-right: 1px solid var(--color-border);
  width: 240px;
  transition: width 0.2s;
  padding-top: 60px;
  overflow-y: auto;
  position: relative;
  align-items: stretch; /* ✅ 让 el-menu 撑满宽度（代替 center） */
  border-radius: 0 8px 8px 0;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);
  color: var(--color-text);
}

.sidebar :deep(.el-menu) {
  width: 100%; /* ✅ 撑满侧边栏宽度 */
  box-shadow: none !important; /* ✅ 避免边界残影 */
  border-right: none !important;
}

.sidebar :deep(.el-menu-item) {
  color: var(--color-subtext) !important;
  justify-content: center;
  font-weight: 500;
  font-size: 14px; /* ✅ 统一字号 */
  padding: 10px 20px; /* 可调 */
}

.sidebar :deep(.el-menu-item.is-active) {
  color: var(--color-primary) !important;
  background-color: transparent !important;
  font-weight: 600;
}

.sidebar :deep(.el-menu-item:hover) {
  background-color: var(--color-panel) !important;
  color: var(--color-text) !important;
}
.sidebar :deep(i.sidebar-icon) {
  display: inline-block;
  width: 18px;
  height: 18px;
  background: none;
  border: none;
}

.sidebar :deep(.sidebar-icon) {
  font-size: 18px;
  margin-right: 8px;
  color: var(--color-subtext); /* 默认图标色 */
  transition: color 0.3s ease;
  vertical-align: middle; /* ✅ 让图标在文字中垂直居中 */
}

.sidebar :deep(.el-menu-item.is-active .sidebar-icon) {
  color: var(--color-primary); /* 激活项图标色 */
}

.sidebar :deep(.el-menu-item:hover .sidebar-icon) {
  color: var(--color-text); /* 悬停时图标变亮 */
}

.sidebar.collapsed {
  width: 64px;
}

.collapse-btn-wrapper {
  position: absolute;
  top: 10px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 100;
}

.sidebar.collapsed .collapse-btn-wrapper {
  left: auto;
  right: 10px;
}

.el-button .el-icon-s-unfold {
  transform: rotate(0deg);
}

.sidebar.collapsed .el-button .el-icon-s-unfold {
  transform: rotate(180deg);
}

.el-button {
  background: transparent !important;
  position: relative;
}

.el-button .el-icon {
  z-index: 10;
  color: var(--color-primary);
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: var(--color-bg);
  width: 100%;
  color: var(--color-text);
}

@media (max-width: 992px) {
  .content-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
  }

  .main-content {
    width: 100%;
    height: auto;
  }
}
</style>
