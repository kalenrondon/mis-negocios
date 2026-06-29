import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initAutoSync } from './lib/auto-sync'

initAutoSync()
if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
