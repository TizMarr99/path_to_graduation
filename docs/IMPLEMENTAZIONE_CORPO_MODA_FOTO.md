# Implementazione dei giochi cura-corpo

16 novembre 2026. Stato: **implementato** nel workspace. Specifiche: [prompt consolidato](PROMPT_COMPLETAMENTO_STANZA_CORPO_MODA_FOTO.md) e [decisioni finali](DECISIONI_FINALI_CORPO_MODA_FOTO.md). Mappa illustrata, sfondo, audio ambientale e personaggi restano alle integrazioni preesistenti e saranno affrontati separatamente.

## Contenuti e flusso

La configurazione attiva contiene 12 giochi, 12 gruppi di peso 1 e 59 elementi complessivi nelle cinque zone. Vittoria a 8 giochi superati su 12; soglia stanza 0,6 e soglia di gruppo 1 sull'esito booleano della singola prova. Il regalo finale è Kodak Charmera; nessun sottopremio attivo. Lo Specchio Prismatico rimane l'artefatto narrativo.

| Gioco | Elementi | Soglia | Interazione |
| --- | --- | --- | --- |
| Palette | 3 | 2 | Osservazione 3 s, poi campione singolo senza nomi |
| Dettagli | 4 | 3 | Osservazione 7 s, poi foto oscurata e domanda |
| Hitster stili | 7 | 5 | Rivelazione singola, sei caselle, quarta condivisa |
| Outfit | 7 | 6 | Personaggio a risposta aperta |
| Effetti | 5 | 4 | Originale e varianti insieme, cinque risposte aperte |
| Supporti | 5 | 4 | Associazione unica e modificabile prima dell'invio |
| Prodotti | 4 | 3 | Tipo di prodotto a risposta aperta |
| Dupe | 5 coppie | 3 | Una coppia A/B per round, originale in B/B/A/B/A |
| Profumi | 3 | 2 | Quattro opzioni per profumo |
| Emoji | 4 | 3 | Emoji cumulative su richiesta, risposta aperta |
| Indizi | 4 | 3 | Due storici e due disegni su carta, testi approvati |
| Cultura | 8 | 6 | Tre domande chiuse e cinque aperte |

`SequentialRoundChallenge` gestisce un solo round, conferma irreversibile, soluzione immediata e avanzamento senza ritorno. Dopo l'ultimo feedback, «Termina prova» registra l'esito complessivo già confermato: non propone una seconda revisione delle risposte. Soltanto quell'esito passa alla normale economia di tentativi, vite e crediti.

Hitster ed effetti hanno un unico invio finale. Hitster mostra i bonus solo dopo aver rivelato e collocato tutti i look: nome e decade valgono un credito extra ciascuno, massimo 14 oltre ai 12 massimi dell’ordinamento (aggiornamento approvato il 17 novembre). Emoji e indizi assegnano 3/2/1/1 punti descrittivi secondo le rivelazioni, ma il superamento dipende da tre brand corretti, senza convertirli in premi economici.

## Stato e compatibilità

### Rifiniture hub e asset — 17 novembre 2026

Lo Specchio Prismatico viene mostrato sulla porta di cura-corpo nell'hub quando il premio è vinto, con lo stesso criterio degli artefatti delle altre sale. Rimossi dalla configurazione i tre percorsi obsoleti delle immagini statiche d'errore: la stanza usa la GIF dei ragni e il relativo audio. Crediti e soglie invariati.

Verifica delle rifiniture: build superata (warning dimensione bundle); lint con il solo errore preesistente `.visual-check.jsx:9`, `react-refresh/only-export-components`. Nessun collaudo browser o remoto.

### Revisione dialoghi — 17 novembre 2026

Riscritti headline, lead, dialoghi d'ingresso e introduzioni dei dodici giochi. Andrea Sachs parla in prima persona con complicità e suggerimenti pratici; Miranda Priestly usa ironia fredda e giudizi taglienti sulle risposte. Il repertorio contiene 8 commenti di successo, 10 d'errore, 5 per gli indizi e 6 per l'esitazione, selezionati dal meccanismo casuale esistente (che può ancora ripetere una battuta).

Ogni gioco ha `successMessage` e `failureMessage` dedicati. Il riepilogo delle prove `contentVersion: 2` con round ora antepone il messaggio pertinente al conteggio corrette e agli eventuali punti descrittivi; i feedback intermedi dei singoli round mantengono stato corretto/errato e soluzione. ID, risposte accettate, soglie, premi e salvataggi non cambiano.

Verifica della revisione narrativa: JSON letto correttamente, 12 giochi con entrambi gli esiti personalizzati; build superata con il warning sulla dimensione del bundle. Lint: resta l'errore preesistente `react-refresh/only-export-components` in `.visual-check.jsx:9`. Nessun collaudo browser o con servizi remoti.

