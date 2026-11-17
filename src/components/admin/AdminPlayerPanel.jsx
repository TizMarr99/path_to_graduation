import { useEffect, useRef, useState } from 'react'
import { usePlayerState } from '../../hooks/usePlayerState'
import { getCategories } from '../../lib/challengeData'
import { adminApplyOperation, adminGetOperation, adminGetPlayerContext, adminListPlayers } from '../../lib/supabaseGameApi'
import { adminOperationLabels, buildAdminPlan, finalizeAdminPlan, getAdminGames, getContextPlayerState, getResettableRounds, isOwnAdminProfile } from '../../lib/adminOperations.js'

const categories = getCategories()
const inputClass = 'w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-300'
const buttonClass = 'rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40'
const cardClass = 'rounded-3xl border border-slate-700 bg-slate-950/75 p-5 sm:p-7'
const dateFormat = new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Rome' })
const signed = (value) => `${value > 0 ? '+' : ''}${value}`
const date = (value) => value ? dateFormat.format(new Date(value)) : '—'
const messageOf = (error) => error?.userMessage ?? error?.message ?? 'Operazione non riuscita.'
const initialSettings = {
  operation: 'room', categoryId: categories[0]?.id ?? '', gameId: '', challengeId: '', roundId: '',
  access: 'keep', replayIntro: true, resetDaily: false, attempts: '3', lives: '2', creditDelta: '0',
}

function Field({ label, children }) {
  return <label className="flex min-w-0 flex-col gap-2 text-sm text-slate-300"><span>{label}</span>{children}</label>
}

