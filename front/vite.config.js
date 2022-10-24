import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      includeAssets: ['src/asses/images/favicon.ico', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Aroma UGE',
        short_name: 'Aroma UGE',
        description: 'Aroma UGE',
        theme_color: '#171C8F',
        icons: [
          {
            src: 'icons/manifest-icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/manifest-icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
        ],
        display: 'standalone',
        start_url: '.',
      }
    })
  ]
})
