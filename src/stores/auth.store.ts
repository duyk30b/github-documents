import { defineStore } from 'pinia'
import { GithubApi } from '../core/github.api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    username: '',
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.username),
  },
  actions: {
    async loginByToken(token: string) {
      GithubApi.setToken(token.trim())
      const user = await GithubApi.getCurrentUser()
      this.username = user.login
    },
    logout() {
      GithubApi.setToken('')
      this.username = ''
    },
  },
})