- Gli ID dei dodici giochi mantenuti non cambiano, compreso `cc-fragrance-families-01` per i tre profumi e il vecchio ID `hippie-1970` del look simbolo degli anni Sessanta.
- I sei giochi assorbiti (`cc-color-intruder-01`, `cc-garment-names-01`, `cc-style-moodboard-01`, `cc-styling-error-01`, `cc-makeup-names-01`, `cc-brand-products-01`) sono esclusi dal catalogo attivo. I loro risultati, i vecchi sottopremi negli archivi e gli snapshot non vengono cancellati; non concorrono al nuovo conteggio delle prove attive.
- `contentVersion: 2` distingue i nuovi input. Risultati già registrati per ID mantenuti restano risolti e non vengono ripagati; i draft non confermati della vecchia versione si inizializzano per il nuovo contenuto, senza azzerare risultati o archivi.
- Draft serializzabile: `lockedRounds`, `roundCursor`, `roundChoiceOrders`, risposte aperte/scelte, disposizione A/B, `visualTimelineSlots`, bonus nomi e decadi. Runtime: scadenze assolute, indizi rivelati e numero di look rivelati. Il compattatore di `PlayPage` conserva tutti questi campi.
- Le scadenze iniziano dopo il caricamento osservabile, non si azzerano alla ripresa e non consentono zoom sull'originale. Se l'immagine carica mentre la pagina è nascosta, la prima osservazione attende che sia visibile. Una scadenza già iniziata continua a decorrere.
- Conferme, scadenze e rivelazioni usano il percorso di salvataggio immediato del provider esistente; le modifiche ordinarie delle risposte usano il debounce. Nessun database alternativo in localStorage, nuova RPC o modifica remota. La durabilità al refresh dipende comunque dal buon esito della sincronizzazione Supabase, come per il resto del progetto.
- Un insieme di ID già inviati protegge dagli invii ripetuti nella sessione; i risultati persistiti impediscono nuove ricompense alla ripresa. I bonus descrittivi emoji/indizi restano nei metadati; Hitster salva invece `bonusCredits` nel feedback e li somma una sola volta alla ricompensa proporzionale della timeline, senza alterare il rapporto di scoring.

Normalizzazione, valutazione finale e feedback del round condividono `evaluateVisualRound`; le risposte aperte riusano `matchesAcceptedAnswer`. Per i prodotti sono accettate anche le combinazioni categoria + marca riconosciuta, senza accettare la sola marca. Nessun matching remoto o approssimativo aggiunto.

## Verifiche

Controlli finali del 17 novembre 2026: `npm run build` superata (140 moduli, bundle JS circa 775 kB; warning dimensione chunk e tempi plugin, già presenti nell'analisi storica). `npm run lint` termina con un solo errore preesistente in `.visual-check.jsx:9`, regola `react-refresh/only-export-components`, e zero avvisi: il file era già presente e non viene modificato o eseguito. L'avviso sul valore predefinito delle scadenze nel timer è stato corretto; entrambi i comandi sono stati ripetuti dopo la correzione.

Nessun browser, screenshot, test visivo, manuale o end-to-end; nessuna email, pubblicazione, modifica remota o reset di giocatori. Questi controlli non certificano il gameplay né la sincronizzazione con i servizi.

### Bilanciamento e bonus Hitster — 17 novembre 2026

Applicati i sette aumenti approvati nelle decisioni finali: massimo base 98 crediti, 112 includendo i 14 bonus Hitster. Feedback e modale distinguono base e bonus; soglia 5/7 e peso stanza invariati. Il campo opzionale `ChallengeFeedback.bonusCredits` segue la persistenza già esistente dei risultati. I vecchi risultati senza campo restano validi e non vengono ripagati. L’Hitster musicale attuale mostra i bonus titolo/artista nella UI ma non li remunera nel valutatore: non modificato in questo intervento.

Le rivelazioni con immagini originali, inizialmente proposte in questa revisione economica, sono state implementate nella revisione successiva descritta sotto.

Verifiche di questa revisione economica: build superata con warning dimensione bundle; lint con il solo errore preesistente `.visual-check.jsx:9`. Nessun browser, test di gioco o operazione remota.

### Rivelazioni dopo risposta — 17 novembre 2026

Aggiunto il campo opzionale `solutionAssets` ai round quiz raw/normalizzati e ai contratti JSDoc. `SequentialRoundChallenge` monta la galleria solo per un round confermato: quattro originali dei dettagli, sette outfit completi con nome e cinque coppie dupe con marchio e ruolo. Il resolver inverte anche le immagini di soluzione secondo `dupeSwappedRoundIds`; le lettere A/B sono assegnate dopo l’inversione e restano coerenti con la domanda. La galleria è rimontata per round/fase, senza lasciare aperto lo zoom passando alla domanda successiva. Nessun nuovo stato runtime o salvataggio necessario.

Dopo la correzione dell’utente, la domanda dello strumento usa Oboe come risposta attesa; cornamusa, flauto traverso e violino sono i distrattori. Gli ID delle opzioni sono invariati e la risposta corretta passa da `0` a `2`. Rimossa la precedente spiegazione sulla presunta sacca della cornamusa. Nessun azzeramento o ricalcolo delle prove già completate.

Verifiche: tutti i percorsi delle nuove rivelazioni presenti; build superata con warning dimensione bundle; lint segnala soltanto l’errore preesistente `.visual-check.jsx:9`. Ispezionate le immagini sorgente pertinenti per la scelta editoriale, senza browser, screenshot del gioco, collaudo end-to-end o operazioni remote.

### Disposizione dupe approvata — 17 novembre 2026

Il campo opzionale `dupeOriginalSides` configura B/B/A/B/A per l’originale nei cinque round. Normalizzazione e contratti aggiornati; il draft iniziale ricava gli ID da invertire confrontando i lati richiesti con le risposte del JSON. Il resolver esistente allinea domanda, valutazione e rivelazione; i draft già salvati mantengono la propria disposizione.

Verifica: build superata; lint con il solo errore preesistente `.visual-check.jsx:9`. Nessun collaudo browser o remoto.
