# Guida per implementare modifiche

## Trovare subito il punto giusto

| Richiesta | Partire da |
| --- | --- |
| Cambiare testi, risposte, immagini o costi | JSON della sala in `src/data/categories/` |
| Correggere accettazione di una risposta | `answerNormalization.js` e valutatore in `challengeRegistry.js` |
| Cambiare input o interazione di una prova | Template in `components/challenges/templates/` |
| Cambiare vittoria o premi | `challengeRewards.js`, `weightedScoring`/`subPrizes` nel JSON e `PlayPage.jsx` |
| Cambiare crediti, vite o tentativi | `usePlayerState.js`, `playerStateSnapshot.js`, punti di chiamata in `PlayPage.jsx` |
| Risolvere refresh/ripresa | `useChallengeSession.js`, `challengeDraftState.js`, snapshot e provider |
| Cambiare porte o passaggi | `ShadowHallPage.jsx`, `roomTransitions.js`, `BridgePage.jsx` |
| Cambiare un'email | Handler specifico in `api/mail/`; trigger in `PlayPage.jsx` |
| Risolvere sincronizzazione | `usePlayerState.js` → `playerStateSnapshot.js` → `supabaseGameApi.js` → RPC remota |

## Schermo intero

Dal 18 novembre 2026 `App` dispone i comandi globali di schermo e musica in un unico gruppo fisso in basso a destra, rispettando le aree sicure. `GlobalMusicToggle` riceve il posizionamento dal gruppo: non è più autonomamente `fixed`. `RoomPlayLayout` riserva spazio a entrambi i controlli nella barra inferiore desktop; su mobile mantiene lo spazio inferiore già previsto.

`GlobalFullscreenToggle` usa `useFullscreen`: rileva `document.fullscreenEnabled` e `document.documentElement.requestFullscreen`, nascondendosi se non supportati. La richiesta parte esclusivamente dal clic e riguarda `document.documentElement`, così navigazione React Router, controlli globali, portali e dialoghi fotografici restano nello stesso documento fullscreen. Nessun rientro automatico dopo refresh o uscita: lo stato segue `fullscreenchange` tramite `useSyncExternalStore`, incluso Esc. Lo stato di attesa disabilita altre richieste; un eventuale rifiuto produce un messaggio e permette di riprovare. Il fullscreen non entra nello stato del giocatore o nei salvataggi.

Per il collaudo verificare ingresso/uscita tramite pulsante ed Esc, navigazione tra hub e sale senza refresh, mappa/lista laterale, scroll delle prove lunghe e zoom/osservazione con dialoghi nativi. Controllare anche finestre basse e mobile; i browser senza API mantengono il normale layout e il comando musica.

## Aggiungere una sfida di tipo esistente

Per le interfacce condivise di emoji, indizi, Dupe e round/griglie fotografiche consultare le [rifiniture UI del 17 novembre 2026](RIFINITURE_UI_GIOCHI.md): `ProgressiveClueBoard`, `DupeRoundChoices` e `round-games.css` gestiscono la presentazione conservando i contratti di draft e runtime.

1. Individuare nel JSON un esempio dello stesso `type` e copiarne la struttura, usando un ID nuovo e stabile.
2. Compilare prompt, risposte, asset, ricompensa, eventuale indizio/costo e metadati di zona/sottogioco. Consultare `RawChallenge` in `src/types/challenge.d.ts` e la normalizzazione effettiva.
3. Se la sala usa gruppi, associare la prova tramite `challengeIds` o `quizTypes`. Verificare che nessun gruppo resti vuoto e che soglie/premi siano ancora quelli desiderati.
4. Mettere gli asset in `public/` e usare URL come `/cartella/file.png`. `challengeData.js` rimappa anche il vecchio prefisso `/src/data/musica/` in `/musica/`: preferire percorsi pubblici espliciti per nuovi contenuti.
5. Provare risposta corretta, errata, indizio, avanzamento, refresh e conteggio finale.

Esempio minimo raw per il tipo `multiple_choice`, da inserire nell'array `challenges` di una sala:

```json
{
  "id": "esempio-scelta-01",
  "type": "multiple_choice",
  "title": "Titolo della prova",
  "prompt": "Quale risposta scegli?",
  "choices": [
    { "id": "a", "text": "Prima risposta" },
    { "id": "b", "text": "Seconda risposta" }
  ],
  "correctChoiceId": "a",
  "creditReward": 10
}
```

L'esempio non configura da solo zona o gruppo di scoring: aggiungere quei campi secondo la sala di destinazione.

