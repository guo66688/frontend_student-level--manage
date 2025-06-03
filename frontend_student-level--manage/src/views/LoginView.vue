<template>
  <div class="login-page">
    <!-- 顶栏 -->
    <header class="login-header">
      <div class="login-title">学生管理系统</div>
    </header>

    <!-- 主内容区 -->
    <main class="login-main">
      <el-card class="login-card">
        <!-- 内容容器 -->
        <div class="card-content">
          <h2 class="login-form-title">登录</h2>
          <!-- 修正点：移除了标签属性内的注释 -->
          <el-form :model="form" :rules="rules" ref="loginForm" label-position="top" status-icon>
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
              <el-button type="primary" class="login-button" @click="handleLogin" :loading="loading"
                >立即登录</el-button
              >
            </el-form-item>
          </el-form>
          <div class="login-footer">
            <a href="#">忘记用户名</a>
            <span>｜</span>
            <a href="#">忘记密码</a>
          </div>
        </div>
      </el-card>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/auth'

const router = useRouter()
const loading = ref(false)

const form = ref({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const loginForm = ref()

const handleLogin = async () => {
  await loginForm.value.validate()
  loading.value = true
  try {
    const res = await login(form.value)
    localStorage.setItem('token', res.data.token)
    ElMessage.success('登录成功')
    router.push('/')
  } catch {
    ElMessage.error('登录失败，请检查账号密码')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 页面根容器 */
.login-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #e8edf3 50%, #f3f6f9 100%);
  overflow: hidden;
}

/* 顶栏：标题居中 */
.login-header {
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.login-title {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
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

/* 登录卡片 */
.login-card {
  width: 100%;
  max-width: 420px;
  padding: 30px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  /* 修正点：移除 display: flex */
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

/* 按钮样式 */
.login-button {
  width: 100%;
  height: 48px;
  font-size: 17px;
  font-weight: 600;
  border-radius: 10px;
  margin-top: 10px;
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
