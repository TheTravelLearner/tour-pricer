import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // 这里的 '/tour-pricer/' 必须和你的GitHub仓库名一致
  base: '/tour-pricer/', 
  plugins: [react()],
})