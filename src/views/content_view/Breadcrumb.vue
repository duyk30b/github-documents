<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { IconHome } from '../../common/icon-antd'
import { useCategoryStore } from '../../stores/category.store'

const route = useRoute()

const categoryStore = useCategoryStore()
const breadcrumbItems = ref<Array<{ label: string; to: string }>>([])

watch(
  () => route.path,
  (path) => {
    const segmentList = path.split('/')
    let folderPath = segmentList.join('/')
    if (segmentList.length && segmentList[segmentList.length - 1].includes('.')) {
      segmentList.pop()
      folderPath = segmentList.join('/')
    }

    const categoryTreeList = categoryStore.getCategoryMenuListByFolderPath(folderPath)

    breadcrumbItems.value = categoryTreeList.map((category) => {
      return {
        label: category.title,
        to: category.folderPath,
      }
    })
  },
  { immediate: true },
)
</script>

<template>
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol>
      <li>
        <RouterLink to="/">
          <IconHome />
        </RouterLink>
      </li>
      <li v-for="(item, index) in breadcrumbItems" :key="`${item.label}-${index}`">
        <RouterLink :to="item.to">{{ item.label }}</RouterLink>
      </li>
    </ol>
  </nav>
</template>

<style scoped lang="scss">
.breadcrumb ol {
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.34rem;
  list-style: none;
}

.breadcrumb li {
  display: inline-flex;
  align-items: center;
  gap: 0.36rem;
  color: var(--c-text-soft);
  font-size: 0.88rem;
}

.breadcrumb li + li::before {
  content: '/';
  color: var(--c-border);
}

.breadcrumb a {
  color: var(--c-text-soft);
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.2rem 0.48rem;
}

.breadcrumb a:hover {
  border-color: var(--c-border);
  color: var(--c-primary);
  background: var(--c-surface-1);
}
</style>
