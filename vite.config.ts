import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    base: './',
    plugins: [vue(), tailwindcss()],
    build: {
      outDir: 'docs',
      emptyOutDir: true,
    },
  }
})
