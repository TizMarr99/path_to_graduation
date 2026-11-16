# Passare il progetto a una nuova chat

## Coding agent con accesso al repository

Copiare questo prompt e sostituire il compito finale:

```text
Stiamo lavorando a La Mostra delle Ombre Illuminate, web game narrativo React/Vite
per un regalo di laurea. Leggi AGENTS.md, README.md, docs/README.md e
docs/STATO_PROGETTO.md, poi i documenti e i file pertinenti al compito.

Controlla git status: possono esserci modifiche locali da preservare.
I contenuti attuali sono in src/data/categories/, non nel vecchio categories.json.
Il progresso usa Supabase; localStorage conserva codice e preferenze.
Le sale caricate sono musica, serie-film e cura-corpo. Non confondere il design
storico con funzioni già implementate. Il backend completo non è versionato.

Prima di modificare, identifica il flusso coinvolto e i contratti da mantenere.
Completa il compito e verifica con i controlli appropriati; aggiorna la
documentazione se cambia il comportamento. Nel resoconto distingui ciò che hai
implementato, provato localmente e verificato con servizi esterni.

Compito: [descrivere obiettivo, comportamento atteso e vincoli].
```

## ChatGPT o altro modello senza accesso ai file

Un modello non può analizzare il repository dai soli nomi dei file. Fornire prima `README.md` e la cartella `docs/` corrente; aggiungere poi il codice pertinente. Escludere `.env.local`, `.git`, `node_modules`, `dist`, codici personali e dump di progresso con dati reali. Non serve caricare tutto `public/` per un'analisi di logica; fornire gli asset specifici solo quando necessari.

| Tema | File da aggiungere al pacchetto documentale |
| --- | --- |
| Nuovo contenuto | JSON della sala, `challenge.d.ts`, `challengeData.js`, template del tipo |
| Nuovo tipo di sfida | File precedenti + `challengeRegistry.js`, `challengeDraftState.js`, `answerNormalization.js`, `useChallengeSession.js` |
| Salvataggi | `usePlayerState.js`, `playerStateSnapshot.js`, `supabaseGameApi.js`, migration e schema remoto anonimizzato se disponibile |
| Vittoria/premi | JSON sala, `challengeRewards.js`, `PlayPage.jsx`, modale vittoria |
| Email | Handler interessato, `emailApi.js`, sezione trigger di `PlayPage.jsx`; solo nomi delle variabili |
| Hub/transizioni | `ShadowHallPage.jsx`, `BridgePage.jsx`, `roomTransitions.js`, JSON delle sale coinvolte |

Prompt per analisi esterna:

```text
Analizza il progetto sulla base dei documenti e file allegati.
La documentazione fotografa il workspace del 24 ottobre 2026 e può includere
modifiche non committate. Se il codice allegato è diverso, segnala il conflitto.
Distingui sempre: presente nel codice, intenzione di design, ipotesi e verifica
mancante. Non assumere che Supabase/Resend siano configurati o che le sole
migration allegate ricreino il backend completo.

Obiettivo: [cosa voglio implementare/capire].
Indica file da modificare, dipendenze, impatto sui salvataggi, verifiche e
informazioni mancanti. Chiedi solo i file strettamente necessari che non hai.
```

## Chiusura di una sessione

Per rendere utile la chat successiva aggiornare `STATO_PROGETTO.md` e lasciare un passaggio di consegne con: obiettivo, modifiche effettuate, file coinvolti, verifiche ed esiti, parti incomplete, decisioni aperte e prossimo passo concreto. Aggiungere commit/revisione se esiste, oppure indicare esplicitamente che il lavoro è solo locale. Non copiare credenziali o codici di accesso nel riepilogo.
