<<<<<<< HEAD
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
=======
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    preview: {
      port: 4173,
      host: true,
      allowedHosts: [
        'learn-malawi.onrender.com',
        '.onrender.com',
        'https://learn-malawi-plum.vercel.app/'
        
      ]
    },
    server: {
      port: 4173,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      }
    },
    // Expose env variables to your app
    define: {
      'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
      '__APP_ENV__': JSON.stringify(env.APP_ENV),
    }
  }
})
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
