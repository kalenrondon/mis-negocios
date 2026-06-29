import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { initAutoSync } from './lib/auto-sync'

initAutoSync()
if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()

window.addEventListener('unhandledrejection', (e) => { console.error('Unhandled promise rejection:', e.reason) })
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistration().then((reg) => {
    if (reg?.active) reg.active.postMessage({ type: 'SKIP_WAITING' })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
