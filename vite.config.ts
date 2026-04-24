import { fileURLToPath, URL } from 'node:url'
import viteCompression from 'vite-plugin-compression'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'
import WindiCSS from 'vite-plugin-windicss'
// https://vite.dev/config/
import { version } from './public/config/version.json'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import path from 'path';
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    VueI18nPlugin({
      include: path.resolve(__dirname, './src/locales/**')
    }),
    WindiCSS(),
    viteCompression({
      verbose: true, // 默认即可
      disable: false, // 开启压缩(不禁用)，默认即可
      deleteOriginFile: false, // 删除源文件
      threshold: 5120, // 压缩前最小文件大小
      algorithm: 'gzip', // 压缩算法
      ext: '.gz' // 文件类型
    }),
  ],
  server: {
    host: '0.0.0.0',   // ← 添加这一行
    port: 8080,
    proxy: {
      ['/dict-service']: {
        target: 'http://192.168.17.99:8000',
        ws: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(new RegExp(`^/dict-service`), '/dict-service'),
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Entry file names for chunking
        entryFileNames: `js/[name].${version}.js`,
        // Entry file names for styles
        chunkFileNames: `js/[name].${version}.js`,
        // Asset file names for images and fonts
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg|webp)$/.test(name || '')) {
            return 'assets/[name].[hash][extname]';
          }
          if (/\.css$/.test(name || '')) {
            return 'css/[name].[hash][extname]';
          }
          // Fallback for other assets
          return 'assets/[name].[hash][extname]';
        }
      }
    },
  },
})
