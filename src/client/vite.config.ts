import { createVuePlugin } from 'vite-plugin-vue2'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    createVuePlugin(),
  ],
  server: {
    port: 3001
  }
})
