## 1. Mappatura stanze → paure → artefatti + logica di sblocco

### 1.1 Tabella definitiva

Usa questi ID/ruoli (gli id non ancora presenti saranno aggiunti in `categories.json`):

| Room ID (category.id) | Sala | Paura (ombra) | Artefatto | Effetto nel corridoio finale |
| --- | --- | --- | --- | --- |
| `musica` | Sala delle Frequenze | Horror / esoterico (esorcismi, bambole, IT, urla nel buio) | `hint` | +1 utilizzo di indizio: rivela parte della soluzione o restringe le opzioni in una domanda del corridoio. |
| `film-serie` | Sala Film / Serie TV | Clown, bambole assassine, VHS/TV che mostrano frammenti disturbanti | `shield` | +1 scudo: un errore nel corridoio non viene contato. |
| `cura-corpo` | Sala Cura del Corpo | Insetti addosso (api, cimici, scarafaggi) | `hint` | +1 indizio “soft”: elimina una risposta sbagliata o mostra un suggerimento testuale nel corridoio. |
| `arte-mito-letteratura` | Sala Arte / Mitologia / Letteratura | Ragni e ragnatele su statue e quadri | `shield` | +1 scudo (totale 2 se entrambe le sale “scudo” sono completate). |
| `crittografia-logica` | Sala Crittografia / Logica | Ansia da esami/valutazione (aula d’esame surreale) | `light_key` | +1 chiave di luce: permette di **saltare** una domanda del corridoio o vederne subito la soluzione. |

**Cosa fare in `categories.json`:**

Per ogni stanza principale:

- Aggiungi un blocco opzionale:

```jsonc
"fear": {
  "id": "horror-musica",
  "name": "Ombra dell'Esorcismo",
  "icon": "🕯️",              // solo per UI
  "description": "Urla lontane, croci rovesciate, rumori nel buio."
},
"rewardArtifact": {
  "type": "hint",            // 'hint' | 'shield' | 'light_key'
  "label": "Indizio sonoro",
  "description": "Ti concede un indizio extra nel corridoio finale."
}
```

(adatta `type/label/description` in base alla tabella sopra)

### 1.2 Logica di sblocco

Riusa le strutture già esistenti in `usePlayerState`:

- `unlockedCategoryIds` → stanze **accessibili**.  
- `roomProgress[categoryId].prizeWon` → stanza **superata per soglia** (già usato per premi/logica musica).

**Regole:**

- **Accesso stanza**:
  - Se il giocatore raggiunge la soglia minima → aggiungi la stanza (e le eventuali collegate) a `unlockedCategoryIds`.
  - Oppure, se compra la stanza con crediti → aggiungi la stanza a `unlockedCategoryIds` ma **non** impostare `prizeWon`.
- **Premio reale + artefatto**:
  - Li ottiene solo se `prizeWon === true` (cioè soglia superata almeno una volta).
- **Corridorio finale**:
  - Route sbloccata quando tutte le 5 stanze principali sono almeno in `unlockedCategoryIds`.
  - La difficoltà viene calcolata derivando gli artefatti da:
    - tutte le stanze dove `roomProgress[categoryId].prizeWon === true`,
    - la mappatura `category.rewardArtifact.type`.

Non creare nuovi campi in Supabase: gli artefatti vengono sempre calcolati dal `playerState` che già viene serializzato/deserializzato.

***

## 2. Compiti per Copilot: dati e helper

1. **Estendere `categories.json`** [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/149084807/2b3aabc3-2a05-4991-bd4c-0e9e108aa1b0/categories.json)
   - Aggiungi le 4 stanze mancanti con `id` definiti sopra (se non ci sono già).  
   - Per ogni stanza principale, aggiungi:
     - `fear`  
     - `rewardArtifact`  
     - `backgroundImage` (URL alle immagini Midjourney)  
     - opzionale: `mapImage`, `mapHotspots` se vuoi guidare il layout della piantina.

2. **Nuovo helper per artefatti** (es. `src/lib/artifacts.js`):

   - `getRoomArtifact(category)` → ritorna `category.rewardArtifact` o `null`.  
   - `getOwnedArtifacts(playerState, categories)` → ritorna array di artefatti basandosi su tutte le `category.id` in cui `roomProgress[categoryId].prizeWon === true`.  

   Questo helper servirà più avanti al corridoio finale.

***

## 3. Nuovo template quiz (per musica, poi riusabile)

Lavora principalmente su:

- `PlayPage.jsx` (orchestrazione della stanza).  
- `ChallengeLayout.jsx`, `ChallengeRenderer.jsx` e componenti di challenge (`MultipleChoiceChallenge`, `FreeTextChallenge`, ecc.).  
- `CharacterToast.jsx` / `MusicRoomNarrative.jsx` per mantenere coerenza di stile Achille/Sal.  

### 3.1 Sfondo stanza

