<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { LocalStorageKeys } from '../../config'
import { ROUTER_NAME } from '../../router'
import { useAuthStore } from '../../stores/auth.store'
import { useCategoryStore } from '../../stores/category.store'
import { useThemeStore } from '../../stores/theme.store'
import BugDevelopment from '../app_components/BugDevelopment.vue'
import AppHeaderMenu from './AppHeaderMenu.vue'
import ModalLogin from './ModalLogin.vue'

const modalLogin = ref<InstanceType<typeof ModalLogin>>()

const emit = defineEmits<{
  toggleSidebar: []
}>()

const authStore = useAuthStore()
const categoryStore = useCategoryStore()
const themeStore = useThemeStore()
const search = ref('')

const openUserMenu = ref(false)

function onLogout() {
  authStore.logout()
  localStorage.removeItem(LocalStorageKeys.token)
}

const startSearch = () => {}
const searchResults = ref<{ id: number; title: string; excerpt: string }[]>([])
</script>

<template>
  <ModalLogin ref="modalLogin" />
  <header class="header">
    <div class="left">
      <button class="mobile-btn" @click="emit('toggleSidebar')">Menu</button>
      <RouterLink to="/" class="brand">Blog Docs</RouterLink>
      <AppHeaderMenu />
      <BugDevelopment :data="categoryStore.categoryMenuTree" />
    </div>

    <div class="right">
      <div class="search-box">
        <input v-model="search" type="search" placeholder="Search docs" @keydown.enter.prevent="startSearch" />
        <div v-if="searchResults.length" class="search-results">
          <button v-for="item in searchResults" :key="item.id" type="button" class="search-item">
            <strong>{{ item.title }}</strong>
            <span>{{ item.excerpt }}</span>
          </button>
        </div>
      </div>

      <button class="btn" @click="themeStore.toggleTheme()">{{ themeStore.mode === 'dark' ? 'Light' : 'Dark' }}</button>
      <button v-if="!authStore.isAuthenticated" class="btn primary" @click="modalLogin?.openModal()">
        GitHub Login
      </button>
      <div v-else class="auth" @mouseenter="openUserMenu = true" @mouseleave="openUserMenu = false">
        <button type="button" class="user-chip">@{{ authStore.username }}</button>
        <div v-if="openUserMenu" class="user-dropdown">
          <RouterLink :to="{ name: ROUTER_NAME.MANAGER_CATEGORY_MANAGER }">Category Manager</RouterLink>
          <RouterLink :to="{ name: ROUTER_NAME.MANAGER_POST_EDIT, query: { mode: 'CREATE' } }"> New Post </RouterLink>
          <button type="button" @click="onLogout">Logout</button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 35;
  display: flex;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 0.8rem 1.2rem;
  border-bottom: 1px solid var(--c-border);
  background: color-mix(in srgb, var(--c-bg-elevated) 84%, transparent);
  backdrop-filter: blur(12px);
}

.left {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.brand {
  font-family: var(--font-heading);
  font-weight: 800;
  letter-spacing: 0.01em;
  padding: 0.28rem 0.6rem;
  border-radius: 999px;
  border: 1px solid transparent;
  color: var(--c-text);
  text-decoration: none;

  &:hover {
    border-color: var(--c-border);
    background: var(--c-surface-1);
  }
}

.right {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    left: 0.75rem;
    width: 7px;
    height: 7px;
    border: 1.5px solid var(--c-text-soft);
    border-radius: 50%;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    left: 1.28rem;
    top: 54%;
    width: 6px;
    border-top: 1.5px solid var(--c-text-soft);
    transform: rotate(45deg);
    pointer-events: none;
  }
}

input[type='search'] {
  width: min(28vw, 330px);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  background: var(--c-surface-1);
  color: var(--c-text);
  padding: 0.48rem 0.88rem 0.48rem 2rem;

  &::placeholder {
    color: var(--c-text-soft);
  }

  &:focus {
    outline: none;
    border-color: var(--c-primary);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-primary) 20%, transparent);
  }
}

.search-results {
  position: absolute;
  right: 0;
  top: calc(100% + 0.55rem);
  width: min(420px, 85vw);
  display: grid;
  gap: 0.45rem;
  border: 1px solid var(--c-border);
  border-radius: 16px;
  background: var(--c-surface-1);
  padding: 0.5rem;
  box-shadow: var(--shadow-soft);
}

.search-item {
  text-align: left;
  display: grid;
  gap: 0.2rem;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  padding: 0.45rem;
  background: var(--c-surface-1);
  color: var(--c-text);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--c-border);
  border-radius: 999px;
  padding: 0.42rem 0.78rem;
  cursor: pointer;
  background: var(--c-surface-1);
  color: var(--c-text);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--c-primary);
    color: var(--c-primary);
  }
}

.primary {
  background: var(--c-primary);
  border-color: var(--c-primary);
  color: #fff;

  &:hover {
    color: #fff;
    filter: brightness(1.04);
  }
}

.auth {
  position: relative;
  display: flex;
  align-items: center;
}

.user-chip {
  border: 1px solid var(--c-border);
  border-radius: 999px;
  padding: 0.42rem 0.75rem;
  background: var(--c-surface-1);
  color: var(--c-text);
  cursor: pointer;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0rem);
  right: 0;
  min-width: 210px;
  display: grid;
  gap: 0.25rem;
  padding: 0.48rem;
  border: 1px solid var(--c-border);
  border-radius: 14px;
  background: var(--c-surface-1);
  box-shadow: var(--shadow-soft);
}

.user-dropdown a,
.user-dropdown button {
  text-align: left;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--c-text-soft);
  text-decoration: none;
  padding: 0.4rem 0.45rem;
  cursor: pointer;
  font: inherit;
}

.user-dropdown a:hover,
.user-dropdown button:hover {
  background: var(--c-surface-2);
  color: var(--c-text);
}

.error-text {
  margin: 0.5rem 0 0;
  color: #c0392b;
}

.actions {
  margin-top: 0.8rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.mobile-btn {
  display: none;
}

@media (max-width: 960px) {
  :deep(.menu),
  .search-box {
    display: none;
  }

  .mobile-btn {
    display: inline-flex;
    border: 1px solid var(--c-border);
    border-radius: 8px;
    background: var(--c-surface-1);
    color: var(--c-text);
    padding: 0.45rem 0.65rem;
  }

  .header {
    padding-inline: 0.8rem;
  }
}
</style>
