<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { ROUTER_NAME } from '../../router'

export type MenuItem = {
  label: string
  to: { name: string; params?: Record<string, any> }
  children: MenuItem[]
}

const props = withDefaults(
  defineProps<{
    menuItemList?: MenuItem[]
  }>(),
  { menuItemList: () => [] },
)

const route = useRoute()

const isCurrentRoute = (menuItem: MenuItem) => {
  if (route.name !== menuItem.to.name) {
    return false
  }
  if (route.name === ROUTER_NAME.CONTENT && menuItem.to.params?.pathMatch) {
    const pathMatchString = (route.params.pathMatch as string[]).join('/')
    if (pathMatchString !== route.fullPath) {
      return false
    }
  }
  return true
}
</script>

<template>
  <div v-for="(menuItem, index) in menuItemList" :key="index">
    <RouterLink :to="menuItem.to" :class="'menu-item' + (isCurrentRoute(menuItem) ? ' router-link-active' : '')">
      {{ menuItem.label }}
    </RouterLink>
    <div v-if="menuItem.children.length" class="menu-children">
      <SidebarMenuItem :menu-item-list="menuItem.children" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu-item {
  display: block;
  padding: 0.46rem 0.7rem;
  color: var(--c-text-soft);
  text-decoration: none;
  border-radius: 10px;
  border: 1px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--c-border);
    color: var(--c-text);
    background: var(--c-surface-1);
  }
}
.menu-children {
  margin: 0.14rem 0 0.32rem;
  padding-left: 0.7rem;
  border-left: 1px dashed var(--c-border);
}
.menu-item.router-link-active {
  border-color: color-mix(in srgb, var(--c-primary) 45%, var(--c-border));
  background: color-mix(in srgb, var(--c-primary) 16%, transparent);
  color: var(--c-primary);
}
</style>
