<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { CategoryMenu } from '../../model/category_menu.model'
import type { PostMenu } from '../../model/post_menu.model'
import { ROUTER_NAME } from '../../router'
import { useAuthStore } from '../../stores/auth.store'
import { useCategoryStore } from '../../stores/category.store'
import { usePostStore } from '../../stores/post.store'
import { ESTimer } from '../../utils/timer.util'
import Breadcrumb from './Breadcrumb.vue'

const props = defineProps<{
  folderPath: string
}>()

const authStore = useAuthStore()
const categoryStore = useCategoryStore()
const postStore = usePostStore()

const categoryCurrent = ref(CategoryMenu.blank())
const postMenuList = ref<PostMenu[]>([])

watch(
  () => props.folderPath,
  async (folderPath: string) => {
    categoryCurrent.value = categoryStore.getCategoryMenuByFolderPath(folderPath)

    if (categoryCurrent.value.folderPath !== '/' && categoryCurrent.value.folderPath !== '') {
      postMenuList.value = await postStore.getPostMenuListByFolderPath(categoryCurrent.value.folderPath)
    } else {
      postMenuList.value = []
    }
  },
  { immediate: true },
)
</script>

<template>
  <section class="folder">
    <div class="toolbar">
      <Breadcrumb />
      <RouterLink
        v-if="authStore.isAuthenticated && categoryCurrent.folderPath !== '/' && categoryCurrent.folderPath !== ''"
        class="small"
        :to="{ name: ROUTER_NAME.MANAGER_POST_EDIT, query: { mode: 'CREATE', parentPath: categoryCurrent.folderPath } }"
      >
        Create Post
      </RouterLink>
    </div>

    <section class="panel">
      <h2>Sub Categories</h2>
      <div class="list">
        <div v-for="catChild in categoryCurrent.categoryList" :key="catChild.folderPath" class="category-wrapper">
          <RouterLink class="category-item" :to="`${catChild.folderPath}`">
            <strong>{{ catChild.title }}</strong>
          </RouterLink>
          <RouterLink
            v-for="cat in catChild.categoryList"
            :key="cat.folderPath"
            class="category-item"
            :to="`${cat.folderPath}`"
          >
            {{ cat.title }}
          </RouterLink>
        </div>
        <p v-if="categoryCurrent.categoryList.length === 0" class="empty">No sub category yet.</p>
      </div>
    </section>

    <section class="panel">
      <h2>Posts</h2>
      <div class="list">
        <RouterLink v-for="post in postMenuList" :key="post.filePath" class="item" :to="post.filePath">
          <strong>{{ post.title }}</strong>
          <span>{{ ESTimer.timeToText(post.publishedAt, 'hh:mm DD/MM/YYYY') }}</span>
        </RouterLink>
        <p v-if="postMenuList.length === 0" class="empty">No post in this category.</p>
      </div>
    </section>
  </section>
</template>

<style scoped lang="scss">
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.category-wrapper {
  border: 1px solid var(--c-border);
  border-radius: 14px;
  padding: 0.65rem;
  text-decoration: none;
  color: var(--c-text);
  background: var(--c-surface-1);
  display: grid;
  gap: 0.55rem;

  .category-item {
    border: 1px solid var(--c-border);
    border-radius: 10px;
    padding: 0.65rem;
    text-decoration: none;
    color: var(--c-text-soft);
    background: var(--c-surface-1);
    display: flex;
    justify-content: space-between;
    gap: 0.6rem;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--c-primary);
      color: var(--c-primary);
      transform: translateY(-1px);
    }
  }

  .category-item strong {
    color: var(--c-text);
  }
}

.folder {
  display: grid;
  gap: 1rem;
}

.panel {
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 0.95rem;
  background: var(--c-bg-elevated);
  box-shadow: var(--shadow-soft);
}

h2 {
  margin: 0;
  margin-bottom: 0.75rem;
  font-size: 1.02rem;
}

.list {
  display: grid;
  gap: 0.6rem;
}

.item {
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 0.65rem;
  text-decoration: none;
  color: var(--c-text-soft);
  background: var(--c-surface-1);
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--c-primary);
    color: var(--c-primary);
    transform: translateY(-1px);
  }

  strong {
    color: var(--c-text);
  }
}

.item span {
  color: var(--c-text-soft);
  font-size: 0.88rem;
}

.empty {
  margin: 0;
  color: var(--c-text-soft);
  font-style: italic;
}
</style>
