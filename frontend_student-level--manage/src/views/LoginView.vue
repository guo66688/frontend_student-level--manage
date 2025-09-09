<!-- src\views\LoginView.vue -->
<template>
  <div class="login-page">
    <header class="login-header">
      <div class="header-left">
        <img src="@/assets/logo.png" class="header-logo" />
        <span class="header-text">The Alchemists of Code</span>
      </div>
      <div class="login-title">学生管理系统</div>
    </header>

    <main class="login-main">
      <el-card class="login-card">
        <div class="card-content">
          <h2 class="login-form-title">登录</h2>
          <el-form ref="loginForm" :model="form" :rules="rules" label-position="top" status-icon>
            <el-form-item label="账号" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                class="login-button"
                @click="handleLogin"
                :loading="loading"
              >
                立即登录
              </el-button>
            </el-form-item>
          </el-form>
          <div class="login-footer">
            <a href="#">忘记用户名</a><span>｜</span><a href="#">忘记密码</a>
          </div>
        </div>
        <div class="card-stamp">
          <img src="@/assets/logo.png" />
        </div>
      </el-card>
    </main>

    <footer class="login-attribution">
      出自 <a href="https://your-site.com" target="_blank">The Alchemists of Code</a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/auth'
import type { LoginResponse } from '@/api/auth'

const router = useRouter()
const loading = ref(false)
const form = ref({ username: '', password: '' })
const loginForm = ref<InstanceType<(typeof import('element-plus'))['ElForm']>>()

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  await loginForm.value!.validate()
  loading.value = true
  try {
    // 明确告知 TS：login() 会返回 LoginResponse
    const res: LoginResponse = await login(form.value)
    const { msg, token } = res
    localStorage.setItem('token', token)
    ElMessage.success(msg)
    router.push({ name: 'Home' })
  } catch (err: any) {
    const tip = err.response?.data?.msg || err.message || '登录失败，请检查账号密码'
    ElMessage.error(tip)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 顶栏容器：中文标题居中，去掉左右 padding */
.login-header {
  position: relative;
  display: flex;
  justify-content: center; /* login-title 水平居中 */
  align-items: center;
  height: 60px;
  background: #fff;
  padding: 0; /* ← 去掉左右内边距，让 logo 能贴边 */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

/* 左侧 logo + 文案：绝对定位脱离文档流 */
.header-left {
  position: absolute; /* ← 改成绝对定位 */
  left: 16px; /* ← 距离左侧 16px，可按需改为 0 */
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
}

/* 背景渐变（保留伪元素效果） */
.header-left::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  width: 46px;
  height: 32px;
  background: linear-gradient(135deg, #e0f7fa, #f3f6f9);
  border-radius: 8px;
  transform: translateY(-50%);
  z-index: -1;
}

/* Logo 圆形背景 + 阴影 */
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
    box-shadow 0.3s;
}
.header-logo:hover {
  transform: scale(1.05) rotate(3deg);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}
/* 文案样式 */
.header-text {
  font-size: 12px;
  font-weight: 700;
  color: #333;
  letter-spacing: 1px;
  transition: color 0.2s;
}
.header-text:hover {
  color: #017ffc;
}

/* 保留原本的登录页中文标题样式 */
.login-title {
  font-size: 20px;
  font-weight: bold;
  color: #000004c0;
}

/* 页面根容器 */
.login-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;

  /* ------------ 修改这里 ------------ */
  /* 用半透明白层 + 壁纸 做背景 */
  background:
    /* 1. 让内容区变得更通透 */
    linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)),
    /* 2. 链接 public/ 下的 wallpaper.jpg */ url('/wallpaper.jpg') center/cover no-repeat;
}

/* 主内容区 */
.login-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}
@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* 登录卡片 */
.login-card {
  position: relative; /* 确保内部绝对定位生效 */
  width: 100%;
  max-width: 480px;
  padding: 30px;
  border-radius: 12px;
  animation: slideUpFade 0.6s ease-out both;
  /* background: #fff; */
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  /* 修正点：移除 display: flex */
}
/* 卡片右下角的小徽章 */
.card-stamp {
  position: absolute;
  right: 12px; /* 距离右边 12px */
  bottom: 12px; /* 距离底部 12px */
  width: 24px;
  height: 24px;
  opacity: 0.3; /* 半透明效果，可调整 */
  pointer-events: none; /* 保证不影响卡片内交互 */
}

.card-stamp img {
  width: 100%;
  height: 100%;
  display: block;
}
/* 卡片内容容器 - 确保内容居中 */
.card-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 标题样式 */
.login-form-title {
  text-align: center;
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 30px;
  width: 100%;
  padding: 0 10px;
}

/* 表单样式 - 修正偏移 */
:deep(.el-form) {
  width: 100%;
  max-width: 320px;
}

/* 修正表单项标签位置 */
:deep(.el-form-item__label) {
  display: block;
  text-align: left;
  padding: 0 0 8px 0;
  margin-left: 0;
  font-weight: normal;
  color: #606266;
}

/* 表单项样式 */
:deep(.el-form-item) {
  width: 100%;
  margin-bottom: 20px;
}

/* 输入框样式 */
:deep(.el-input) {
  width: 100%;
}
:deep(.el-input__inner) {
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
:deep(.el-input__inner):focus {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
}

/* 按钮样式 */
.login-button {
  width: 100%;
  height: 48px;
  font-size: 17px;
  font-weight: 600;
  border-radius: 10px;
  margin-top: 10px;
  background-image: linear-gradient(135deg, #409eff, #79b8ff);
  border: none;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}
/* 底部链接样式 */
.login-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: #999;
  display: flex;
  justify-content: center;
  gap: 15px;
  width: 100%;
}

.login-footer a {
  color: #409eff;
  text-decoration: none;
}
/* 1. 去掉 .el-input 容器的默认 focus outline */
:deep(.el-input):focus,
:deep(.el-input):focus-within {
  outline: none !important;
}

/* 2. 去掉 .el-input__inner 原生的 outline（若有）*/
:deep(.el-input__inner):focus {
  outline: none !important;

  /* 3. 自定义一个偏小的 focus 阴影 */
  border-color: #409eff;
  box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.5);
}

/* 4. 同理，把 error 情况下的那个红色阴影收窄到 1px */
:deep(.el-form-item.is-error .el-input__inner) {
  box-shadow: 0 0 0 1px rgba(245, 92, 71, 0.5) !important;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .login-card {
    max-width: 100%;
    padding: 24px;
    box-shadow: none;
  }

  .login-form-title {
    font-size: 20px;
    margin-bottom: 20px;
  }

  :deep(.el-form) {
    max-width: 100%;
  }

  .login-button {
    height: 46px;
    font-size: 16px;
  }

  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  .login-footer {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
