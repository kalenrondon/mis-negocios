import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function useDarkMode() {
  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved === 'true') {
      document.documentElement.classList.add('dark')
    } else if (saved === 'false') {
      document.documentElement.classList.remove('dark')
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    }
  }, [])
}

export default function Layout() {
  useDarkMode()
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
