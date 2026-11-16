# La Mostra delle Ombre Illuminate

Web game narrativo per un regalo di laurea: accesso con codice personale, sale tematiche, sfide multimediali, crediti, artefatti e premi.

## Documentazione

Parti dall'[indice](docs/README.md). Per orientarti nelle nuove chat consulta [Contesto chat](docs/CONTESTO_CHAT.md); per sapere cosa ? implementato e cosa manca consulta [Stato progetto](docs/STATO_PROGETTO.md).

- [Architettura e mappa dei file](docs/ARCHITETTURA.md)
- [Guida alle implementazioni](docs/GUIDA_SVILUPPO.md)
- [Configurazione, Supabase ed email](docs/CONFIGURAZIONE.md)
- [Istruzioni per coding agent](AGENTS.md)

## Avvio

```powershell
npm ci
# Solo se .env.local non esiste:
Copy-Item .env.example .env.local
# Compilare .env.local con i propri valori.
npm run dev
```

Il login richiede Supabase con le RPC attese: il repository non contiene ancora lo schema completo per ricreare il backend da zero. Vedere la guida di configurazione.

```powershell
npm run build
npm run lint
npm run preview
```

`dev` serve anche gli handler email tramite il plugin locale; `preview` serve solo la build statica.

Stack dichiarato: React 19, React Router 7, Vite 8, Tailwind CSS 4, Supabase JS 2 e Resend 6. Dati in `src/data/categories/`, asset in `public/`.

Documentazione riferita al workspace del **24 ottobre 2026**, comprese modifiche locali non committate. Build e lint superati; servizi remoti e flussi end-to-end non collaudati in questa analisi.
