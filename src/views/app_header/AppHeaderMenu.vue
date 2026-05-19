<script lang="ts" setup>
import { ref } from 'vue'
import { useCategoryStore } from '../../stores/category.store'

const categoryStore = useCategoryStore()

const openMenu = ref('')
</script>
<template>
  <nav class="menu">
    <div
      v-for="categoryMenu in categoryStore.categoryMenuTree"
      :key="categoryMenu.folderPath"
      class="item"
      @mouseenter="openMenu = categoryMenu.folderPath"
      @mouseleave="openMenu = ''"
    >
      <RouterLink class="top" :to="`${categoryMenu.folderPath}`">{{ categoryMenu.title }}</RouterLink>
      <div v-if="openMenu === categoryMenu.folderPath" class="dropdown">
        <RouterLink
          v-for="catChild in categoryMenu.categoryList"
          :key="catChild.folderPath"
          :to="`${catChild.folderPath}`"
        >
          {{ catChild.title }}
        </RouterLink>
      </div>
    </div>
  </nav>
</template>
<style lang="scss" scoped>
.menu {
  display: flex;
  align-items: center;
  gap: 0.28rem;

  .item {
    position: relative;

    .top {
      color: var(--c-text-soft);
      text-decoration: none;
      padding: 0.34rem 0.64rem;
      border-radius: 999px;
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }

    .top:hover {
      background: var(--c-surface-1);
      border-color: var(--c-border);
      color: var(--c-primary);
    }

    .dropdown {
      position: absolute;
      top: calc(100% + 0.28rem);
      left: 0;
      min-width: 240px;
      display: grid;
      gap: 0.2rem;
      padding: 0.62rem;
      border: 1px solid var(--c-border);
      border-radius: 14px;
      background: var(--c-surface-1);
      box-shadow: var(--shadow-soft);
      z-index: 5;
    }

    .dropdown a {
      color: var(--c-text-soft);
      text-decoration: none;
      padding: 0.38rem 0.52rem;
      border-radius: 9px;
    }

    .dropdown a:hover {
      background: var(--c-surface-2);
      color: var(--c-primary);
    }
  }
}
</style>