- Crea un wrapper `RoomPlayLayout` (nuovo componente) che:
  - Riceve la `category` corrente (già utilizzata in `PlayPage`).
  - Applica come sfondo `category.backgroundImage` a tutta la pagina (stile simile a `MusicRoomNarrative`, overlay scuro + gradient).
  - Rende:
    - la **card del quiz** al centro,
    - i pulsanti laterali (indizio, mappa, eventualmente stato vite/crediti).

### 3.2 Pulsante indizio

- Rimuovi la sezione di hint testuale che oggi sta sotto il contenuto del quiz.  
- Nel layout (`RoomPlayLayout`) aggiungi un pulsante/icona “💡 Indizio”:

  - Se il giocatore ha tentativi disponibili e abbastanza crediti:  
    - apri un `HintModal` con il testo `challenge.hint`.  
    - gestisci costo e side effects riusando la logica esistente (hintCost, credito, eventuali commenti in `characterComments.onHintUsed`). [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/149084807/2b3aabc3-2a05-4991-bd4c-0e9e108aa1b0/categories.json)
  - Se non può usare indizi (no crediti o limite raggiunto): disabilita il pulsante con tooltip.

### 3.3 Card del quiz

Nel componente che effettivamente mostra il quiz (`ChallengeLayout`/`ChallengeRenderer`):

- La card deve contenere **solo**:
  - titolo, prompt,
  - asset (audio, image),
  - input (testo, opzioni, drag&drop),
  - pulsanti `Conferma` e (dopo correzione) `Continua`.
- Nessuna soluzione/explanation scrollabile sotto: portare tutto nel popup risultato.

### 3.4 Popup soluzione

- Crea un componente `ResultModal` (riusabile):

  - Props:  
    - `isOpen`, `resultType` (`success`/`failure`),  
    - `title`, `message` (usa `challenge.explanation` e un testo corto),  
    - eventuale `characterMessage` (estratto da `characterComments.onCorrect/onWrong` o dal campo `speaker` del challenge). [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/149084807/2b3aabc3-2a05-4991-bd4c-0e9e108aa1b0/categories.json)
    - `onContinue`.
  - Quando l’utente invia la risposta:
    - valuta come ora,
    - salva esito/crediti/progresso,
    - apre `ResultModal` con info giusta/sbagliata,
    - il resto della UI viene oscurato e non è interattivo finché il modal è aperto.
  - `Continua` chiude il modal e:
    - passa al prossimo quiz nel cluster,
    - oppure, se non c’è altro, torna al riepilogo stanza / mappa.

### 3.5 Pulsante mappa (piantina)

- Aggiungi un pulsante “🗺️ Mappa” nel layout, simmetrico al pulsante indizio.

- Crea `RoomMapModal`:

  - Mostra `category.mapImage` (piantina top‑down) come `<img>`.
  - Disegna `mapHotspots` come `div` assoluti, cliccabili, che chiamano `onSelectZone(zoneId)`.
  - Chiusura:
    - clic su X / overlay → chiude, torna alla domanda corrente;
    - clic su hotspot → chiude e chiede a `PlayPage` di caricare un quiz di quel cluster.

- In `PlayPage`, mantieni una mappatura `zoneId → array di challengeId`; `onSelectZone` può:

  - se il quiz corrente è della stessa zona: restare,
  - altrimenti passare al primo non ancora completato di quella zona.

### 3.6 Limiti giornalieri

- Ovunque in `PlayPage`/layout usi i pulsanti, consulta `usePlayerState().canAttemptQuiz()`:

  - Se è `false` → disabilita:
    - `Conferma`, `Continua`,
    - pulsante Mappa,
    - pulsante Indizio.
  - Aggiungi un piccolo banner “Hai finito i tentativi per oggi”.

***

## 4. Paure: visual & audio sugli errori

Senza testi espliciti: solo atmosfera.

### 4.1 Hook per effetti

- Crea un hook tipo `useFearEffects(category)`:

  - Ritorna `triggerWrongAnswerEffect()`.
  - Mantiene internamente uno stato `isFearActive` per qualche secondo dopo un errore.

- Nel punto dove già gestisci feedback di risposta (`ChallengeFeedback` / logica dei risultati), quando la risposta è sbagliata, chiama `triggerWrongAnswerEffect()`.

### 4.2 Overlay visivi per sala

Nel layout, in base a `category.fear.id` e `isFearActive`:

- Musica: overlay di gradient rosso + texture “esorcismo” (es. PNG con simboli), piccola animazione di opacity.  
- Film/serie: glitch TV (immagine con righe e statico in overlay sullo sfondo).  
- Cura del corpo: sprite/PNG insetti che appaiono sui bordi della card per un secondo.  
- Arte/mitologia/letteratura: ragnatele che crescono negli angoli della card.  
- Crittografia/logica: comparsa di un orologio/ombra di commissione in background.

### 4.3 Suoni

- Per ogni paura definisci un breve audio SFX (volume basso) e riproducilo in `triggerWrongAnswerEffect()` se non sta già suonando, senza bloccare l’audio del quiz.

***