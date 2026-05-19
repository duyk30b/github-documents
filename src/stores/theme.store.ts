import { defineStore } from 'pinia'
import { LocalStorageKeys } from '../config'

type ThemeMode = 'light' | 'dark'

function getInitialTheme(): ThemeMode {
  const saved = localStorage.getItem(LocalStorageKeys.theme)
  if (saved === 'light' || saved === 'dark') {
    return saved
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: getInitialTheme() as ThemeMode,
  }),
  actions: {
    applyTheme() {
      document.documentElement.setAttribute('data-theme', this.mode)
      localStorage.setItem(LocalStorageKeys.theme, this.mode)
    },
    toggleTheme() {
      this.mode = this.mode === 'dark' ? 'light' : 'dark'
      this.applyTheme()
    },
  },
})
