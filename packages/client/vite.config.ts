import createVuePlugin from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      vue: '@vue/compat',
    },
  },
  plugins: [
    createVuePlugin({
      template: {
        compilerOptions: {
          compatConfig: {
            MODE: 3,
          },
        },
      },
    }),
  ],
  server: {
    port: 3001,
  },
});
