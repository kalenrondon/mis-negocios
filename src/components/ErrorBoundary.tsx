import { Component } from 'react'

export default class ErrorBoundary extends Component<{ children: React.ReactNode }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: any) { console.error('ErrorBoundary caught:', error, info) }
  render() {
    if (this.state.error) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
        <div className="max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-red-600 mb-2">Error</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 font-mono break-all">{this.state.error.message}</p>
          <button onClick={() => { this.setState({ error: null }); window.location.reload() }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">Recargar</button>
        </div>
      </div>
    )
    return this.props.children
  }
}