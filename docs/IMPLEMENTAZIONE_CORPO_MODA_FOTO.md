# Implementazione dei giochi cura-corpo

16 novembre 2026. Stato: **implementato** nel workspace. Specifiche: [prompt consolidato](PROMPT_COMPLETAMENTO_STANZA_CORPO_MODA_FOTO.md) e [decisioni finali](DECISIONI_FINALI_CORPO_MODA_FOTO.md). Mappa illustrata, sfondo, audio ambientale e personaggi restano alle integrazioni preesistenti e saranno affrontati separatamente.

## Contenuti e flusso

Ultima revisione dello sfondo errori, **17 novembre 2026**: `cura-corpo` usa ora due insetti volanti tramite `fear.flyingInsectImageSrcs`, al posto dei ragni. Quindici copie (sette vespe e otto cimici) con voli curvi casuali, nuove destinazioni continue e orientamento secondo la direzione. Vespe con volo velocizzato del 25% rispetto alla prima revisione, tre insetti dedicati a ciascuna fascia laterale, cimici più luminose e contrastate con contorno leggero per distinguerle dal lampeggio rosso. GIF accelerata da 70 a 50 ms per frame in una copia separata; WebP confermato animato (121 frame, ali in movimento). Media e componente dei ragni restano disponibili per la prossima sala. Audio, lampeggio, chiusura del popup, storico e preferenze mantengono il comportamento precedente. Contratto, asset e riuso documentati nella [guida sviluppo](GUIDA_SVILUPPO.md#insetti-volanti-e-ragni-agli-errori). Le note sui ragni nelle revisioni precedenti sotto descrivono lo stato storico.

La configurazione attiva contiene 12 giochi, 12 gruppi di peso 1 e 59 elementi complessivi nelle cinque zone. Vittoria a 8 giochi superati su 12; soglia stanza 0,6 e soglia di gruppo 1 sull'esito booleano della singola prova. Il regalo finale è Kodak Charmera; nessun sottopremio attivo. Lo Specchio Prismatico rimane l'artefatto narrativo.

| Gioco | Elementi | Soglia | Interazione |
| --- | --- | --- | --- |
| Palette | 3 | 2 | Osservazione 5 s a tutta finestra (ultima revisione 17 novembre), poi campione singolo senza nomi |
| Dettagli | 4 | 3 | Osservazione 10 s, poi foto oscurata e domanda |
| Hitster stili | 7 | 5 | Rivelazione singola, sei caselle, quarta condivisa |
| Outfit | 7 | 6 | Griglia di foto, personaggi a risposta aperta e unico invio |
| Effetti | 5 | 4 | Originale e varianti insieme, cinque risposte aperte |
| Supporti | 5 | 4 | Associazione unica e modificabile prima dell'invio |
| Prodotti | 4 | 3 | Griglia di foto, tipi di prodotto a risposta aperta e unico invio |
| Dupe | 5 coppie | 3 | Una coppia A/B per round, originale in B/B/A/B/A |
| Profumi | 3 | 2 | Quattro opzioni per profumo |
| Emoji | 4 | 3 | Emoji cumulative su richiesta, risposta aperta |
| Indizi | 4 | 3 | Due storici e due disegni su carta, testi approvati |
| Cultura | 8 | 6 | Tre domande chiuse e cinque aperte |

`SequentialRoundChallenge` gestisce un solo round, conferma irreversibile, soluzione immediata e avanzamento senza ritorno. Dal 17 novembre 2026, «Continua» sull'ultimo feedback registra l'esito complessivo e passa direttamente al prossimo gioco non risolto nell'ordine della mappa, con l'introduzione di Andy quando cambia sottogioco. Non apre un ulteriore riepilogo complessivo e non richiede di aprire la mappa. Soltanto l'esito complessivo passa alla normale economia di tentativi, vite e crediti; i limiti giornalieri continuano a bloccare l'inizio di nuovi giochi. All'ultima prova restano il completamento e i premi della sala. I risultati registrati restano consultabili dallo storico.

Hitster, outfit, prodotti ed effetti hanno un unico invio finale. Hitster mostra i bonus solo dopo aver rivelato e collocato tutti i look: nome e decade valgono un credito extra ciascuno, massimo 14 oltre ai 12 massimi dell’ordinamento (aggiornamento approvato il 17 novembre). Emoji e indizi assegnano 3/2/1/1 punti descrittivi secondo le rivelazioni, ma il superamento dipende da tre brand corretti, senza convertirli in premi economici.

### Interfaccia Hitster — 17 novembre 2026

`VisualTimelineChallenge` presenta il mazzo delle carte stile sopra una timeline orizzontale: asse continuo, freccia dal più antico al più recente, sei posizioni numerate e quarta posizione doppia per i contemporanei. Foto intere e ingrandibili, carte ancora coperte e indicazione della posizione assegnata. Si seleziona una carta e si tocca la destinazione, oppure si trascina; nelle posizioni piene si scambia con la carta scelta. Se la carta in ingresso non aveva una posizione, quella sostituita ritorna tra le carte da collocare e blocca la rivelazione successiva. Su contenitori stretti entrambe le file scorrono orizzontalmente; la nuova carta viene resa visibile automaticamente. Lo zoom usa un dialogo nativo, chiudibile anche con Escape.

La modifica conserva draft, runtime, dati, scoring e accredito esistenti. Verifiche: `node --test tests/visualTimelineInteraction.test.mjs` (cinque verifiche con rendering React server e callback), lint e build. Nessuna verifica visiva completata: Computer Use interrotto automaticamente per impossibilità di verificare l'URL di Chrome. Trascinamento nativo, zoom/focus e layout nel browser restano da collaudare; nessuna operazione remota.

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
- Draft serializzabile: `lockedRounds`, `roundCursor`, `roundChoiceOrders`, risposte aperte/scelte, `visualTimelineSlots`, bonus nomi e decadi. Runtime: scadenze assolute, indizi rivelati e numero di look rivelati. Il compattatore di `PlayPage` conserva tutti questi campi.
- Le scadenze iniziano dopo il caricamento osservabile, non si azzerano alla ripresa e non consentono zoom sull'originale. Se l'immagine carica mentre la pagina è nascosta, la prima osservazione attende che sia visibile. Una scadenza già iniziata continua a decorrere.
- Conferme, scadenze e rivelazioni usano il percorso di salvataggio immediato del provider esistente; le modifiche ordinarie delle risposte usano il debounce. Nessun database alternativo in localStorage, nuova RPC o modifica remota. La durabilità al refresh dipende comunque dal buon esito della sincronizzazione Supabase, come per il resto del progetto.
- Un insieme di ID già inviati protegge dagli invii ripetuti nella sessione; i risultati persistiti impediscono nuove ricompense alla ripresa. I bonus descrittivi emoji/indizi restano nei metadati; Hitster salva invece `bonusCredits` nel feedback e li somma una sola volta alla ricompensa proporzionale della timeline, senza alterare il rapporto di scoring.

Normalizzazione, valutazione finale e feedback del round condividono `evaluateVisualRound`; le risposte aperte riusano `matchesAcceptedAnswer`. Per i prodotti sono accettate anche le combinazioni categoria + marca riconosciuta, senza accettare la sola marca. Nessun matching remoto o approssimativo aggiunto.

## Verifiche

Controlli finali del 17 novembre 2026: `npm run build` superata (140 moduli, bundle JS circa 775 kB; warning dimensione chunk e tempi plugin, già presenti nell'analisi storica). `npm run lint` termina con un solo errore preesistente in `.visual-check.jsx:9`, regola `react-refresh/only-export-components`, e zero avvisi: il file era già presente e non viene modificato o eseguito. L'avviso sul valore predefinito delle scadenze nel timer è stato corretto; entrambi i comandi sono stati ripetuti dopo la correzione.

Nessun browser, screenshot, test visivo, manuale o end-to-end; nessuna email, pubblicazione, modifica remota o reset di giocatori. Questi controlli non certificano il gameplay né la sincronizzazione con i servizi.

### Redistribuzione crediti — 18 novembre 2026

Aggiornati soltanto i `creditReward` di sei giochi: dettagli 8, outfit 12, effetti 7, prodotti 6, dupe 5, emoji 6. La redistribuzione premia maggiormente osservazione e riconoscimento a risposta aperta; riduce il compenso dei riconoscimenti più immediati o aiutati dalle alternative/indizi. Restano palette 6, Hitster 12 più fino a 14 bonus, supporti 9, profumi 5, indizi 10 e cultura 12: massimo base 98, con bonus 112. Nessun cambiamento alla formula proporzionale, alle soglie, ai costi o ai salvataggi; nessun riaccredito dei risultati già registrati.

### Bilanciamento e bonus Hitster — 17 novembre 2026

Applicati i sette aumenti approvati nelle decisioni finali: massimo base 98 crediti, 112 includendo i 14 bonus Hitster. Feedback e modale distinguono base e bonus; soglia 5/7 e peso stanza invariati. Il campo opzionale `ChallengeFeedback.bonusCredits` segue la persistenza già esistente dei risultati. I vecchi risultati senza campo restano validi e non vengono ripagati. L’Hitster musicale attuale mostra i bonus titolo/artista nella UI ma non li remunera nel valutatore: non modificato in questo intervento.

Le rivelazioni con immagini originali, inizialmente proposte in questa revisione economica, sono state implementate nella revisione successiva descritta sotto.

Verifiche di questa revisione economica: build superata con warning dimensione bundle; lint con il solo errore preesistente `.visual-check.jsx:9`. Nessun browser, test di gioco o operazione remota.

### Rivelazioni dopo risposta — 17 novembre 2026

Aggiunto il campo opzionale `solutionAssets` ai round quiz raw/normalizzati e ai contratti JSDoc. `SequentialRoundChallenge` monta la galleria solo per un round confermato: quattro originali dei dettagli, sette outfit completi con nome e cinque coppie dupe con marchio e ruolo. Immagini della domanda, immagini di soluzione, lettere A/B e risposta corretta sono configurate direttamente nel JSON e condivise da rendering e valutatore. La galleria è rimontata per round/fase, senza lasciare aperto lo zoom passando alla domanda successiva. Nessun nuovo stato runtime o salvataggio necessario.

Dopo la correzione dell’utente, la domanda dello strumento usa Oboe come risposta attesa; cornamusa, flauto traverso e violino sono i distrattori. Gli ID delle opzioni sono invariati e la risposta corretta passa da `0` a `2`. Rimossa la precedente spiegazione sulla presunta sacca della cornamusa. Nessun azzeramento o ricalcolo delle prove già completate.

Verifiche: tutti i percorsi delle nuove rivelazioni presenti; build superata con warning dimensione bundle; lint segnala soltanto l’errore preesistente `.visual-check.jsx:9`. Ispezionate le immagini sorgente pertinenti per la scelta editoriale, senza browser, screenshot del gioco, collaudo end-to-end o operazioni remote.

### Disposizione dupe approvata — 17 novembre 2026

L’utente ha confermato che non esistono tentativi iniziati: B/B/A/B/A è ora definito direttamente nell’ordine degli asset e nelle risposte dei cinque round JSON. Rimossi i campi `alternateDupeSides`, `dupeOriginalSides`, `dupeSwappedRoundIds`, il resolver di inversione e i relativi rami di normalizzazione, draft, ripresa e persistenza. Anche le didascalie delle soluzioni sono nel JSON. Nessun reset o intervento remoto; la compatibilità generale delle altre prove resta invariata.

Verifica: build superata; lint con il solo errore preesistente `.visual-check.jsx:9`. Nessun collaudo browser o remoto.

### Palette, zoom e conferme - 17 novembre 2026

**Implementato localmente:** distrattori della palette con tonalita piu vicine al campione corretto, conservando ID e campioni corretti. Osservazione palette/dettagli ingrandibile con countdown visibile anche nello zoom: la scadenza smonta la galleria e il suo dialogo, mostrando la domanda senza prolungare il tempo.

Outfit e prodotti passano alla griglia simultanea degli effetti: miniature, risposta modificabile sia nella scheda sia nello zoom, unico invio completo. Gli effetti mantengono l'originale separato dalle varianti. Le soluzioni fotografiche degli outfit restano disponibili nel risultato finale. I draft precedenti recuperano anche risposte gia confermate; risultati e premi registrati non vengono ricalcolati. Supporti presenta gli scatti selezionabili e i nomi come destinazioni, sul modello dei motti GoT, mantenendo il contratto salvato foto -> supporto e l'assegnazione unica.

Le prove sequenziali (palette, dettagli, dupe, profumi, indizi e cultura) mostrano il popup condiviso a ogni conferma con commento del personaggio e soluzione; Continua avanza e l'ultimo round porta al riepilogo complessivo. Le griglie mostrano il popup dopo l'invio unico. Solo il risultato complessivo continua a gestire tentativi, vite e crediti. Il popup intermedio non assegna ricompense. I ragni passano sopra il pannello, senza intercettare clic, e GIF, traiettorie e audio attivo continuano fino alla chiusura; le altre sale mantengono la durata precedente. Preferenza audio e movimento ridotto rispettate.

**Verificato localmente:** lint e build superati; resta il warning sulle dimensioni del bundle. Nessun browser, test visivo/manuale/end-to-end o accesso ai servizi remoti.

### Uscita dal popup dopo la conclusione — 17 novembre 2026

Correzione successiva del clic finale: il popup di un gioco ancora attivo chiamava `onSubmit()` senza inoltrare l'evento, causando un errore su `event.preventDefault()` in `PlayPage`. Ora «Termina prova» passa l'evento alla funzione di invio. Il test di regressione riproduce l'errore prima della modifica e verifica il contratto dopo; nel browser sono stati completati i tre round palette fino al risultato complessivo usando stato e RPC simulati, senza operazioni remote. Build e lint superati.

Il controllo della finestra Chrome ha mostrato un popup «Termina prova» disabilitato nell'ultimo round di Attenzione al dettaglio: il risultato complessivo era già presente, ma il draft conservava correttamente il round bloccato e ne riapriva il popup dopo la chiusura del risultato finale.

`ChallengeRenderer` inoltra ora `isResolved` e `onReview` ai template. Quando la prova è già risolta, `SequentialRoundChallenge` mostra «Prova conclusa» e il comando «Rivedi risultato», invece di rimontare il dialogo intermedio. Il comando apre lo storico tramite `selectChallenge`, senza inviare risposte né applicare nuovamente l'economia. La stessa informazione è passata in entrambi i layout della pagina.

Il test `node --test tests/sequentialRoundCompletion.test.mjs` renderizza lo stato persistito con ultimo round bloccato e verifica l'assenza del popup; controlla anche che una prova non risolta mantenga il modulo di risposta. Build e lint superati. Codice aggiornato servito sulle porte locali 5173 e 5174. La verifica visiva dopo la correzione non è stata completata: Computer Use si è interrotto durante il tentativo di ricarica, perché non poteva verificare con sicurezza l'URL. Nessun reset, nuova risposta o invio email eseguito.

### Nomi e leggibilita dei campioni palette - 17 novembre 2026

Soluzioni cromatiche piu specifiche: cuffie verde oliva desaturato, montatura arancione bruciato, borsa borgogna. Anche i distrattori oliva e viola hanno nomi distintivi. Il verde muschio e il rosso mattone della terza palette sono leggermente piu separati dai rispettivi campioni corretti, mantenendo la difficolta sulle tonalita vicine. Campioni corretti, ID e scoring invariati; i risultati storici non vengono riscritti.

### Intro responsive e foto già ingrandita — 17 novembre 2026

La pagina di gioco occupa l'altezza disponibile sotto la navigazione. `MusicRoomNarrative` usa una sola coppia ritratto/messaggio attiva, dimensioni adattate anche all'altezza dello schermo e un footer separato dal testo. Soltanto il testo può scorrere sui dispositivi più piccoli; il comando del typewriter rimane fuori dal passaggio scorrevole. Dopo il messaggio del guardiano si attende «Continua», per consentire la lettura anche quando occorre scorrere. Il footer e la barra di gioco riservano spazio al comando musica, che rispetta le safe area.

`TimedObservation` apre direttamente un dialogo nativo a tutta finestra: immagine intera con `object-contain`, spazio riservato a countdown e barra residua, nessuna galleria da ingrandire. Il dialogo mantiene il focus e rende inerti i controlli sottostanti, inclusa la musica, per la durata dell'osservazione. La domanda resta nascosta; alla scadenza la foto viene smontata e il focus passa alla domanda. Escape non interrompe né riavvia un'osservazione già iniziata. Prima dell'avvio, un errore di caricamento consente riprova o ritorno alla prova senza consumare il timer.

La scadenza viene registrata dopo il caricamento delle immagini e due frame di preparazione, soltanto a pagina visibile. Resta assoluta nel runtime esistente: ripresa e refresh non concedono una seconda osservazione. Nessun nuovo campo di salvataggio. I tre round palette passano a 4 secondi; i dettagli restano a 7. Una scadenza già salvata non viene estesa. ID, risposte e risultati registrati restano compatibili.

Verifica: build/lint e regressione sequenziale superati; screenshot e interazioni browser con profilo e RPC simulati, nelle cinque dimensioni documentate nello stato progetto. Controllati caricamento lento, errore/riprova, foto nei limiti della finestra, focus modale, chiusura automatica e refresh senza nuova scadenza. Nessuna operazione remota; persistenza reale non collaudata in questa revisione.


### Ragni e tempi definitivi ? 17 novembre 2026

Ultima richiesta: palette a 5 s e attenzione al dettaglio a 10 s; introduzioni e messaggi allineati. Le scadenze assolute gi? avviate restano immutate. Attraversamenti dei sei ragni a 6,9?9,3 s, con sfasamenti proporzionati; la GIF originale resta integra. Rosso pulsante ogni 2,4 s per tutta la permanenza del popup. Con audio attivo il suono errore ? in loop a volume 0,65, mentre la musica ambientale o della prova scende al 10% senza ricominciare il brano. La chiusura ripristina il volume normale; riattivazione audio e ritorno alla pagina riprendono il suono se l?effetto ? ancora attivo. Movimento ridotto continua a escludere ragni e lampeggio.

Verifica browser con stato/RPC simulati: player audio realmente in riproduzione, volumi prima/durante/dopo, interruzione e ripresa tramite comando audio, animazioni persistenti e rimozione alla chiusura. Build e lint superati; nessuna operazione remota.
