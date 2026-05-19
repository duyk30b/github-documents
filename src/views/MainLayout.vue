<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { RouterView } from 'vue-router'
import { AlertStore } from '../common/vue-alert'
import { VueSwitch } from '../common/vue-form'
import { CONFIG, LocalStorageKeys } from '../config'
import { useAuthStore } from '../stores/auth.store'
import { useCategoryStore } from '../stores/category.store'
import { useThemeStore } from '../stores/theme.store'
import Sidebar from './app_components/Sidebar.vue'
import AppHeader from './app_header/AppHeader.vue'

const sidebarOpen = ref(false)

const authStore = useAuthStore()
const themeStore = useThemeStore()

const categoryStore = useCategoryStore()

const loading = ref(false)

const autoLogin = async () => {
  const token = localStorage.getItem(LocalStorageKeys.token)
  if (token) {
    try {
      await authStore.loginByToken(token)
    } catch (error: any) {
      AlertStore.addError(error.message)
      authStore.logout()
    }
  }
}

onBeforeMount(async () => {
  try {
    loading.value = true
    themeStore.applyTheme()
    const token = localStorage.getItem(LocalStorageKeys.token)
    await Promise.all([autoLogin(), categoryStore.loadCategoryMenuTree()])
  } catch (error: any) {
    console.log('🚀 ~ MainLayout.vue:24 ~ error:', error)
    AlertStore.addError(error.message)
  } finally {
    loading.value = false
  }
})

const handleChangeMode = (value: number | boolean) => {
  if (value) {
    CONFIG.MODE = 'development'
  } else {
    CONFIG.MODE = 'production'
  }
}
</script>

<template>
  <div v-if="!loading" class="layout">
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

    <div class="body">
      <Sidebar :open="sidebarOpen" @close="sidebarOpen = false" />

      <main class="main">
        <RouterView :key="$route.fullPath" />
      </main>
    </div>

    <div style="position: fixed; bottom: 0px; right: 0.5rem; z-index: 100">
      <VueSwitch
        :model-value="CONFIG.MODE === 'development'"
        checked-color="violet"
        :size="'14px'"
        @change="handleChangeMode"
      />
    </div>
  </div>

  <div v-if="loading" class="loading-mask" role="status" aria-live="polite">
    <div class="loading-card">
      <span class="spinner"></span>
      <strong>Processing request...</strong>
    </div>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  position: relative;
}

.body {
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
}

.main {
  min-width: 0;
  padding: clamp(0.8rem, 2.4vw, 1.6rem);
}

.loading-mask {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(0, 0, 0, 0.18);
  display: grid;
  place-items: center;
}

.loading-card {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 0.75rem 0.95rem;
  background: var(--c-surface-1);
  color: var(--c-text);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--c-border);
  border-top-color: var(--c-primary);
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 960px) {
  .body {
    grid-template-columns: minmax(0, 1fr);
  }

  .main {
    padding: 0.85rem;
  }
}
</style>
