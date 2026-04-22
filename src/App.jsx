import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import GlobalMusicToggle from './components/GlobalMusicToggle.jsx'
import { usePlayerState } from './hooks/usePlayerState'
import BridgePage from './pages/BridgePage.jsx'
import DevPage from './pages/DevPage.jsx'
import HomePage from './pages/HomePage.jsx'
import PlayPage from './pages/PlayPage.jsx'
import ShadowHallPage from './pages/ShadowHallPage.jsx'

function AppShell() {
  const { isAuthenticated, role } = usePlayerState()
  const navItems = [
    { to: '/', label: 'Home', end: true },
    ...(isAuthenticated ? [{ to: '/shadows', label: 'Sala Ombre' }] : []),
    ...(role === 'admin' ? [{ to: '/dev', label: 'Dev' }] : []),
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(8,145,178,0.18),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#111827_45%,_#020617_100%)] text-slate-100">
      <header className="border-b border-cyan-400/15 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300/80">
            LA MOSTRA DELLE OMBRE ILLUMINATE
          </p>

          <nav className="flex flex-wrap gap-2">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    'rounded-full border px-4 py-2 text-sm font-medium transition',
                    isActive
                      ? 'border-amber-300/70 bg-amber-300/10 text-amber-100 shadow-[0_0_24px_rgba(252,211,77,0.15)]'
                      : 'border-slate-700 bg-slate-900/80 text-slate-300 hover:border-cyan-300/50 hover:text-cyan-100',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

function RouteLoadingState() {
  return (
    <section className="rounded-[2rem] border border-slate-800 bg-slate-950/70 p-8 text-center shadow-[0_0_80px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80">
        Sessione in caricamento
      </p>
      <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
        Sto ripristinando il profilo e il progresso salvato.
      </p>
    </section>
  )
}

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isHydrating, role } = usePlayerState()

  if (isHydrating) {
    return <RouteLoadingState />
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/" />
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate replace to="/shadows" />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <GlobalMusicToggle />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/bridge"
          element={(
            <ProtectedRoute>
              <BridgePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/shadows"
          element={(
            <ProtectedRoute>
              <ShadowHallPage />
            </ProtectedRoute>
          )}
        />
        <Route element={<AppShell />}>
          <Route path="/map" element={<Navigate replace to="/shadows" />} />
          <Route
            path="/dev"
            element={(
              <ProtectedRoute requireAdmin>
                <DevPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/play/:categoryId"
            element={(
              <ProtectedRoute>
                <PlayPage />
              </ProtectedRoute>
            )}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
