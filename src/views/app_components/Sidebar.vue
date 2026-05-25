<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { CategoryMenu } from '../../model/category_menu.model'
import { ROUTER_NAME } from '../../router'
import { useCategoryStore } from '../../stores/category.store'
import { usePostStore } from '../../stores/post.store'
import type { MenuItem } from './SidebarMenuItem.vue'
import SidebarMenuItem from './SidebarMenuItem.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const categoryStore = useCategoryStore()
const postStore = usePostStore()

const sideBarType = ref<'MANAGER' | 'CATEGORY' | 'POST'>('CATEGORY')
const menu = ref<MenuItem[]>([])

watch(
  () => route.path,
  async (path) => {
    menu.value = [{ label: 'HOME', to: { name: ROUTER_NAME.HOME }, children: [] }]
    if (path.startsWith('/manage')) {
      sideBarType.value = 'MANAGER'
      const menuItemList = [
        { label: 'Category Manager', to: { name: ROUTER_NAME.MANAGER_CATEGORY_MANAGER }, children: [] },
        { label: 'Post Editor', to: { name: ROUTER_NAME.MANAGER_POST_EDIT }, children: [] },
      ]
      menu.value.push(...menuItemList)
    } else if (path.endsWith('.md')) {
      sideBarType.value = 'POST'
      const filePath = path
      const folderPath = filePath.split('/').slice(0, -1).join('/')
      const postMenuList = await postStore.getPostMenuListByFolderPath(folderPath)
      postMenuList.forEach((postInfo) => {
        menu.value.push({
          label: `${postInfo.order}. ${postInfo.title}`,
          to: { name: ROUTER_NAME.CONTENT, params: { pathMatch: postInfo.filePath.split('/').filter(Boolean) } },
          children: [],
        })
      })
    } else {
      sideBarType.value = 'CATEGORY'
      const menuItemTree: MenuItem[] = []
      const mapMenu = (miList: MenuItem[], ciList: CategoryMenu[]) => {
        ciList.forEach((categoryInfo) => {
          const menuItem: MenuItem = {
            label: categoryInfo.title,
            to: {
              name: ROUTER_NAME.CONTENT,
              params: { pathMatch: categoryInfo.folderPath.split('/').filter(Boolean) }, // thêm filter vì router tự động thêm '/'
            },
            children: [],
          }
          mapMenu(menuItem.children, categoryInfo.categoryList)
          miList.push(menuItem)
        })
      }
      mapMenu(menuItemTree, categoryStore.categoryMenuTree)
      menu.value.push(...menuItemTree)
    }
  },
  { immediate: true },
)
</script>

<template>
  <aside class="sidebar" :class="{ open: props.open }">
    <div class="head">
      <strong>Knowledge Base</strong>
      <button class="icon" @click="emit('close')">x</button>
    </div>

    <section class="section">
      <SidebarMenuItem :menu-item-list="menu" />
    </section>
  </aside>
</template>

<style scoped lang="scss">
.sidebar {
  width: 290px;
  border-right: 1px solid var(--c-border);
  background: color-mix(in srgb, var(--c-bg-elevated) 88%, transparent);
  padding: 1rem 0.8rem;
  overflow: auto;
}

.head {
  display: none;
}

.section {
  margin-top: 0.4rem;
  display: grid;
  gap: 0.3rem;
}

.icon {
  border: 1px solid var(--c-border);
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  background: var(--c-surface-1);
  color: var(--c-text-soft);

  &:hover {
    color: var(--c-primary);
    border-color: var(--c-primary);
  }
}

@media (max-width: 960px) {
  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 60;
    background: var(--c-surface-1);
    transform: translateX(-100%);
    transition: transform 0.22s ease;
    max-width: 82vw;
    box-shadow: var(--shadow-soft);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
}
</style>
