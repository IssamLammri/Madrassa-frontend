import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      vueDevTools(),
      tailwindcss(),
    ],
    server: {
      port: parseInt(env.PORT) || 3000,
      proxy: {
        '/api': {
          target: 'https://ecole.ccib38.fr',
          changeOrigin: true,
        },
        '/register': {
          target: 'https://ecole.ccib38.fr',
          changeOrigin: true,
        },
        '/students': {
          target: 'https://ecole.ccib38.fr',
          changeOrigin: true,
        }
      },
      watch: {
        usePolling: true,
      },
      headers: {
        'Cache-Control': 'no-store'
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})
