import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/ed': {
        target: 'https://el-cartucho-git-dev-victor-s-projects-2bfad959.vercel.app',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
