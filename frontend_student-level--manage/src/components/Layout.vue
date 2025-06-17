<template>
  <div class="app-container">
    <!-- 状态栏 -->
    <header class="header">
      <div class="header-left">
        <img src="@/assets/logo.png" class="header-logo" />
        <span class="header-title">学生成绩管理系统</span>
        <ThemeToggle @toggle-theme="toggleTheme" />
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

          <!-- 新增菜单项 -->
          <el-menu-item index="/classes">
            <el-icon class="sidebar-icon"><School /></el-icon>
            <span>班级管理</span>
          </el-menu-item>



          <el-menu-item index="/charts">
            <el-icon class="sidebar-icon"><Picture /></el-icon>
            <span>图表管理</span>
          </el-menu-item>
          <el-menu-item index="/ranks">
            <el-icon class="sidebar-icon"><Rank /></el-icon>
            <span>排行榜</span>
          </el-menu-item>
        </el-menu>
        <!-- 统计分析折叠项 -->
          <el-collapse v-model="activeNames" class="collapse-container">
            <el-collapse-item title="统计分析" name="analysis">
              <template #title>
                <el-icon><DataAnalysis /></el-icon> <!-- 添加图标 -->
                <span>统计分析</span>
              </template>
              <el-menu class="submenu">
                <el-menu-item index="/analysis/view">
                  <span>分析视图</span>
                </el-menu-item>
                <el-menu-item index="/analysis/data">
                  <span>数据统计</span>
                </el-menu-item>
              </el-menu>
            </el-collapse-item>
          </el-collapse>
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>


<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import {
  HomeFilled,
  UserFilled,
  Notebook,
  Document,
  DataAnalysis,
  School,
  Rank,
  Picture,
} from '@element-plus/icons-vue'

const route = useRoute()
const isCollapsed = ref(false)

const logout = () => {
  localStorage.removeItem('token')
  window.location.href = '/login'
}

const toggleTheme = () => {
  const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark'
  document.body.classList.toggle('dark', newTheme === 'dark')
  updateThemeColors(newTheme)
  window.location.reload()
}

const updateThemeColors = (theme: 'light' | 'dark') => {
  if (theme === 'dark') {
    document.documentElement.style.setProperty('--color-bg', '#25294d')
    document.documentElement.style.setProperty('--color-text', '#e4e8f3')
  } else {
    document.documentElement.style.setProperty('--color-bg', '#ffffff')
    document.documentElement.style.setProperty('--color-text', '#000000')
  }
}

const activeNames = ref(['analysis'])  // 默认展开统计分析项
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

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
  justify-content: center;
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
  align-items: stretch;
  border-radius: 0 8px 8px 0;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);
  color: var(--color-text);
}

.sidebar :deep(.el-menu) {
  width: 100%;
  box-shadow: none !important;
  border-right: none !important;
}

.sidebar.collapsed {
  width: 64px;
}

.collapse-btn-wrapper {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%); /* 居中按钮 */
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 100;
}

.sidebar.collapsed .collapse-btn-wrapper {
  left: auto;
  right: 10px;
  transform: none; /* 在折叠状态下，按钮右对齐 */
}

/* collapse-container 样式 */
.collapse-container {
  padding-left: 20px;
  margin-bottom: 5px;
  background-color: transparent;
}

/* 确保 el-menu 和 el-menu-item 居中对齐 */
::v-deep .el-menu {
  background-color: var(--color-card) !important; /* 背景色 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* 保证顶部对齐 */
  align-items: stretch; /* 使子菜单项宽度占满父容器 */
  padding-left: 0 !important; /* 去除不必要的左侧缩进 */
  width: 100%;
  margin: 0; /* 清除默认的margin */
}

/* 确保子菜单项的宽度占满父容器 */
::v-deep .el-menu-item {
  background-color: var(--color-card) !important; /* 背景色 */
  display: flex;
  justify-content: center !important; /* 水平居中 */
  align-items: center !important; /* 垂直居中 */
  font-weight: 500;
  font-size: 14px;
  padding: 10px 20px !important; /* 内边距 */
  width: 100%; /* 确保子菜单项宽度占满父容器 */
}
/* 确保子菜单项激活和悬停时的样式一致 */
::v-deep .el-menu-item.is-active {
  color: var(--color-primary) !important; /* 激活项颜色 */
  background-color: transparent !important; /* 背景透明 */
  font-weight: 600; /* 加粗 */
}

::v-deep .el-menu-item:hover {
  background-color: var(--color-panel) !important; /* 悬停时背景色 */
  color: var(--color-text) !important; /* 悬停时文本颜色 */
}

/* 确保折叠项标题居中 */
::v-deep .el-collapse-item__header {
  background-color: var(--color-card) !important;  /* 设置背景色 */
  padding: 20px 50px !important; /* 内边距 */
  display: flex;
  justify-content: center !important; /* 水平居中对齐 */
  align-items: center !important; /* 垂直居中对齐 */
  font-weight: 600 !important; /* 加粗 */
  font-size: 14px !important; /* 字体大小 */
  color: var(--color-text) !important; /* 文本颜色 */
  width: 100% !important; /* 确保宽度占满父容器 */
  box-sizing: border-box;
  border: none !important; /* 清除默认的边框 */
  flex-wrap: nowrap !important; /* 确保子元素不换行 */
}


/* 让图标居中且与文本之间有一定间距 */
::v-deep .el-collapse-item__title {
  background-color: var(--color-card) !important;
  display: flex; /* 使用flex布局 */
  justify-content: flex-start; /* 图标和标题左对齐 */
  align-items: center; /* 垂直居中对齐 */
  font-weight: 600; /* 加粗 */
  font-size: 14px; /* 字体大小 */
  color: var(--color-text) !important; /* 设置文本颜色 */
  width: 100%; /* 确保宽度占满父容器 */
  gap: 5px; /* 图标和文本之间的间距 */
}
/* 控制折叠项图标位置 */
::v-deep .el-collapse-item__header i {
  margin-right: 10px; /* 图标和标题之间的间距 */
  order: 0;  /* 确保图标在标题前 */
  flex-shrink: 0; /* 防止图标被压缩 */
}

/* 确保折叠项的内容区域有合适的内边距 */
::v-deep .el-collapse-item__content {
  background-color: var(--color-card) !important; /* 背景色 */
  padding: 10px 20px !important; /* 内容内边距 */
  height: auto !important; /* 自动高度 */
  box-sizing: border-box;
}
::v-deep .el-collapse {
  background-color: var(--color-card) !important; /* 背景色 */
  width: 100% !important;  /* 确保折叠容器宽度适应父容器 */
  box-sizing: border-box;
  background-color: transparent !important;  /* 设置背景透明 */
}
/* 确保折叠按钮在缩小状态下正确对齐 */
.collapse-btn-wrapper {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 100;
}

.sidebar.collapsed .collapse-btn-wrapper {
  left: auto;
  right: 10px;
  transform: none; /* 在折叠状态下，按钮右对齐 */
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
