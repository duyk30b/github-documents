<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconClose } from '../../common/icon-antd'
import { InputNumber, InputSelect, InputText, type InputSelectOption } from '../../common/vue-form'
import { VueModal } from '../../common/vue-modal'
import VueButton from '../../common/VueButton.vue'
import { CategoryMenu } from '../../model/category_menu.model'
import { useCategoryStore } from '../../stores/category.store'
import { ESString } from '../../utils/string.util'
import BugDevelopment from '../app_components/BugDevelopment.vue'
import { AlertStore } from '../../common/vue-alert'

const emit = defineEmits<{
  (e: 'success', type: 'CREATE' | 'UPDATE' | 'DESTROY'): void
}>()

const showModal = ref(false)
const saveLoading = ref(false)
const mode = ref<'CREATE' | 'UPDATE'>('CREATE')

const categoryStore = useCategoryStore()

const oldCategoryMenu = ref<CategoryMenu>(CategoryMenu.blank())
const categoryMenu = ref<CategoryMenu>(CategoryMenu.blank())

watch(
  () => [categoryMenu.value.title, categoryMenu.value.parentPath],
  ([newTitle, newParentPath]) => {
    const folderName = ESString.slugify(newTitle)
    const folderPath = ESString.joinPath(newParentPath, folderName)
    categoryMenu.value.folderName = folderName
    categoryMenu.value.folderPath = folderPath
    categoryMenu.value.level = folderPath.split('/').filter(Boolean).length
  },
)

const openModal = (type: 'CREATE' | 'UPDATE', categoryMenuProp?: CategoryMenu) => {
  showModal.value = true
  mode.value = type
  if (categoryMenuProp) {
    oldCategoryMenu.value = CategoryMenu.from(categoryMenuProp)
    categoryMenu.value = CategoryMenu.from(categoryMenuProp)
  }
}

const reset = () => {
  categoryMenu.value = CategoryMenu.blank()
  oldCategoryMenu.value = CategoryMenu.blank()
}

const closeModal = () => {
  reset()
  showModal.value = false
}

const parentPathOptions = computed(() => {
  const options: InputSelectOption<any>[] = [{ value: '', label: 'ROOT /' }]
  const addOptions = (catMenuTree: CategoryMenu[]) => {
    catMenuTree.forEach((c) => {
      options.push({
        value: c.folderPath,
        label: `${' -- '.repeat(c.level - 1)} ${c.title}`,
      })
      addOptions(c.categoryList)
    })
  }
  addOptions(categoryStore.categoryMenuTree)
  return options
})

const handleSave = async () => {
  if (!categoryMenu.value.title.trim() || !categoryMenu.value.folderName.trim()) {
    return AlertStore.addError('Title is required')
  }
  try {
    saveLoading.value = true
    if (mode.value === 'CREATE') {
      await categoryStore.createCategoryMenu(categoryMenu.value)
      emit('success', 'CREATE')
    }
    if (mode.value === 'UPDATE') {
      if (oldCategoryMenu.value.folderPath === categoryMenu.value.folderPath) {
        await categoryStore.updateCategoryMenu(oldCategoryMenu.value, categoryMenu.value)
      } else {
        await categoryStore.moveCategoryMenu(oldCategoryMenu.value, categoryMenu.value)
      }
      emit('success', 'UPDATE')
    }
    closeModal()
  } catch (error) {
    console.log('🚀 ~ ModalCategoryUpsert.vue:76 ~ handleSave ~ error:', error)
  } finally {
    saveLoading.value = false
  }
}

const clickDelete = async () => {
  const accepted = window.confirm('Delete this category and all posts?')
  if (!accepted) return

  try {
    saveLoading.value = true
    await categoryStore.deleteCategoryMenu(oldCategoryMenu.value)
    emit('success', 'DESTROY')
    closeModal()
  } catch (error) {
    console.log('🚀 ~ ModalCategoryUpsert.vue:97 ~ clickDelete ~ error:', error)
  } finally {
    saveLoading.value = false
  }
}

defineExpose({ openModal })
</script>
<template>
  <VueModal v-model:show="showModal">
    <form class="bg-white" @submit.prevent="handleSave">
      <div class="pl-4 py-4 flex items-center" style="border-bottom: 1px solid #dedede">
        <div class="flex-1 text-lg font-medium">
          {{ mode === 'UPDATE' ? 'Update Category' : 'Create Category' }}
        </div>
        <div class="px-4 cursor-pointer">
          <BugDevelopment :data="categoryMenu" />
        </div>
        <div style="font-size: 1.2rem" class="px-4 cursor-pointer" @click="closeModal">
          <IconClose />
        </div>
      </div>
      <div class="mt-4 px-4">
        <div class="">
          <div>Parent</div>
          <div>
            <InputSelect v-model:value="categoryMenu.parentPath" :options="parentPathOptions" />
          </div>
        </div>
        <div class="mt-4">
          <div>Title</div>
          <InputText v-model:value="categoryMenu.title" />
          <small class="text-gray-500 italic">Folder path: {{ categoryMenu.folderPath }}</small>
        </div>
        <div class="mt-4">
          <div>Order</div>
          <div>
            <InputNumber v-model:value="categoryMenu.order" />
          </div>
        </div>
      </div>

      <div class="p-4 mt-2">
        <div class="flex gap-4">
          <VueButton v-if="mode === 'UPDATE'" color="red" type="button" :loading="saveLoading" @click="clickDelete">
            Delete
          </VueButton>
          <VueButton style="margin-left: auto" type="reset" icon="close" @click="closeModal"> Cancel </VueButton>
          <VueButton color="blue" type="submit" :loading="saveLoading" icon="save"> Save </VueButton>
        </div>
      </div>
    </form>
  </VueModal>
</template>

<style scoped></style>
