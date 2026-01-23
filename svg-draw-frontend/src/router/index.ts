import { createRouter, createWebHistory } from 'vue-router'
import SvgDrawList from '../pages/SvgDrawList.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: SvgDrawList,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
