import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path'

// ensure `npm i @types/node` !!
export default defineConfig({
  base: '/vca', // needs to be the GH Pages base path. also check VITE_BASE_URL in .env
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  // build: {
  //   outDir: '../dist',
  //   emptyOutDir: true, // also necessary
  // }
})