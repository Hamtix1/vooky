import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '@/pages/Home.vue'
import Login from '@/pages/auth/Login.vue'
import Courses from '@/pages/dashboard/Courses.vue'
import CreateCourse from '@/pages/dashboard/CreateCourse.vue'
import EditCourse from '@/pages/dashboard/EditCourse.vue'
import CreateLevel from '@/pages/dashboard/CreateLevel.vue'
import CourseShow from '@/pages/dashboard/CourseShow.vue'
import CreateLesson from '@/pages/dashboard/CreateLesson.vue'
import { useAuthStore } from '@/store/auth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/dashboard/courses',
    name: 'Courses',
    component: Courses,
    meta: { requiresAuth: true, roles: ['admin', 'parent'] },
  },
  {
    path: '/dashboard/courses/create',
    name: 'CreateCourse',
    component: CreateCourse,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/dashboard/courses/:slug',
    name: 'CourseShow',
    component: CourseShow,
    meta: { requiresAuth: true, roles: ['admin', 'parent'] },
  },
  {
    path: '/dashboard/courses/:slug/edit',
    name: 'EditCourse',
    component: EditCourse,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/dashboard/courses/:slug/levels/create',
    name: 'CreateLevel',
    component: CreateLevel,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/dashboard/courses/:slug/levels/:levelId/lessons/create',
    name: 'CreateLesson',
    component: CreateLesson,
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/dashboard/courses/:slug/levels/:levelId/edit',
    name: 'EditLevel',
    component: () => import('@/pages/dashboard/EditLevel.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/dashboard/courses/:slug/levels/:levelId/lessons/:lessonId/edit',
    name: 'EditLesson',
    component: () => import('@/pages/dashboard/EditLesson.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/users',
    name: 'Users',
    component: () => import('@/pages/admin/Users.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/users/:userId/enrollments',
    name: 'UserEnrollments',
    component: () => import('@/pages/admin/UserEnrollments.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/dashboard/categories',
    name: 'CategoryManager',
    component: () => import('@/pages/dashboard/CategoryManager.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/dashboard/badges',
    name: 'BadgeManagement',
    component: () => import('@/pages/BadgeManagement.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('@/pages/UserProfile.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'parent'] },
  },
  {
    path: '/ranking',
    name: 'Ranking',
    component: () => import('@/pages/Ranking.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'parent'] },
  },
  {
    path: '/tuition-fees',
    name: 'TuitionFees',
    component: () => import('@/pages/TuitionFees.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'parent'] },
  },
  {
    path: '/admin/tuition-fees',
    name: 'AdminTuitionFees',
    component: () => import('@/pages/admin/TuitionFeesManagement.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/my-courses',
    name: 'MyCourses',
    component: () => import('@/pages/MyCourses.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'parent'] },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// --- GUARDIA DE NAVEGACIÓN GLOBAL MEJORADA ---
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // se usa los getters del store para una lógica más limpia y segura
  const isAuthenticated = auth.isAuthenticated
  const userRole = auth.getUserRole

  const requiresAuth = to.meta.requiresAuth
  const requiredRoles = to.meta.roles as string[] | undefined // TypeScript ahora sabe que esto es opcional

  if (isAuthenticated && to.name === 'Login') {
    // CASO 1: Usuario logueado intenta ir a Login -> Redirigir al dashboard.
    return next({ name: 'Courses' })
  }

  if (requiresAuth) {
    if (!isAuthenticated) {
      // CASO 2a: Ruta protegida y usuario no logueado -> Redirigir a Login.
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }

    // CASO 2b: Usuario logueado, pero la ruta requiere roles específicos.
    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(userRole ?? '')) {
      // No tiene el rol correcto. Redirigir a Home (o a una página de "Acceso Denegado").
      return next({ name: 'Home' })
    }
  }

  // CASO 3: El usuario puede pasar (ruta pública, o ruta protegida con autenticación y rol correctos).
  return next()
})

export default router