## Aggiungere un nuovo tipo

1. Definire contratti raw/normalizzati, draft e runtime in `src/types/challenge.d.ts`.
2. Implementare il ramo di normalizzazione in `src/lib/challengeData.js`.
3. Inizializzare i campi in `createInitialDraftAnswerForChallenge` e, se serve, `createInitialRuntimeStateForChallenge` in `challengeDraftState.js`.
4. Creare il template in `components/challenges/templates/`, riusando i componenti comuni. Seguire il contratto dei template vicini: `challenge`, `draftAnswer`, callback di aggiornamento, submit, disabled ed eventuale runtime.
5. Registrare etichetta, renderer e valutatore in `challengeRegistry.js`; includere feedback, punteggi parziali e righe di soluzione se applicabili. Estrarre matching riutilizzabile in `answerNormalization.js`.
6. Verificare che input e runtime siano serializzabili e si ricostruiscano dopo refresh. Non affidare timer/round solo a uno stato locale che debba sopravvivere alla ripresa.
7. Aggiungere almeno un contenuto reale e verificare la pipeline completa. Un file template da solo non rende il tipo utilizzabile.

## Aggiungere una sala

1. Creare `src/data/categories/<id>.json` prendendo una sala simile come riferimento. Conservare ID distinti e coerenti fra JSON, sfide e transizioni.
2. Importarla in `src/data/categories/index.js`.
3. Configurare sfide, zone/hotspot, narrazione, personaggi, paura, artefatto, costi, scoring e sottopremi dove necessari.
4. Aggiungere o adattare lo slot in `ShadowHallPage.jsx`: l'hub contiene logica esplicita per visibilità e progressione delle sale.
5. Aggiungere la transizione in `roomTransitions.js` e controllare `BridgePage.jsx`.
6. Cercare in `PlayPage.jsx` i rami specifici `musica`, `serie-film`, `cura-corpo`: vittoria, completamento e mail non sono interamente guidati dal JSON.
7. Definire modale vittoria e, se prevista, email con handler, helper client, trigger e tracking. Il riuso della modale serie-film richiede una verifica dei testi.
8. Verificare sblocco, acquisto, completamento, archivio, ritorno all'hub e ripresa con un profilo esistente e uno nuovo.

## Continua tra giochi

Dal 17 novembre 2026 il popup dell'ultimo round di `SequentialRoundChallenge` chiama `onSubmit(event, { continueToNext: true })`. `PlayPage` registra valutazione ed economia una sola volta, poi usa lo stesso `handleContinue` del risultato ordinario: chiude effetti e pannelli, seleziona la prossima prova non risolta e prepara l'introduzione del nuovo sottogioco. Non apre il riepilogo aggregato intermedio né la mappa. L'ordine delle prove segue il catalogo, attualmente coerente con zone e sottogiochi della mappa; le prove già risolte vengono saltate, ripartendo dall'inizio se necessario.

`useChallengeSession.goToNextChallenge({ submittedFeedback })` accetta il feedback appena valutato per avanzare nello stesso batch React, prima che lo stato dei risultati sia aggiornato. Senza argomento mantiene il flusso ordinario dopo il popup finale. Restano attivi limiti giornalieri, storico e completamento/premi della sala. Regressione locale: `node --test tests/sequentialRoundCompletion.test.mjs`; non richiede servizi remoti.

## Insetti volanti e ragni agli errori

Configurazione attiva di `cura-corpo` dal 17 novembre 2026: `fear.flyingInsectImageSrcs`, array opzionale normalizzato e dichiarato in `CategoryFear`. `FlyingInsectsErrorOverlay` mostra quindici copie: sette vespe (primo asset) e otto cimici (secondo asset), sopra il pannello senza intercettare clic. Ogni copia sceglie nuove destinazioni durante il volo, con curve, velocità e dimensioni diverse, inclinazione e inversione orizzontale secondo la direzione. Le vespe volano il 25% più velocemente rispetto alla prima revisione; la velocità delle ali resta quella del file. Partenza distribuita su una griglia di cinque colonne e tre righe; tre insetti per lato ricevono destinazioni nelle fasce laterali del 20%, mentre gli altri attraversano tutta la finestra. Le cimici usano luminosità 1,8, contrasto 1,2, saturazione 0,85 e una lieve ombra chiara/scura sul contorno per distinguersi dal rosso; il lampeggio è esplicitamente dietro gli insetti. I media originali restano invariati. I percorsi si adattano al ridimensionamento e tutte le animazioni vengono annullate alla chiusura. Il movimento ridotto nasconde l'intero effetto e arresta i voli.

