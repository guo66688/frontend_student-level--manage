// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import CoursesView from '../views/CoursesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login', // 初始重定向到登录页
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView, // 登录页面不使用 Layout
    },
    {
      path: '/home',
      name: 'Home',
      component: HomeView, // 使用全局布局
      meta: { requiresAuth: true },
    },
    {
      path: '/courses',
      name: 'Courses',
      component: CoursesView, // 使用全局布局
      meta: { requiresAuth: true },
    },
    // 其他路由...
  ]
})

export default router
