import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/Loginview.vue'
import RegisterView from '../views/Register.vue'
import DashboardView from '../views/DashboardView.vue'
import ProfileView from '../views/ProfileView.vue'
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
      path: '/faq',
      name: 'faq',
      component: () => import('../views/FAQView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    }
    ,
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    }
    ,
    {
      path: '/my-friends',
      name: 'my-friends',
      component: () => import('../views/MyFriendsView.vue')
    }
    ,
    {
      path: '/profile/edit',
      name: 'profile-edit',
      component: () => import('../views/EditProfileView.vue')
    }
    ,
    {
      path: '/items/:id',
      name: 'item-detail',
      component: () => import('../views/ItemDetail.vue'),
      props: true
    }
    ,
    {
      path: '/my-ratings',
      name: 'my-ratings',
      component: () => import('../views/MyRatingsView.vue')
    }
    ,
    {
      path: '/my-seen',
      name: 'my-seen',
      component: () => import('../views/MySeenView.vue')
    }
    ,
    {
      path: '/my-wishlist',
      name: 'my-wishlist',
      component: () => import('../views/MyWishlistView.vue')
    }
    ,
    {
      path: '/search',
      name: 'search',
      component: SearchView,
    }
    ,
    {
      path: '/users/:id/watching',
      name: 'user-watching',
      component: () => import('../views/UserWatchingView.vue'),
      props: true
    }
    ,
    {
      path: '/users/:id/seen',
      name: 'user-seen',
      component: () => import('../views/UserSeenView.vue'),
      props: true
    }
    ,
    {
      path: '/users/:id/common-seen',
      name: 'common-seen',
      component: () => import('../views/CommonSeenView.vue'),
      props: true
    }
    ,
    {
      path: '/users/:id/ratings',
      name: 'user-ratings',
      component: () => import('../views/UserRatingsView.vue'),
      props: true
    }
    ,
    {
      path: '/users/:id/friends',
      name: 'user-friends',
      component: () => import('../views/UserFriendsView.vue'),
      props: true
    }
    ,
    {
      path: '/recommendations',
      name: 'recommendations',
      component: () => import('../views/RecommendationsView.vue')
    }
    ,
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue')
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
