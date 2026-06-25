import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Capacitor requires a relative base path so assets load correctly
  // when served from the native webview (file:// or capacitor://)
  base: './',
})
