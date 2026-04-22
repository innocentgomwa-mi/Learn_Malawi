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
