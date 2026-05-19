<script setup lang="ts">
import { onMounted, ref } from 'vue'
import VueButton from '../../common/VueButton.vue'
import { useCategoryStore } from '../../stores/category.store'
import CategoryTree from './CategoryTree.vue'
import ModalCategoryUpsert from './ModalCategoryUpsert.vue'

const modalCategoryUpsert = ref<InstanceType<typeof ModalCategoryUpsert>>()

const categoryStore = useCategoryStore()

const startFetchData = async () => {
  await categoryStore.loadCategoryMenuTree({ noCache: true })
}

onMounted(async () => {
  await startFetchData()
})

const handleModalCategoryUpsertSuccess = async () => {
  await startFetchData()
}
</script>

<template>
  <ModalCategoryUpsert ref="modalCategoryUpsert" @success="handleModalCategoryUpsertSuccess" />
  <section class="page">
    <header>
      <div class="flex gap-4 items-center">
        <h1>Category Manager</h1>
        <VueButton color="blue" @click="modalCategoryUpsert?.openModal('CREATE')">CREATE</VueButton>
      </div>
      <p>Manage nested categories. Folder name will always match slug.</p>
    </header>
    <div class="">
      <CategoryTree
        :categoryMenuList="categoryStore.categoryMenuTree"
        @edit-category="modalCategoryUpsert?.openModal('UPDATE', $event)"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.page {
  display: grid;
  gap: 1rem;
}

h1 {
  margin: 0;
}

p {
  margin: 0.3rem 0 0;
  color: var(--c-text-soft);
}
</style>
