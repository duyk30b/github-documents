<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VueButton from '../../common/VueButton.vue'
import MonacoEditor from '../../common/monaco-editor/MonacoEditor.vue'
import { InputNumber, InputSelect, InputText, type InputSelectOption } from '../../common/vue-form'
import InputDate from '../../common/vue-form/InputDate.vue'
import { MarkdownRenderer } from '../../core/markdown.core'
import { useCategoryStore } from '../../stores/category.store'
import { usePostStore } from '../../stores/post.store'
import { ESString } from '../../utils/string.util'
import { PostContent } from '../../model/post_content.model'
import type { CategoryMenu } from '../../model/category_menu.model'

const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()
const postStore = usePostStore()

const postContentOrigin = ref(PostContent.blank())
const postContent = ref(PostContent.blank())

const previewHtml = ref('')
const mode = ref<'CREATE' | 'EDIT'>('CREATE')
const fetchLoading = ref(false)
const saveLoading = ref(false)

const parentPathOptions = computed(() => {
  const options: InputSelectOption<any>[] = []
  const addOptions = (catMenuList: CategoryMenu[]) => {
    catMenuList.forEach((c) => {
      options.push({
        value: c.folderPath,
        label: `${' -- '.repeat(c.level - 1)} ${c.title}`,
      })
      addOptions(c.categoryList || [])
    })
  }
  addOptions(categoryStore.categoryMenuTree)
  return options
})

onBeforeMount(async () => {
  try {
    mode.value = (route.query.mode as 'CREATE' | 'EDIT') || 'CREATE'
    if (mode.value === 'CREATE') {
      if (route.query.parentPath) {
        postContent.value.postInfo.parentPath = route.query.parentPath as string
      }
    }
    if (mode.value === 'EDIT') {
      try {
        fetchLoading.value = true
        const filePath = route.query.filePath as string
        postContentOrigin.value = await postStore.getPostContentByFilePath(filePath, { refetch: true, cache: 'reload' })
        postContent.value = PostContent.from(postContentOrigin.value)
      } catch (error) {
        console.error('Failed to fetch post data for editing:', error)
        window.alert('Failed to fetch post data for editing')
        // router.back()
      } finally {
        fetchLoading.value = false
      }
    }
  } catch (error) {
    console.error('Failed to fetch post data:', error)
  }
})

watch(
  () => [postContent.value.metadata.title, postContent.value.postInfo.parentPath],
  ([newTitle, newParentPath]) => {
    const fileName = ESString.slugify(newTitle) + '.md'
    const filePath = ESString.joinPath(newParentPath, fileName)
    postContent.value.postInfo.fileName = fileName
    postContent.value.postInfo.filePath = filePath
  },
)

watch(
  () => postContent.value.body,
  async (body) => {
    const rendered = await MarkdownRenderer.toHtml(postContent.value.body)
    previewHtml.value = rendered.html
  },
  { immediate: true },
)

const handleSave = async () => {
  if (!postContent.value.metadata.title.trim()) {
    return window.alert('Title is required')
  }
  if (!postContent.value.postInfo.parentPath || postContent.value.postInfo.parentPath === '/') {
    return window.alert('Category is required')
  }

  try {
    saveLoading.value = true
    if (mode.value === 'CREATE') {
      await postStore.createPostContent(postContent.value)
    } else if (mode.value === 'EDIT') {
      if (postContent.value.postInfo.filePath === postContentOrigin.value.postInfo.filePath) {
        await postStore.updatePostContent(postContentOrigin.value, postContent.value)
      } else {
        await postStore.deletePostContent(postContentOrigin.value)
        await postStore.createPostContent(postContent.value)
      }
    } else {
      window.alert('Invalid mode')
      return
    }
    await postStore.getPostMenuListByFolderPath(postContent.value.postInfo.parentPath, {
      refetch: true,
      cache: 'reload',
    })
    router.push({ path: postContent.value.postInfo.filePath })
  } catch (error) {
    console.error('Failed to save post data:', error)
    window.alert('Failed to save post data')
  } finally {
    saveLoading.value = false
  }
}

const clickDelete = async () => {
  const accepted = window.confirm('Delete this post?')
  if (!accepted) {
    return
  }

  try {
    saveLoading.value = true
    await postStore.deletePostContent(postContentOrigin.value)
    await postStore.getPostMenuListByFolderPath(postContentOrigin.value.postInfo.parentPath, {
      refetch: true,
      cache: 'reload',
    })
    await router.push({ path: postContentOrigin.value.postInfo.parentPath })
  } catch (error) {
    console.error('Failed to delete post data:', error)
    window.alert('Failed to delete post data')
  } finally {
    saveLoading.value = false
  }
}
</script>

<template>
  <section class="editor-page">
    <header class="head">
      <h1 v-if="mode === 'CREATE'">Create New Post</h1>
      <h1 v-if="mode === 'EDIT'">
        <span>Update Post: </span>
        <span v-if="fetchLoading">Loading...</span>
        <span v-else>{{ postContent.postInfo.filePath }}</span>
      </h1>
    </header>

    <form @submit.prevent="handleSave">
      <div class="flex flex-wrap items-center gap-4">
        <div style="flex-grow: 1">
          <div>Title</div>
          <div class="bg-white">
            <InputText v-model:value="postContent.metadata.title" required />
          </div>
        </div>
        <div style="flex-grow: 1; min-width: 250px">
          <div>Category</div>
          <div class="bg-white">
            <InputSelect v-model:value="postContent.postInfo.parentPath" :options="parentPathOptions" />
          </div>
        </div>
        <div style="flex-grow: 1; max-width: 100px">
          <div>Order</div>
          <div class="bg-white">
            <InputNumber v-model:value="postContent.metadata.order" />
          </div>
        </div>
        <div style="flex-grow: 1">
          <div>Published date</div>
          <div class="bg-white">
            <InputDate v-model:value="postContent.metadata.publishedAt" type-parser="string" show-time />
          </div>
        </div>
        <div class="ml-auto">
          <div>&nbsp;</div>
          <VueButton color="blue" :loading="saveLoading" type="submit">Save</VueButton>
        </div>
      </div>

      <div class="mt-4 split">
        <MonacoEditor v-model:value="postContent.body" language="markdown" />
        <section class="preview markdown" v-html="previewHtml"></section>
      </div>

      <div class="mt-4 flex items-center">
        <div>
          <VueButton
            v-if="mode === 'EDIT'"
            class="btn danger"
            :loading="saveLoading"
            type="button"
            @click="clickDelete"
          >
            Delete
          </VueButton>
        </div>
        <div class="ml-auto">
          <VueButton color="blue" :loading="saveLoading" type="submit">Save</VueButton>
        </div>
      </div>
    </form>
  </section>
</template>

<style scoped>
.editor-page {
  display: grid;
  gap: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(130px, 1fr));
  gap: 0.6rem;
}

.danger {
  border-color: #c0392b;
  color: #c0392b;
}

.split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0.8rem;
}

.preview {
  border: 1px solid var(--c-border);
  border-radius: 10px;
  padding: 1rem;
  overflow: auto;
  min-height: 62vh;
  background: var(--c-surface-1);
}

.preview :deep(pre) {
  overflow-x: auto;
}

.error {
  color: #c0392b;
}

@media (max-width: 1100px) {
  .split {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }
}

@media (max-width: 680px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .head {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.6rem;
  }
}
</style>
