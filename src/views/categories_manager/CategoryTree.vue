<script setup lang="ts">
import { CategoryMenu } from '../../model/category_menu.model'

const emit = defineEmits<{
  (e: 'edit-category', data: CategoryMenu): void
}>()

const props = withDefaults(
  defineProps<{
    categoryMenuList?: CategoryMenu[]
  }>(),
  { categoryMenuList: () => [] },
)
</script>

<template>
  <ul class="folder-list">
    <template v-for="categoryMenu in categoryMenuList" :key="categoryMenu.folderPath">
      <li class="folder-row" :style="{ paddingLeft: `${12 + (categoryMenu.level - 1) * 22}px` }">
        <div class="folder-main">
          <strong>{{ categoryMenu.title }}</strong>
          <small>{{ categoryMenu.folderPath }}</small>
        </div>
        <button v-if="categoryMenu.level > 0" class="edit-link" @click="emit('edit-category', categoryMenu)">
          Edit
        </button>
      </li>
      <CategoryTree :categoryMenuList="categoryMenu.categoryList" @edit-category="emit('edit-category', $event)" />
    </template>
  </ul>
</template>

<style scoped>
.folder-list {
  list-style: none;
  margin: 0;
  padding: 0;
  background: var(--c-surface-1);
  overflow: hidden;
}

.folder-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 0.72rem;
  padding-right: 0.9rem;
  padding-bottom: 0.72rem;
  border: 1px solid var(--c-border);
}

.folder-main {
  display: grid;
  gap: 0.2rem;
}

.folder-main strong {
  font-size: 0.95rem;
}

.folder-main small {
  color: var(--c-text-soft);
}

.edit-link {
  border: none;
  background: transparent;
  color: var(--c-primary);
  cursor: pointer;
  font-weight: 600;
  padding: 0;
}

.edit-link:hover {
  text-decoration: underline;
}
</style>
