import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'icons/icon-192x192.png',
        'icons/icon-512x512.png'
      ],
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB par exemple
      },
      manifest: {
        name: 'CookCourse',
        short_name: 'Cook',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#00aaff',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Ajoutez cette section pour charger les variables d'environnement
  define: {
    'process.env': process.env
  }
});
