import type { Plugin } from 'vite'
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import manifest from './theme.json'

const require = createRequire(import.meta.url)
const fs = require('node:fs')
const archiver = require('archiver')

function getCommitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD 2>/dev/null', { encoding: 'utf-8' }).trim() || 'dev'
  }
  catch {
    return 'dev'
  }
}

function shouldIgnoreRollupWarning(warning: { code?: string, id?: string }): boolean {
  return warning.code === 'INVALID_ANNOTATION'
    && warning.id?.includes('/node_modules/@vueuse/core/dist/index.js') === true
}

/**
 * Vite 插件：构建后打包 monitor-probe 主题包 theme.tar.gz
 * 内部根目录结构：
 * ├── theme.json
 * ├── preview.png
 * └── dist/
 */
function monitorThemeTarGz(): Plugin {
  return {
    name: 'monitor-theme-tar-gz',
    apply: 'build',
    closeBundle: async () => {
      const distDir = resolve(__dirname, 'dist')
      const themeJsonPath = resolve(__dirname, 'theme.json')
      const previewPath = resolve(__dirname, 'preview.png')
      const outputPath = resolve(__dirname, 'theme.tar.gz')

      if (!existsSync(distDir)) {
        console.log('[monitor-theme-tar-gz] dist directory not found, skipping archive creation')
        return
      }

      const output = fs.createWriteStream(outputPath)
      const archive = archiver('tar', {
        gzip: true,
        gzipOptions: { level: 9 },
      })

      return new Promise((resolve, reject) => {
        output.on('close', () => {
          const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2)
          console.log(`[monitor-theme-tar-gz] Successfully created theme.tar.gz (${sizeMB} MB)`)
          resolve(undefined)
        })

        archive.on('error', (err: Error) => {
          console.error('[monitor-theme-tar-gz] Error:', err)
          reject(err)
        })

        archive.pipe(output)

        if (existsSync(themeJsonPath)) {
          archive.file(themeJsonPath, { name: 'theme.json' })
        }

        if (existsSync(previewPath)) {
          archive.file(previewPath, { name: 'preview.png' })
        }

        archive.directory(distDir, 'dist')

        archive.finalize()
      })
    },
  }
}

const packageJson = require('./package.json')

export default defineConfig({
  define: {
    __BUILD_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_GIT_HASH__: JSON.stringify(getCommitHash()),
  },
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    monitorThemeTarGz(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.MONITOR_HUB || 'http://127.0.0.1:9911',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (shouldIgnoreRollupWarning(warning))
          return
        defaultHandler(warning)
      },
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'echarts': ['echarts', 'vue-echarts'],
          'reka-ui': ['reka-ui'],
          'vueuse': ['@vueuse/core'],
        },
      },
    },
  },
})
