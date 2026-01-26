import { createRouter, createWebHistory } from 'vue-router'
import SvgDrawWorkspace from '../pages/SvgDrawWorkspace.vue'

const routes = [
  {
    path: '/',
    name: 'DrawWorkspace',
    component: SvgDrawWorkspace,
  },
  {
    path: '/draw/:id',
    name: 'DrawWorkspaceWithId',
    component: SvgDrawWorkspace,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
