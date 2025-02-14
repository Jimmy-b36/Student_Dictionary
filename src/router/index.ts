import { checkAuth } from '@/router/middleware'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView
    }
  ]
})

router.beforeEach((to, from) => {
  // check if the user is authenticated
  if (to.name !== 'Login') {
    const isAuth = checkAuth()
    if (!isAuth) return { name: 'Login' }
  }
  return true
})

export default router
