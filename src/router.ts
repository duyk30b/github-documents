import { createRouter, createWebHashHistory } from 'vue-router'
import CategoryManagerView from './views/categories_manager/CategoryManagerView.vue'
import PostEditView from './views/content_edit/PostEditView.vue'
import ContentView from './views/content_view/ContentView.vue'

export const ROUTER_NAME = {
  HOME: 'Home',
  CONTENT: 'Content',
  MANAGER_POST_EDIT: 'ManagerPostEdit',
  MANAGER_CATEGORY_MANAGER: 'ManagerCategoryManager',
} as const

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: ROUTER_NAME.HOME,
      component: ContentView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: ROUTER_NAME.CONTENT,
      component: ContentView,
      props: true,
    },
    {
      path: '/manager/post-edit',
      name: ROUTER_NAME.MANAGER_POST_EDIT,
      component: PostEditView,
      props: true,
    },
    {
      path: '/manager/category-manager',
      name: ROUTER_NAME.MANAGER_CATEGORY_MANAGER,
      component: CategoryManagerView,
    },
  ],
})
