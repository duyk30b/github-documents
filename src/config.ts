import { reactive } from 'vue'

export const CONFIG = reactive({
  CLIENT_ID: '',
  MODE: import.meta.env.MODE as 'development' | 'production',
  BUILD_TIME: '',
})

export const LocalStorageKeys = {
  token: 'docs.github.token',
  theme: 'docs.theme.mode',
  draftPrefix: 'blog.draft.',
}
