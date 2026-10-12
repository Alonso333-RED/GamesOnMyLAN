import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // El manual vive en https://alonso333-red.github.io/GamesOnMyLAN/ (sub-ruta del repo)
  base: '/GamesOnMyLAN/',
  plugins: [react()],
})
