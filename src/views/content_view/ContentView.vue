<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CategoryView from './CategoryView.vue'
import PostView from './PostView.vue'

const route = useRoute()

const props = defineProps<{
  pathMatch?: string[] | string
}>()

const fullPath = computed(() => {
  const path = props.pathMatch || []
  return '/' + (Array.isArray(path) ? path.join('/') : path)
})

const isPost = computed(() => {
  return fullPath.value.endsWith('.md')
})
</script>

<template>
  <PostView v-if="isPost" :file-path="fullPath" />
  <CategoryView v-else :folder-path="fullPath" />
</template>
