// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import CoursesView from '../views/CoursesView.vue'
import StudentsView from '../views/StudentsView.vue'
import ScoresView from '../views/ScoresView.vue'
import ClassesView from '../views/ClassesView.vue'
import RanksView from '../views/RanksView.vue'
import ChartsView from '@/views/ChartsView.vue'

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

      children: [
        {
          path: '',
          component: HomeView,
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/courses',
      name: 'Courses',

      children: [
        {
          path: '',
          component: CoursesView,
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/students',
      name: 'Students',
      children: [
        {
          path: '',
          component: StudentsView,
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/scores',
      name: 'Scores',

      children: [
        {
          path: '',
          component: ScoresView,
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/classes',
      name: 'Classes',

      children: [
        {
          path: '',
          component: ClassesView,
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/ranks',
      name: 'Ranks',

      children: [
        {
          path: '',
          component: RanksView,
          meta: { requiresAuth: true },
        },
      ],
    },
    {
      path: '/charts',
      name: 'Charts',
      children: [
        {
          path: '',
          component: ChartsView,
          meta: { requiresAuth: true },
        },
      ],
    },
    // 其他路由...
  ],
})

export default router