Asset direttamente in `public/corpo-moda-fotografia/`: `wasp-wingbeat-fast.gif` deriva dalla GIF originale `Animated Wasp Wingbeat Sequence (1.25x).gif`, con soli ritardi modificati da 70 a 50 ms (1,4× rispetto al file fornito; 8 frame e trasparenza invariati). `insetto_sfondo_trasparente.webp` è un'immagine WebP animata trasparente: 121 frame da 42 ms, ciclo di 5,082 s; le ali battono. Entrambi gli originali restano integri.

`useFearEffects` mantiene audio e lampeggio fino alla chiusura del popup sia con `flyingInsectImageSrcs` sia con `spiderImageSrc`. Valgono gli stessi volumi e le stesse regole di storico, riavvio e pulizia descritte sotto. `ResultModal` dà precedenza agli insetti quando l'array è configurato; il passaggio vale anche per i popup intermedi dei round sequenziali.

### Ragni conservati per una sala futura

`SpiderErrorOverlay` e la relativa logica/CSS sono conservati. La GIF dei ragni è disponibile nel percorso pubblico `/33fd094fd495745cf38c4fe89a92a1e8.gif`, già spostata nella radice di `public/` prima di questa revisione. Per riutilizzarli configurare `fear.spiderImageSrc` nella prossima sala, senza `flyingInsectImageSrcs`.

Il campo opzionale `fear.spiderImageSrc` è normalizzato da `challengeData.js` e sostituisce le immagini statiche di errore della sala. `SpiderErrorOverlay` mostra sei copie con traiettorie, dimensioni e velocità diverse, in loop fino alla chiusura del popup, gestita da `useFearEffects`. Ultima revisione del 17 novembre: attraversamenti di 6,9–9,3 s e lampeggio rosso ciclico di 2,4 s, entrambi fino alla chiusura. Audio errore a volume 0,65 quando abilitato; `PlayPage` attenua la musica al 10% e ripristina il volume quando l'effetto termina, senza riavviare il brano.

Dal 17 novembre 2026 le copie sono ingrandite al doppio della dimensione precedente: larghezza responsive con minimo 96 px e massimi individuali di 144–240 px. La GIF originale (215×500, 67 frame) resta integra: l'animazione del file si combina con la traslazione CSS. Non viene ritagliata, per conservare tutti i frame. Verifica della resa della camminata nel browser non eseguita.

L'effetto è sopra lo sfondo e sopra il pannello dell'Inquisitore, non intercetta clic ed è escluso dalla consultazione dello storico. Ogni nuovo errore riavvia animazioni e audio senza aggiungere copie; Continua e lo smontaggio della pagina eliminano l'effetto. Con `prefers-reduced-motion` lampeggio e ragni sono nascosti. Il popup e il flusso di gioco restano disponibili.

## Cambiare stato o database

Aggiornare default, normalizzazione, tipi e payload insieme. Mantenere compatibilità con snapshot precedenti e distinguere riepiloghi da dettagli archiviati. Per modifiche remote ottenere prima schema e definizioni attuali: nel repository manca il bootstrap completo del backend.

Non usare reset di giocatori reali come scorciatoia di debug. Per prove email impiegare ambiente e indirizzo di test; i POST possono inviare messaggi effettivi.

## Verifica di una modifica di gioco

Per la revisione cura-corpo del 16 novembre 2026 valgono i vincoli specifici dell'utente: **soltanto lint e build, nessun browser né test visivo/manuale/end-to-end**. I draft `contentVersion: 2`, i timer e la compattazione sono descritti nella [nota d'implementazione](IMPLEMENTAZIONE_CORPO_MODA_FOTO.md). Il feedback interno a un round non deve chiamare il flusso di ricompensa della prova.

- Avvio, accesso e protezione delle route.
- Percorso corretto/errato, indizi e crediti.
- Consumo di tentativi e vite; blocchi quando esauriti.
- Refresh durante la prova e ritorno dopo logout/login.
- Soglie di vittoria ai valori di confine, sottopremi e transizione.
- Dettaglio archivio dopo completamento e riapertura.
- Visualizzazione desktop/mobile, asset e audio.
- `npm run build` e `npm run lint`.

Non esiste attualmente una suite test configurata. Per cambiamenti logici delicati dare priorità a test mirati di scoring, normalizzazione e serializzazione; riportare separatamente le prove manuali e quelle che richiedono servizi esterni.
