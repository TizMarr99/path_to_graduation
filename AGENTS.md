# Indicazioni per coding agent

Prima di modificare il progetto leggere `README.md`, `docs/STATO_PROGETTO.md` e il documento pertinente dall'indice `docs/README.md`.

- Web game narrativo italiano: componenti React funzionali, custom hook, moduli JS ESM e Tailwind. Contratti JSDoc in `src/types/challenge.d.ts`; non è configurato un typecheck TypeScript.
- I contenuti sono in `src/data/categories/*.json`, aggregati da `index.js`. Non ricreare il vecchio `src/data/categories.json`.
- Il progresso globale passa dal provider `usePlayerState` e da Supabase. localStorage conserva codice e preferenze; non è il database del progresso.
- Seguire React Router nella versione installata (7). Conservare ID di sale e sfide: sono usati nei salvataggi. L'ID cinema è `serie-film`.
- Per un nuovo tipo di sfida aggiornare contratti, normalizzazione, draft/runtime, registro/valutatore e template: vedere `docs/GUIDA_SVILUPPO.md`.
- Eseguire `git status --short` prima delle modifiche; preservare interventi dell'utente non committati.
- Non pubblicare credenziali o contenuti di `.env.local`. Usare placeholder; non prefissare chiavi server con `VITE_`.
- Non inviare email reali, resettare giocatori o modificare servizi remoti per una semplice verifica locale.
- Build e lint sono i comandi di verifica disponibili. Non esiste uno script `npm test`. Distinguere errori preesistenti da regressioni.
- Aggiornare la documentazione quando cambiano funzionalità o contratti. Una build riuscita non certifica il flusso end-to-end.

Il design storico delle ombre e i vecchi documenti email non sono un inventario di funzioni completate. Usare l'indice corrente.
