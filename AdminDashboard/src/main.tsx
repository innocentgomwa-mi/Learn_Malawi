<<<<<<< HEAD
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
=======
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { apiClient } from '@/api/apiClient'

if (typeof window !== 'undefined') {
  window.apiClient = apiClient
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)

>>>>>>> 4174fba (changes to admin dashboard)
