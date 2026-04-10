import { BrowserRouter, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import DevPage from './pages/DevPage.jsx'
import PlayPage from './pages/PlayPage.jsx'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/map', label: 'Dashboard' },
  { to: '/dev', label: 'DevPage' },
]

function AppShell() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(8,145,178,0.18),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#111827_45%,_#020617_100%)] text-slate-100">
      <header className="border-b border-cyan-400/15 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300/80">
              Path To Graduation
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Routing base e pagina di sviluppo dati
            </h1>
          </div>

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

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

function PlaceholderPage({ eyebrow, title, description }) {
  return (
    <section className="rounded-[2rem] border border-slate-800 bg-slate-950/60 p-8 shadow-[0_0_80px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
        {description}
      </p>
    </section>
  )
}

function HomePage() {
  return (
    <PlaceholderPage
      eyebrow="Home"
      title="Spazio iniziale pronto per il flusso di gioco"
      description="La route principale è attiva. Qui puoi poi costruire l'introduzione narrativa, il punto di ingresso del gioco e l'accesso alle categorie."
    />
  )
}

function DashboardPage() {
  return (
    <PlaceholderPage
      eyebrow="Map"
      title="Dashboard vuota pronta per la mappa"
      description="La route /map è stata predisposta. Puoi usarla per la mappa delle sale, gli stati di sblocco e la progressione salvata in localStorage."
    />
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<DashboardPage />} />
          <Route path="/dev" element={<DevPage />} />
          <Route path="/play/:categoryId" element={<PlayPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
