import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue';
import DraftView from '../views//Draft/DraftView.vue';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/draft',
      name: 'draft',
      // route level code-splitting
      // this generates a separate chunk (Draft.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: DraftView,
    }
  ]
})

export default router
