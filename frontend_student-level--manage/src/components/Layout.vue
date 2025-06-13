<!-- src\components\Layout.vue -->
<template>
  <div class="app-container">
    <!-- 状态栏 -->
    <header class="header">
      <div class="header-left">
        <img src="@/assets/logo.png" class="header-logo" />
        <span class="header-title">学生成绩管理系统</span>
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
          background-color="#fff"
          text-color="#303133"
          active-text-color="#409EFF"
          unique-opened
        >
          <el-menu-item index="/home"> <i class="el-icon-s-home" /><span>首页</span> </el-menu-item>
          <el-menu-item index="/students">
            <i class="el-icon-user" /><span>学生管理</span>
          </el-menu-item>
          <el-menu-item index="/courses">
            <i class="el-icon-notebook-1" /><span>课程管理</span>
          </el-menu-item>
          <el-menu-item index="/scores">
            <i class="el-icon-document" /><span>成绩管理</span>
          </el-menu-item>
          <el-menu-item index="/analysis">
            <i class="el-icon-data-analysis" /><span>统计分析</span>
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

const route = useRoute()
const isCollapsed = ref(false)

const logout = () => {
  // 退出逻辑，比如清除 token 并重定向到登录页面
  localStorage.removeItem('token')
  window.location.href = '/login'
}
</script>

<style scoped>
/* 外层容器 */
.app-container {
  display: flex;
  flex-direction: column; /* 布局从上到下 */
  height: 100vh; /* 使用视口高度，确保页面填满整个视口 */
  overflow: hidden; /* 防止内容超出 */
}

/* 状态栏样式 */
.header {
  display: flex;
  justify-content: space-between; /* 左右对齐 */
  align-items: center; /* 垂直居中 */
  padding: 10px 20px;
  background: #ffffff;
  border-bottom: 1px solid #ebeef5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08); /* 更柔和的阴影效果 */
  height: 60px; /* 固定高度 */
  z-index: 1000; /* 保证状态栏在最上层 */
  position: relative; /* 确保 logo 和标题的定位基于这个容器 */
  border-radius: 8px 8px 0 0; /* 上边角圆角效果 */
}

/* logo + 标题容器 */
.header-left {
  display: flex;
  align-items: center;
  position: absolute; /* logo和标题使用绝对定位 */
  left: 16px; /* 距离左侧 16px */
  top: 50%;
  transform: translateY(-50%); /* 垂直居中 */
}

/* logo 样式 */
.header-logo {
  width: 32px;
  height: 32px;
  padding: 4px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  margin-right: 8px;
  transition:
    transform 0.3s,
    box-shadow 0.3s; /* 每个过渡效果独立设置 */
}

.header-logo:hover {
  transform: scale(1.05) rotate(3deg);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 标题样式 */
.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  letter-spacing: 1px;
}

/* 右侧用户信息 */
.user-info {
  display: flex;
  align-items: center;
  margin-left: auto; /* 将右侧信息右对齐 */
}

.el-avatar {
  margin-right: 10px;
}

/* 内容容器 */
.content-container {
  display: flex;
  flex: 1; /* 使用flex填充剩余空间 */
  overflow: hidden;
  width: 100%;
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #ebeef5;
  width: 240px;
  transition: width 0.2s;
  padding-top: 60px; /* 给状态栏以下预留空间放按钮 */
  overflow-y: auto;
  position: relative; /* 使折叠按钮定位相对于侧边栏 */
  border-radius: 0 8px 8px 0; /* 右下角圆角效果 */
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1); /* 侧边栏阴影效果 */
}

/* 侧边栏折叠状态 */
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

/* 当侧边栏折叠时，折叠按钮显示右箭头 */
.sidebar.collapsed .collapse-btn-wrapper {
  left: auto;
  right: 10px; /* 折叠时移动到右侧 */
}

/* 初始状态下按钮图标是左箭头 */
.el-button .el-icon-s-unfold {
  transform: rotate(0deg); /* 向左箭头 */
}

/* 折叠状态下按钮图标是右箭头 */
.sidebar.collapsed .el-button .el-icon-s-unfold {
  transform: rotate(180deg); /* 向右箭头 */
}
/* 确保按钮背景透明，避免按钮遮挡图标 */
.el-button {
  background: transparent !important; /* 强制按钮背景透明 */
  /* border: none; 去掉按钮边框 */
  position: relative;
}

/* 为按钮图标添加合适的层级 */
.el-button .el-icon {
  z-index: 10; /* 确保图标位于按钮上层 */
  color: #409eff; /* 设置为蓝色 */
}

/* 修改主内容区样式 */
.main-content {
  flex: 1; /* 使用flex填充剩余空间 */
  padding: 24px;
  overflow-y: auto;
  background: #f5f7fa;
  width: 100%; /* 确保宽度适应剩余空间 */
}

/* 响应式调整 */
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
