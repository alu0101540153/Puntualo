import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/Loginview.vue'
import RegisterView from '../views/Register.vue'
import DashboardView from '../views/DashboardView.vue'
import SearchView from '../views/SearchView.vue'
import { getToken } from '@/services/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    }
    ,
    {
      path: '/search',
      name: 'search',
      component: SearchView,
    }
  ],
})

// Guard global simple: protege /dashboard y evita entrar a /login o /register si ya hay token
router.beforeEach((to, from, next) => {
  const token = getToken()

  if (to.path === '/dashboard' && !token) {
    // usuario no autenticado -> login
    return next('/login')
  }

  if ((to.path === '/login' || to.path === '/register') && token) {
    // si ya está autenticado, no permitir ver login/register
    return next('/dashboard')
  }

  return next()
})

export default router
