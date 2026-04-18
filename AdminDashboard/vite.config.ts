import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
<<<<<<< HEAD
=======
import { fileURLToPath, URL } from 'node:url'
>>>>>>> 4174fba (changes to admin dashboard)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
=======
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
>>>>>>> 4174fba (changes to admin dashboard)
})
