import { checkAuth } from '@/router/middleware';

import LoginView from '@/views/LoginView.vue';

import DictionaryEntryView from '@/views/DictionaryEntryView.vue';
import DictionaryView from '@/views/DictionaryView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import StudentView from '@/views/student/StudentView.vue';
import TeacherView from '@/views/TeacherView.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'Home' },
    },
    {
      path: '/home',
      name: 'Home',
      component: TeacherView,
    },
    {
      path: '/home/dictionary',
      name: 'Dictionary',
      component: DictionaryView,
    },
    {
      path: '/home/dictionary/add',
      name: 'DictionaryEntry',
      component: DictionaryEntryView,
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
    },
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: LoginView,
    },
    {
      path: '/home/student/:id',
      name: 'Student',
      component: StudentView,
    },
    {
      path: '/home/teacher',
      name: 'Teacher',
      component: TeacherView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView,
    },
  ],
});

router.beforeEach((to) => {
  // check if the user is authenticated
  if (to.name !== 'Login' && to.name !== 'AdminLogin') {
    const isAuth = checkAuth();
    if (!isAuth) return { name: 'Login' };
  }
  return true;
});

export default router;
