import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [
    react({
      plugins: [
        ['@swc/plugin-styled-components', {
          displayName: true,
          fileName: true,    
          pure: true         
        }],

        ['@swc/plugin-transform-imports', {
          '@mui/material': {
            transform: '@mui/material/{{member}}',
            preventFullImport: true
          },
          lodash: {
            transform: 'lodash/{{member}}',
            preventFullImport: true
          }
        }]
      ]
    }),
  ],
  // base: '/whatthefchain/',
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    sourcemap: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 600
  },
  server: {
    port: 3000,
    open: true
  }
})
