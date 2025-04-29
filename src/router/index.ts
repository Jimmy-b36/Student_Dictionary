import { checkAuth } from '@/router/middleware'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'

import StudentView from '@/views/student/StudentView.vue'
import TeacherView from '@/views/TeacherView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
      name: 'Home',
      component: HomeView
    },
    {
      path: '/',
      redirect: { name: 'Home' }
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView
    },
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: LoginView
    },
    {
      path: '/home/student/:id',
      name: 'Student',
      component: StudentView
    },
    {
      path: '/home/teacher',
      name: 'Teacher',
      component: TeacherView
    }
  ]
})

router.beforeEach((to) => {
  // check if the user is authenticated
  if (to.name !== 'Login' && to.name !== 'AdminLogin') {
    const isAuth = checkAuth()
    if (!isAuth) return { name: 'Login' }
  }
  return true
})

export default router
