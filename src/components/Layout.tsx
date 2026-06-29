import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import QuickAddModal from './QuickAddModal'
import { Menu, Plus } from 'lucide-react'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <main className="p-3 sm:p-4 lg:ml-64 lg:p-6 overflow-auto min-h-screen pb-24 lg:pb-6">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-3 hover:text-slate-700 dark:hover:text-slate-200 sticky top-0 z-10 bg-slate-100 dark:bg-slate-900 py-2 -mt-3 -mx-3 px-3 sm:-mt-4 sm:-mx-4 sm:px-4">
          <Menu size={22} />
          <span className="text-sm font-medium">Menú</span>
        </button>
        <Outlet />
      </main>
      <button onClick={() => setQuickOpen(true)} className="fixed bottom-5 right-5 z-30 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 active:bg-blue-800 transition-all flex items-center justify-center lg:bottom-8 lg:right-8">
        <Plus size={26} />
      </button>
      {quickOpen && <QuickAddModal onClose={() => setQuickOpen(false)} />}
    </div>
  )
}
