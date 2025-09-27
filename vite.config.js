// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss' // 1. Import tailwindcss
import autoprefixer from 'autoprefixer' // 2. Import autoprefixer

export default defineConfig({
  plugins: [react()],
  // 3. Add the css configuration block here
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
})