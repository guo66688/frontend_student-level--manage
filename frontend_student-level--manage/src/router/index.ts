// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import CoursesView from '../views/CoursesView.vue'
import StudentsView from '../views/StudentsView.vue'
import ScoresView from '../views/ScoresView.vue'
import ClassesView from '../views/ClassesView.vue'
import RanksView from '../views/RanksView.vue'
import ChartsView from '@/views/ChartsView.vue'
// import AnalysisView from '@/views/AnalysisView.vue'
// import StatisticsView from '@/views/StatisticsView.vue'
import AN from '@/views/AN.vue'
import ST from '@/views/ST.vue'
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
    // 所有业务页面都包裹 Layout
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: 'home',
          name: 'Home',
          component: HomeView,
          meta: { requiresAuth: true },
        },
        {
          path: 'courses',
          name: 'Courses',
          component: CoursesView,
          meta: { requiresAuth: true },
        },
        {
          path: 'students',
          name: 'Students',
          component: StudentsView,
          meta: { requiresAuth: true },
        },
        {
          path: 'scores',
          name: 'Scores',
          component: ScoresView,
          meta: { requiresAuth: true },
        },
        {
          path: 'classes',
          name: 'Classes',
          component: ClassesView,
          meta: { requiresAuth: true },
        },
        {
          path: 'ranks',
          name: 'Ranks',
          component: RanksView,
          meta: { requiresAuth: true },
        },
        {
          path: 'charts',
          name: 'Charts',
          component: ChartsView,
          meta: { requiresAuth: true },
        },
        {
          path: 'analysis/view',
          name: 'analysis-view',
          component: AN,
          meta: { requiresAuth: true },
        },
        {
          path: 'analysis/data',
          name: 'analysis-data',
          component: ST,
          meta: { requiresAuth: true },
        },
      ],
    },
  ],
})

export default router
