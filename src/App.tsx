import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/layout/Layout'
import LoadingScreen from './components/LoadingScreen'
import Overview from './pages/Overview'
import LiveFeed from './pages/LiveFeed'
import TireStatus from './pages/TireStatus'
import Predictions from './pages/Predictions'
import AlertsPage from './pages/AlertsPage'
import FleetPage from './pages/FleetPage'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading sequence
    const timer = setTimeout(() => setLoading(false), 2400)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <LoadingScreen />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="fleet" element={<FleetPage />} />
          <Route path="live" element={<LiveFeed />} />
          <Route path="tire-status" element={<TireStatus />} />
          <Route path="predict" element={<Predictions />} />
          <Route path="predictions" element={<Predictions />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
