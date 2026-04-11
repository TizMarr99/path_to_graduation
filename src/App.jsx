import { BrowserRouter, Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage.jsx'
import DevPage from './pages/DevPage.jsx'
import { isDevToolsEnabled } from './lib/runtimeFlags.js'
import HomePage from './pages/HomePage.jsx'
import PlayPage from './pages/PlayPage.jsx'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/map', label: 'Mappa' },
]

function AppShell() {
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route element={<AppShell />}>
          <Route path="/map" element={<DashboardPage />} />
          <Route
            path="/dev"
            element={isDevToolsEnabled ? <DevPage /> : <Navigate replace to="/" />}
          />
          <Route path="/play/:categoryId" element={<PlayPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
