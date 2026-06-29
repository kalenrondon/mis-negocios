import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import AuthGuard from './components/AuthGuard'
import Dashboard from './pages/Dashboard'
import AutoPage from './modules/auto/pages/AutoPage'
import BordadoPage from './modules/bordado/pages/BordadoPage'
import PollosDashboard from './modules/pollos/pages/PollosDashboard'
import LoteFormPage from './modules/pollos/pages/LoteFormPage'
import LoteDetailPage from './modules/pollos/pages/LoteDetailPage'
import HistorialPage from './modules/pollos/pages/HistorialPage'
import VentasPage from './modules/pollos/pages/VentasPage'
import PonedorasDashboard from './modules/ponedoras/pages/PonedorasDashboard'
import PonedorasLoteForm from './modules/ponedoras/pages/LoteFormPage'
import PonedorasLoteDetail from './modules/ponedoras/pages/LoteDetailPage'
import PonedorasHistorial from './modules/ponedoras/pages/HistorialPage'
import TilapiasDashboard from './modules/tilapias/pages/TilapiasDashboard'
import TilapiasLoteForm from './modules/tilapias/pages/LoteFormPage'
import TilapiasLoteDetail from './modules/tilapias/pages/LoteDetailPage'
import VacunoDashboard from './modules/vacuno/pages/VacunoDashboard'
import VacunoLoteForm from './modules/vacuno/pages/LoteFormPage'
import VacunoLoteDetail from './modules/vacuno/pages/LoteDetailPage'
import TradingDashboard from './modules/trading/pages/TradingDashboard'
import RecordatoriosPage from './modules/recordatorios/pages/RecordatoriosPage'
import NotasPage from './modules/notas/pages/NotasPage'
import GastosPersonalesPage from './modules/gastos-personales/pages/GastosPersonalesPage'
import UniversidadPage from './modules/universidad/pages/UniversidadPage'

export default function App() {
  return (
    <AuthGuard>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pollos" element={<PollosDashboard />} />
            <Route path="/pollos/nuevo" element={<LoteFormPage />} />
            <Route path="/pollos/:id" element={<LoteDetailPage />} />
            <Route path="/pollos/historial" element={<HistorialPage />} />
            <Route path="/pollos/ventas" element={<VentasPage />} />
            <Route path="/ponedoras" element={<PonedorasDashboard />} />
            <Route path="/ponedoras/nuevo" element={<PonedorasLoteForm />} />
            <Route path="/ponedoras/:id" element={<PonedorasLoteDetail />} />
            <Route path="/ponedoras/historial" element={<PonedorasHistorial />} />
            <Route path="/tilapias" element={<TilapiasDashboard />} />
            <Route path="/tilapias/nuevo" element={<TilapiasLoteForm />} />
            <Route path="/tilapias/:id" element={<TilapiasLoteDetail />} />
            <Route path="/vacuno" element={<VacunoDashboard />} />
            <Route path="/vacuno/nuevo" element={<VacunoLoteForm />} />
            <Route path="/vacuno/:id" element={<VacunoLoteDetail />} />
            <Route path="/trading" element={<TradingDashboard />} />
            <Route path="/recordatorios" element={<RecordatoriosPage />} />
            <Route path="/notas" element={<NotasPage />} />
            <Route path="/gastos-personales" element={<GastosPersonalesPage />} />
            <Route path="/auto" element={<AutoPage />} />
            <Route path="/bordado" element={<BordadoPage />} />
            <Route path="/universidad" element={<UniversidadPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthGuard>
  )
}