function AdminPlayerPanel() {
  const { accessCode, role, flushPlayerState, refreshPlayerState, syncError } = usePlayerState()
  const [players, setPlayers] = useState([])
  const [targetCode, setTargetCode] = useState(accessCode)
  const [loadedCode, setLoadedCode] = useState('')
  const [context, setContext] = useState(null)
  const [settings, setSettings] = useState(initialSettings)
  const [plan, setPlan] = useState(null)
  const [amounts, setAmounts] = useState([])
  const [reason, setReason] = useState('')
  const [submittedPayload, setSubmittedPayload] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [historyTab, setHistoryTab] = useState('movements')
  const [historyOffset, setHistoryOffset] = useState(0)
  const [historySearch, setHistorySearch] = useState('')
  const requestIdRef = useRef('')

  useEffect(() => {
    let cancelled = false
    adminListPlayers(accessCode).then((result) => { if (!cancelled) setPlayers(result) })
      .catch((failure) => { if (!cancelled) setError(messageOf(failure)) })
    return () => { cancelled = true }
  }, [accessCode])

  const category = categories.find((item) => item.id === settings.categoryId)
  const games = getAdminGames(category)
  const game = games.find((item) => item.id === settings.gameId)
  const roundChallenge = game?.challenges.find((item) => item.id === settings.challengeId)
  const rounds = getResettableRounds(roundChallenge)
  const state = context ? getContextPlayerState(context) : null
  const isOwnProfile = isOwnAdminProfile(accessCode, loadedCode)
  const room = state?.roomProgress[settings.categoryId]
  const previewBalance = plan ? plan.originalCredits + amounts.reduce((sum, value) => sum + Number(value), 0) : 0
  const search = historySearch.trim().toLocaleLowerCase('it')
  const movements = (context?.movements ?? []).filter((row) => !search || [row.label, row.category_id, row.challenge_id, row.id, row.operation_id, row.delta].join(' ').toLocaleLowerCase('it').includes(search))
  const operations = (context?.operations ?? []).filter((row) => !search || [row.title, row.reason, row.id].join(' ').toLocaleLowerCase('it').includes(search))

  function updateSettings(patch) {
    setSettings((current) => ({ ...current, ...patch }))
    setPlan(null)
    setError('')
    setNotice('')
  }

  async function loadPlayer(offset = 0) {
    const code = targetCode.trim()
    if (!code) { setError('Seleziona un giocatore.'); return }
    setBusy(true)
    setError('')
    setNotice('')
    setPlan(null)
    try {
      if (code === accessCode) {
        if (syncError) await refreshPlayerState()
        const result = await flushPlayerState()
        if (!result.ok) throw new Error('Salva o ricarica il tuo profilo prima di intervenire.')
      }
      const result = await adminGetPlayerContext(accessCode, code, offset)
      if (code === accessCode) await refreshPlayerState(result.snapshot)
      setContext(result)
      setLoadedCode(code)
      setHistoryOffset(offset)
    } catch (failure) {
      setContext(null)
      setLoadedCode('')
      setError(messageOf(failure))
    } finally { setBusy(false) }
  }

  function prepare(nextSettings = settings, checkpoint = null) {
    setError('')
    setNotice('')
    try {
      const result = buildAdminPlan(context, categories, nextSettings, checkpoint)
      setSettings(nextSettings)
      setPlan(result)
      setAmounts(result.moneyLines.map((line) => String(line.defaultDelta)))
      setReason('')
      setSubmittedPayload(null)
      requestIdRef.current = crypto.randomUUID()
    } catch (failure) { setPlan(null); setError(messageOf(failure)) }
  }

  async function prepareRestore(operation) {
    setBusy(true)
    setError('')
    try {
      const checkpoint = await adminGetOperation(accessCode, loadedCode, operation.id)
      prepare({ ...settings, operation: 'restore', resetDaily: false }, checkpoint)
    } catch (failure) { setError(messageOf(failure)) }
    finally { setBusy(false) }
  }

  async function applyPlan(event) {
    event.preventDefault()
    setError('')
    let payload
    try { payload = submittedPayload ?? finalizeAdminPlan(plan, amounts, reason, requestIdRef.current, { actorCode: accessCode, targetCode: loadedCode }) }
    catch (failure) { setError(messageOf(failure)); return }
    setBusy(true)
    setSubmittedPayload(payload)
    try {
      const result = await adminApplyOperation(accessCode, loadedCode, payload)
      setContext(result)
      setHistoryOffset(0)
      setPlan(null)
      setSubmittedPayload(null)
      setNotice('Intervento applicato e registrato. Lo stato precedente è disponibile nello storico interventi.')
      if (loadedCode === accessCode) await refreshPlayerState(result.snapshot)
    } catch (failure) { setError(messageOf(failure)) }
    finally { setBusy(false) }
  }

  if (role !== 'admin') return null
  return <section className="space-y-6" aria-label="Gestione giocatori">
    <div className={cardClass}>
      <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Amministrazione</p>
      <h1 className="mt-2 text-3xl font-semibold text-white">Giocatori, progressi e crediti</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Scegli un profilo, prepara l’intervento e controlla gli effetti prima di applicarlo. Reset, rettifiche e ripristini sono riservati all’amministratore.</p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1"><Field label="Giocatore"><select className={inputClass} value={targetCode} disabled={busy} onChange={(event) => { setTargetCode(event.target.value); setContext(null); setPlan(null) }}>
          {!players.some((player) => player.code === accessCode) ? <option value={accessCode}>Il mio profilo</option> : null}
          {players.map((player) => <option key={player.code} value={player.code}>{player.code === accessCode ? 'Il mio profilo' : `Giocatore ${player.code}`} · {player.role}</option>)}
        </select></Field></div>
        <button className={buttonClass} disabled={busy} onClick={() => loadPlayer()} type="button">{busy ? 'Attendi…' : context ? 'Ricarica profilo' : 'Carica profilo'}</button>
      </div>
    </div>
    {error ? <p role="alert" className="rounded-xl border border-rose-300/30 bg-rose-950/50 p-4 text-sm text-rose-100">{error}</p> : null}
    {notice ? <p role="status" className="rounded-xl border border-emerald-300/30 bg-emerald-950/40 p-4 text-sm text-emerald-100">{notice}</p> : null}
    {context ? <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[['Crediti', state.credits], ['Tentativi oggi', state.stats.attemptsRemaining], ['Vite oggi', state.stats.livesRemaining], ['Stanze accessibili', state.unlockedCategoryIds.length]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-2xl font-semibold text-white">{value}</p></div>)}
      </div>
      <div className={cardClass}>
        <h2 className="text-xl font-semibold text-white">Prepara un intervento</h2>
        <p className="mt-2 text-xs text-slate-400">Profilo {loadedCode} · ultimo salvataggio {date(state.lastPlayedAt)}</p>
        <fieldset disabled={busy} className="mt-5 space-y-5 disabled:opacity-60">
          <Field label="Operazione"><select className={inputClass} value={settings.operation} onChange={(event) => updateSettings({ operation: event.target.value, resetDaily: false, access: 'keep' })}>
            {Object.entries(adminOperationLabels).filter(([key]) => !['movement', 'restore'].includes(key)).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            {['movement', 'restore'].includes(settings.operation) ? <option value={settings.operation}>{adminOperationLabels[settings.operation]} · dallo storico</option> : null}
          </select></Field>
          {['room', 'game', 'round', 'intro', 'access'].includes(settings.operation) ? <>
            <Field label="Stanza"><select className={inputClass} value={settings.categoryId} onChange={(event) => updateSettings({ categoryId: event.target.value, gameId: '', challengeId: '', roundId: '', access: 'keep' })}>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select></Field>
            <p className="rounded-xl bg-slate-900 p-3 text-sm text-slate-300">Accesso: {state.unlockedCategoryIds.includes(category.id) ? 'aperto' : 'da sbloccare'} · Intro: {(room?.introSeen ?? Boolean(room?.startedAt)) ? 'vista' : 'da mostrare'} · Stanza: {room?.lastSessionSummary ? 'conclusa' : state.activeSession?.categoryId === category.id ? 'in corso' : 'senza sessione attiva'}</p>
          </> : null}
          {['game', 'round'].includes(settings.operation) ? <Field label="Gioco"><select className={inputClass} value={settings.gameId} onChange={(event) => updateSettings({ gameId: event.target.value, challengeId: '', roundId: '' })}>
            <option value="">Scegli un gioco</option>{games.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.challenges.length} {item.challenges.length === 1 ? 'prova' : 'prove'}</option>)}
          </select></Field> : null}
          {settings.operation === 'round' ? <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prova con round sequenziali"><select className={inputClass} value={settings.challengeId} onChange={(event) => updateSettings({ challengeId: event.target.value, roundId: '' })}>
              <option value="">Scegli una prova</option>{game?.challenges.filter((item) => getResettableRounds(item).length).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select></Field>
            <Field label="Riparti da questo round (incluso)"><select className={inputClass} value={settings.roundId} onChange={(event) => updateSettings({ roundId: event.target.value })}>
              <option value="">Scegli un round</option>{rounds.map((round, index) => <option key={round.id} value={round.id}>{index + 1}. {round.title || round.prompt || round.id}</option>)}
            </select></Field>
            <p className="text-xs text-slate-400 sm:col-span-2">Supportati palette, quiz a round e indizi progressivi sequenziali. Per gli altri formati usa «Ricomincia gioco».</p>
          </div> : null}
          {['room', 'game', 'round', 'access'].includes(settings.operation) ? <Field label="Accesso dopo l’intervento"><select className={inputClass} value={settings.access} onChange={(event) => updateSettings({ access: event.target.value })}>
            <option value="keep">Mantieni l’accesso attuale</option><option value="open">Rendi accessibile senza acquisto</option><option value="locked" disabled={category.id === 'musica' || ['game', 'round'].includes(settings.operation)}>Richiedi nuovamente lo sblocco</option>
          </select></Field> : null}
          {settings.operation === 'room' ? <label className="flex gap-3 text-sm text-slate-200"><input type="checkbox" checked={settings.replayIntro} onChange={(event) => updateSettings({ replayIntro: event.target.checked })} />Mostra nuovamente l’introduzione</label> : null}
          {['room', 'game', 'round', 'position'].includes(settings.operation) ? <label className="flex gap-3 text-sm text-slate-200"><input type="checkbox" checked={settings.resetDaily} onChange={(event) => updateSettings({ resetDaily: event.target.checked })} />Ripristina anche i limiti globali di oggi: 3 tentativi e 2 vite</label> : null}
          {settings.operation === 'daily' ? <div className="grid grid-cols-2 gap-4">
            <Field label="Tentativi rimasti oggi"><input className={inputClass} type="number" min="0" step="1" value={settings.attempts} onChange={(event) => updateSettings({ attempts: event.target.value })} /></Field>
            <Field label="Vite rimaste oggi"><input className={inputClass} type="number" min="0" step="1" value={settings.lives} onChange={(event) => updateSettings({ lives: event.target.value })} /></Field>
          </div> : null}
          {settings.operation === 'credits' ? <Field label="Variazione crediti (+ aggiunge, − toglie)"><input className={inputClass} type="number" step="1" value={settings.creditDelta} onChange={(event) => updateSettings({ creditDelta: event.target.value })} /></Field> : null}
          {!['movement', 'restore'].includes(settings.operation) ? <button className={buttonClass} type="button" onClick={() => prepare()}>Mostra anteprima</button> : null}
        </fieldset>
      </div>
      {plan ? <form onSubmit={applyPlan} className="rounded-3xl border border-amber-300/40 bg-amber-300/5 p-5 sm:p-7">
        <h2 className="text-xl font-semibold text-amber-100">Anteprima · {plan.title}</h2>
        <p className="mt-2 text-sm text-slate-300">Giocatore {loadedCode}</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-200">{plan.effects.map((effect) => <li key={effect}>{effect}</li>)}</ul>
        <fieldset disabled={busy} className="mt-5 space-y-4">
          {plan.moneyLines.length ? <div className="space-y-4 rounded-2xl border border-amber-300/20 bg-slate-950/70 p-4">
            <p className="text-sm font-semibold text-amber-100">Effetto sui crediti · importi modificabili</p>
            {plan.moneyLines.map((line, index) => <Field key={`${index}-${line.label}`} label={`${line.label} · previsto ${signed(line.defaultDelta)}`}><input className={inputClass} type="number" step="1" required disabled={Boolean(submittedPayload)} value={amounts[index]} onChange={(event) => setAmounts((current) => current.map((value, position) => position === index ? event.target.value : value))} /></Field>)}
            <p className="text-sm text-slate-200">Saldo: <strong>{plan.originalCredits}</strong> → <strong className={previewBalance < 0 ? 'text-rose-300' : 'text-amber-100'}>{Number.isFinite(previewBalance) ? previewBalance : 'importo non valido'}</strong> crediti</p>
            <p className="text-xs leading-5 text-slate-400">Gli storni saranno collegati ai movimenti originali. Le differenze dagli importi previsti saranno registrate come rettifiche. Zero conserva il saldo ma chiude i movimenti selezionati.</p>
          </div> : <p className="text-sm text-slate-300">Crediti invariati: {plan.originalCredits}.</p>}
          <Field label={isOwnProfile ? 'Motivo dell’intervento (facoltativo)' : 'Motivo dell’intervento'}><textarea className={inputClass} required={!isOwnProfile} disabled={Boolean(submittedPayload)} rows={2} maxLength={1000} value={reason} placeholder={isOwnProfile ? 'Puoi lasciare vuoto per il tuo profilo' : 'Es. Domande aggiornate: riapro il gioco per riprovarlo'} onChange={(event) => setReason(event.target.value)} /></Field>
          {isOwnProfile ? <p className="text-xs text-slate-400">Se lasci vuoto, nello storico sarà indicato «Intervento sul proprio profilo».</p> : null}
          {submittedPayload && !busy ? <p className="text-sm text-amber-100">Puoi riprovare la richiesta identica. Per cambiarla, chiudi questa anteprima e preparane una nuova dopo aver ricaricato il profilo.</p> : null}
          <p className="text-xs text-slate-400">Lo stato precedente sarà conservato. I registri delle email già inviate resteranno invariati.</p>
          <div className="flex flex-wrap gap-3"><button className="rounded-xl bg-amber-200 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-40" disabled={busy || previewBalance < 0 || (!isOwnProfile && !reason.trim())} type="submit">{busy ? 'Applicazione…' : 'Applica intervento'}</button><button className={buttonClass} disabled={busy} type="button" onClick={() => setPlan(null)}>Chiudi anteprima</button></div>
        </fieldset>
      </form> : null}
      <div className={cardClass}>
        <h2 className="text-xl font-semibold text-white">Storico</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">Il saldo iniziale conserva il passato senza ricostruirlo. Da quel momento ogni variazione è registrata. Gli interventi includono una copia dello stato precedente.</p>
        <div className="mt-4 flex flex-wrap gap-2">{[['movements', 'Movimenti crediti'], ['operations', 'Interventi e ripristini']].map(([key, label]) => <button className={`${buttonClass} ${historyTab === key ? 'border-amber-200 text-amber-100' : ''}`} type="button" key={key} onClick={() => setHistoryTab(key)} aria-pressed={historyTab === key}>{label}</button>)}</div>
        <div className="mt-4"><Field label="Cerca in questa pagina dello storico"><input className={inputClass} type="search" value={historySearch} placeholder="Motivo, stanza, gioco, importo o identificativo" onChange={(event) => setHistorySearch(event.target.value)} /></Field></div>
        <div className="mt-4 space-y-3">
          {historyTab === 'movements' ? movements.map((row) => <article key={row.id} className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-white">{row.label}</p><p className="mt-1 text-xs text-slate-400">{date(row.created_at)}{row.category_id ? ` · ${row.category_id}` : ''}{row.challenge_id ? ` · ${row.challenge_id}` : ''}</p></div><p className={`text-lg font-semibold ${row.delta >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>{signed(row.delta)}</p></div>
            <p className="mt-2 text-xs text-slate-400">Saldo dopo il movimento: {row.balance_after}{!row.is_current ? ' · seguito da uno storno/ripristino' : row.kind !== 'opening' ? row.is_effective ? ' · attivo' : ' · annullato' : ''}</p>
            <details className="mt-2 text-xs text-slate-500"><summary className="cursor-pointer">Riferimenti</summary><p className="mt-1 break-all">Movimento: {row.id}{row.reverses_id ? ` · collegato a: ${row.reverses_id}` : ''}{row.operation_id ? ` · intervento: ${row.operation_id}` : ''}</p></details>
            {row.is_current && row.kind !== 'opening' ? <button className={`${buttonClass} mt-3`} type="button" disabled={busy} onClick={() => prepare({ ...settings, operation: 'movement', movementId: row.id, resetDaily: false })}>{row.is_effective ? 'Prepara annullamento' : 'Prepara ripristino'}</button> : null}
          </article>) : operations.map((row) => <article key={row.id} className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
            <p className="text-sm font-semibold text-white">{row.title}</p><p className="mt-1 text-xs text-slate-400">{date(row.created_at)} · crediti {row.credits_before} → {row.credits_after}</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{row.reason}</p>
            {row.money_lines?.length ? <ul className="mt-2 space-y-1 text-xs text-slate-400">{row.money_lines.map((line, index) => <li key={index}>{line.label}: {signed(line.delta)} (previsto {signed(line.defaultDelta)})</li>)}</ul> : null}
            <button className={`${buttonClass} mt-3`} type="button" disabled={busy} onClick={() => prepareRestore(row)}>Prepara ripristino dello stato precedente</button>
          </article>)}
          {(historyTab === 'movements' ? movements : operations).length === 0 ? <p className="py-4 text-sm text-slate-400">Nessuna voce in questa pagina.</p> : null}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3"><button className={buttonClass} type="button" disabled={busy || historyOffset === 0} onClick={() => loadPlayer(Math.max(0, historyOffset - 50))}>Più recenti</button><span className="text-xs text-slate-400">Pagina {Math.floor(historyOffset / 50) + 1}</span><button className={buttonClass} type="button" disabled={busy || (historyTab === 'movements' ? context.movement_count <= historyOffset + 50 : context.operations.length < 50)} onClick={() => loadPlayer(historyOffset + 50)}>Più vecchi</button></div>
      </div>
    </> : null}
  </section>
}

export default AdminPlayerPanel
