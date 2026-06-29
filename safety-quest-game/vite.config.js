import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  // 환경변수 로드
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src/workers',
        filename: 'sw.js',
        registerType: 'autoUpdate',
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
          maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
        },
        manifest: {
          name: '안전의 길 - Safety Quest',
          short_name: '안전의길',
          description: '현장 안전교육과 위험 개선 활동을 모바일에서 진행하는 Safety Quest 앱',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait',
          id: '/',
          start_url: '/',
          scope: '/',
          lang: 'ko',
          categories: ['education', 'productivity'],
          icons: [
            { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
      })
    ],
    server: {
      port: 3000,
      host: true, // 모든 네트워크 인터페이스에서 접근 가능 (IPv4 + IPv6)
      open: true,
      // 백엔드 API 프록시 설정 (CORS 우회)
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    // 환경변수 정의
    define: {
      __DEV__: mode === 'development',
    }
  }
})
