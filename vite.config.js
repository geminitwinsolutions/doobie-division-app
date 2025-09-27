// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [react()],
  
  // FIX: Explicitly configure the HMR WebSocket connection details
  server: {
    hmr: {
      clientPort: 5173, // Set the client port explicitly
      host: 'localhost', // Ensure the host is recognized
      protocol: 'ws',
    },
    // You might also want to set the main dev server port here for consistency:
    port: 5173,
  },

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