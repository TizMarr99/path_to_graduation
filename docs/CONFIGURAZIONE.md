# Configurazione e servizi

## Comandi

Usare Node.js e npm compatibili con il lockfile. Non esiste un vincolo `engines` in `package.json`.

```powershell
npm ci
# Solo se .env.local non esiste:
Copy-Item .env.example .env.local
# Compilare le variabili con i propri valori.
npm run dev
```

| Comando | Effetto |
| --- | --- |
| `npm run dev` | Vite con adapter locale per le API in `api/` |
| `npm run build` | Build frontend in `dist/` |
| `npm run lint` | ESLint |
| `npm run preview` | Anteprima statica; non esegue gli handler email |

`vite.config.js` carica anche variabili server da `.env.local` e `.env` mediante parser custom. Non assumere tutte le funzionalità dotenv. `vercel.json` mantiene `/api/*` e riscrive gli altri percorsi verso la SPA. Il deploy deve ospitare frontend e funzioni Node.

## Variabili lette dal codice

| Variabile | Ambito e uso |
| --- | --- |
| `VITE_SUPABASE_URL` | Client/server: URL Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client: chiave pubblica preferita |
| `VITE_SUPABASE_ANON_KEY` | Client: alternativa alla publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo server: accesso privilegiato per handler email |
| `RESEND_API_KEY` | Solo server: invio email |
| `RESEND_FROM_EMAIL` | Mittente; fallback differenti tra handler |
| `RESEND_FROM_NAME` | Nome mittente nei due handler musica |
| `TEST_EMAIL` | Opzionale: sostituisce il destinatario per prove |
| `VITE_API_BASE_URL` | Opzionale: base API; vuota per same origin |
| `VITE_BASE_URL` | Base pubblica per immagini nei template email |
| `VITE_ENABLE_DEV_TOOLS` | Flag consultato da `runtimeFlags.js`; verificare anche ruolo e pagina |

Le variabili `VITE_` sono pubbliche. Non usarle per chiavi privilegiate. Non condividere `.env.local` nelle chat.

## Contratto Supabase

Fonte: `src/lib/supabaseGameApi.js`. Questa tabella descrive le chiamate attese, non lo schema SQL completo.

| RPC | Parametri |
| --- | --- |
| `app_login` | `p_code` |
| `app_get_snapshot` | `p_code` |
| `app_save_snapshot` | `p_code`, `p_progress`, `p_daily` |
| `app_save_room_archive` | `p_code`, `p_category_id`, `p_archive` |
| `app_get_room_archive` | `p_code`, `p_category_id` |
| `app_clear_room_archives` | `p_code` |
| `admin_reset_daily_limits` | `p_admin_code`, `p_target_code` |
| `admin_reset_player` | `p_admin_code`, `p_target_code` |

Il wrapper espone inoltre `appDeletePlayerState`: delete dirette da `player_progress` e `player_daily_limits` per `access_code_id`, soggette alle policy effettive.

Tabelle referenziate: `access_codes`, `player_progress`, `player_daily_limits`, `player_room_archives`. Le email usano `access_codes.email` e `player_progress.email_state`. Nei documenti storici è riportata l'aggiunta manuale delle colonne JSONB `reward_state` ed `email_state`.

L'unica migration presente è `supabase/migrations/20260514000000_player_room_archives.sql`: crea archivi e tre RPC, abilita RLS e blocca l'accesso diretto con una policy. Le funzioni `security definer` usano `app_get_snapshot(p_code)` per identificare il giocatore.

**Mancano lo schema iniziale e le definizioni delle RPC principali.** La migration dipende da `access_codes` e `app_get_snapshot`: non basta per inizializzare un database vuoto. Per un setup riproducibile recuperare schema, funzioni, grant e policy dal backend esistente e provarli in un ambiente di test. Le sole variabili ambiente non creano database o codici.

## Email

Client: `src/lib/emailApi.js`. Trigger UI: `src/pages/PlayPage.jsx`. Corpo POST: `{ "accessCode": "CODICE_DI_TEST" }`.

| Endpoint | Contenuto |
| --- | --- |
| `/api/mail/music-prize-1` | Artefatto/gettone musica |
| `/api/mail/music-prize-2` | Premio concerto |
| `/api/mail/serie-film-artifact` | Artefatto serie-film |
| `/api/mail/serie-film-prize` | Premi aggiuntivi serie-film |

Gli handler verificano snapshot e condizioni premio, controllano il tracking, scelgono `TEST_EMAIL` oppure `access_codes.email`, inviano con Resend e aggiornano `email_state`. Template HTML inline nei quattro file. Un invio già registrato può produrre 409. Non ci sono handler dedicati a cura-corpo.

Il controllo lettura → invio → aggiornamento non garantisce da solo l'assenza di duplicati con richieste concorrenti o con errore di salvataggio dopo l'invio. Per garanzie più forti valutare deduplicazione atomica e idempotenza del provider.

## Diagnosi

- Login: configurazione pubblica, presenza RPC, codice di test valido.
- Salvataggio: `syncError`, payload e contratto SQL effettivamente distribuito.
- Archivi: presenza migration e delle tre RPC.
- Email: configurazione server, service role, destinatario, condizioni premio, mittente e tracking.
- Immagini email: base URL pubblica e asset raggiungibili anche fuori dall'app.

Durante questa analisi non sono stati eseguiti invii email, reset o modifiche remote.
