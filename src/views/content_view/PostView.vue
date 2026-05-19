<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { MarkdownRenderer, type TocItem } from '../../core/markdown.core'
import { PostContent } from '../../model/post_content.model'
import { ROUTER_NAME } from '../../router'
import { useAuthStore } from '../../stores/auth.store'
import { usePostStore } from '../../stores/post.store'
import { ESTimer } from '../../utils'
import Breadcrumb from './Breadcrumb.vue'

const props = defineProps<{
  filePath: string
}>()

const authStore = useAuthStore()
const postStore = usePostStore()

const postContent = ref(PostContent.blank())
const postHtml = ref('')
const tocItems = ref<TocItem[]>([])
const loading = ref(false)

watch(
  () => props.filePath,
  async (newFilePath) => {
    try {
      loading.value = true
      postContent.value = await postStore.getPostContentByFilePath(newFilePath)
      const rendered = await MarkdownRenderer.toHtml(postContent.value.body)
      postHtml.value = rendered.html
      tocItems.value = rendered.toc
    } catch (error) {
      postContent.value = PostContent.blank()
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}
</script>

<template>
  <div class="post-page">
    <div class="post-main">
      <div class="post-toolbar">
        <Breadcrumb />
        <RouterLink
          v-if="
            authStore.isAuthenticated &&
            postContent.postInfo.parentPath !== '/' &&
            postContent.postInfo.parentPath !== ''
          "
          class="small"
          :to="{
            name: ROUTER_NAME.MANAGER_POST_EDIT,
            query: { mode: 'CREATE', parentPath: postContent.postInfo.parentPath },
          }"
        >
          Create Post
        </RouterLink>
      </div>
      <section v-if="loading" class="post">
        <p>Loading post...</p>
      </section>

      <article v-else-if="postContent.postInfo.sha" class="post">
        <header class="post-head">
          <h1>{{ postContent.metadata.title }}</h1>
          <div class="meta">
            <span>{{ ESTimer.timeToText(postContent.metadata.publishedAt) }}</span>
            <div v-if="authStore.isAuthenticated">
              <RouterLink
                class="edit-link"
                :to="{ name: ROUTER_NAME.MANAGER_POST_EDIT, query: { mode: 'EDIT', filePath: props.filePath } }"
              >
                Edit
              </RouterLink>
            </div>
          </div>
        </header>

        <section class="markdown" v-html="postHtml" />
      </article>

      <section v-else class="post">
        <h1>Post not found</h1>
        <RouterLink class="btn" to="/">Back home</RouterLink>
      </section>
    </div>

    <aside v-if="tocItems.length" class="toc-wrap hidden lg:block">
      <p class="toc-title">On this page</p>
      <ul>
        <li v-for="item in tocItems" :key="item.id" :class="`l${item.depth}`" @click="scrollTo(item.id)">
          {{ item.text }}
        </li>
      </ul>
    </aside>
  </div>
</template>

<style scoped lang="scss">
.post-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  align-items: start;
  gap: 1rem;
}

.post-main {
  min-width: 0;
}

.post-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.post {
  max-width: 980px;
  margin: 0.8rem auto 0;
  border: 1px solid var(--c-border);
  border-radius: 18px;
  background: var(--c-bg-elevated);
  box-shadow: var(--shadow-soft);
  padding: clamp(1rem, 2.8vw, 1.7rem);
}

h1 {
  margin: 0;
  font-size: clamp(1.65rem, 2.3vw, 2.2rem);
}

.post-head {
  display: grid;
  gap: 0.55rem;
  margin-bottom: 1rem;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.75rem;
  color: var(--c-text-soft);
}

.edit-link {
  color: var(--c-primary);
  text-decoration: none;
  border: 1px solid color-mix(in srgb, var(--c-primary) 50%, var(--c-border));
  border-radius: 999px;
  padding: 0.28rem 0.75rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--c-primary) 45%, var(--c-border));
  border-radius: 999px;
  padding: 0.42rem 0.88rem;
  text-decoration: none;
  color: var(--c-primary);
  background: var(--c-surface-1);
}

.markdown :deep(h1),
.markdown :deep(h2),
.markdown :deep(h3),
.markdown :deep(h4) {
  scroll-margin-top: 7rem;
}

.toc-wrap {
  position: sticky;
  top: 5.8rem;
  max-height: calc(100vh - 6.3rem);
  min-width: 220px;
  overflow: auto;
  padding: 0.95rem;
  border: 1px solid var(--c-border);
  border-radius: 16px;
  background: var(--c-bg-elevated);

  .toc-title {
    margin: 0 0 0.75rem;
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--c-text-soft);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    margin: 0;
    padding: 0.2rem 0.4rem;
    border-radius: 8px;
    color: var(--c-text-soft);
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--c-surface-2);
      color: var(--c-primary);
    }
  }

  li.l2 {
    padding-left: 0.7rem;
  }

  li.l3 {
    padding-left: 1.4rem;
  }
}

@media (max-width: 1200px) {
  .post-page {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
