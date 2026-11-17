# Stato del progetto e lavoro rimanente

## Abbinamento scatti e cultura generale — 18 novembre 2026

**Implementato localmente:** numeri degli scatti assegnati nell'ordine effettivamente visibile, con identiche etichette sulle destinazioni e sulle nuove soluzioni; selezione automatica del prossimo scatto libero in quell'ordine. Rimossi i «?» tra numero e stato. Abbinamento con due passaggi espliciti, miniature degli scatti assegnati, rimozione separata, contatore e conferma finale. Cultura generale con foto più grandi e risposta affiancata, campioni colore e opzioni più leggibili. ID, risposte, punteggi e progressi conservati. Dettagli nelle [rifiniture UI giochi](RIFINITURE_UI_GIOCHI.md#abbinamento-scatti-e-cultura-generale--18-novembre-2026).

**Verificato:** build/lint, tredici verifiche React e rendering server dei dodici template e delle otto domande di cultura generale. Anteprima isolata nel browser nativo: abbinamento desktop/contenitore da 390 px e assegnazione con miniatura e selezione successiva; prima domanda di cultura generale a 390 px. **Verifica visiva di cultura generale parziale:** Computer Use interrotto automaticamente durante il passaggio alle altre domande per impossibilità di verificare l'URL di Chrome. Resta il warning bundle preesistente. Nessuna risposta reale, reset, email o modifica remota.

## Redistribuzione crediti cura-corpo — 18 novembre 2026

**Implementato localmente:** dettagli 6 → 8, outfit 10 → 12, effetti 9 → 7, prodotti 5 → 6, dupe 6 → 5, emoji 8 → 6. Gli altri sei giochi conservano le ricompense precedenti. Massimo stanza invariato: 98 crediti base, 112 con i bonus Hitster. Restano formula proporzionale e arrotondamento, soglie, costi, ID e progressi esistenti; nessun riaccredito retroattivo. Dettagli nelle [decisioni finali](DECISIONI_FINALI_CORPO_MODA_FOTO.md#crediti-aggiornati--18-novembre-2026).

**Verificato localmente:** confermati i dodici importi e i totali tramite il calcolatore ricompense esistente; confronto strutturale prima/dopo limitato ai sei `creditReward`. Build e lint superati; resta il warning bundle preesistente. Nessun browser o collaudo end-to-end, nessuna operazione remota.

## Rifiniture visive giochi cura-corpo — 17 novembre 2026

**Implementato localmente:** emoji e indizi con tracce numerate e pannello risposta laterale responsive; rivelazione secondaria ciano e conferma primaria ambra. Dupe con foto A/B selezionabili, spiegazione esplicita e zoom separato. Intestazioni, avanzamento e scelte dei giochi sequenziali più leggibili; outfit, prodotti ed effetti con schede e conteggio delle risposte compilate. Conservati stile generale, dati e contratti di salvataggio. Dettagli in [rifiniture UI giochi](RIFINITURE_UI_GIOCHI.md).

**Verificato localmente:** build/lint, sette verifiche sequenziali esistenti, rendering server dei dodici template e controlli mirati di corrispondenza A/B e callback progressive. Resta il warning bundle preesistente. **Nuove schermate non verificate visivamente:** Computer Use interrotto automaticamente durante l'apertura dell'anteprima locale per impossibilità di verificare l'URL di Chrome. Nessuna risposta reale, reset, email o modifica remota.

## Hitster stili con timeline orizzontale — 17 novembre 2026

**Implementato localmente:** carte stile sopra, timeline sotto con asse continuo, freccia «Più antico → Più recente» e sei posizioni numerate; la quarta raggruppa due look contemporanei. Eliminati i menu a tendina. Collocamento e scambio tramite selezione/tocco oppure trascinamento, zoom delle foto in dialogo nativo. Su contenitori stretti carte e timeline scorrono orizzontalmente; la nuova carta rivelata viene portata nella porzione visibile del mazzo. Conservati rivelazione progressiva, ID, `visualTimelineSlots`, risposte bonus, soglie e ricompense.

**Verificato localmente:** cinque verifiche React con rendering server e callback di interazione: rivelazione/collocamento completo, scambio nella posizione doppia, rientro nel mazzo della carta sostituita e ripresa con controlli disabilitati. Build e lint superati; resta il warning di dimensione bundle. **Verifica visiva non completata:** Computer Use si è interrotto automaticamente durante l'apertura dell'anteprima locale perché non riusciva a verificare l'URL di Chrome. Le verifiche React non certificano drag-and-drop nativo, focus/zoom o resa desktop/mobile nel browser. Nessun reset, invio email o intervento sui servizi remoti.

## Continua direttamente al gioco successivo — 17 novembre 2026

**Implementato localmente:** nell'ultimo popup dei giochi sequenziali, «Continua» registra l'esito complessivo e apre direttamente il prossimo gioco non risolto nell'ordine della mappa, con l'introduzione di Andy al cambio di sottogioco. Eliminato il riepilogo complessivo aggiuntivo tra i giochi. Rimangono storico, ricompense applicate una sola volta, limiti giornalieri e conclusione/premi della sala. Nessuna modifica a ID, dati salvati o backend.

**Verificato localmente:** sette verifiche di regressione sequenziali, build e lint superati (warning bundle preesistente). Nessun browser, collaudo end-to-end, email, reset o scrittura remota.

## Rifiniture insetti: velocità, numero e visibilità — 17 novembre 2026

**Implementato localmente:** quindici insetti totali, sette vespe e otto cimici (prima: cinque per tipo). Il volo delle vespe è più veloce del 25%; battito delle ali e file originali invariati. Partenza su cinque colonne e tre righe; tre insetti ricevono destinazioni nella fascia sinistra, tre in quella destra e gli altri attraversano tutta la finestra. Le cimici risultano più luminose e contrastate, con lieve contorno chiaro e ombra scura; il lampeggio rosso resta dietro gli insetti.

**Verificato localmente:** build e lint superati, con warning bundle preesistente. Browser con stato/RPC simulati: distribuzione 7+8, movimento di tutte le copie, dodici cambi di destinazione per copia senza accumulo di animazioni, fasce laterali e filtri applicati, permanenza fino alla chiusura, ridimensionamento, movimento ridotto, arresto/ripresa e pulizia audio. Screenshot desktop 1366×768 e mobile 390×844 ispezionati al picco rosso; nessun errore JavaScript. Nessuna operazione remota.

## Insetti volanti al posto dei ragni in cura-corpo — 17 novembre 2026

**Implementato localmente:** lo sfondo degli errori usa dieci insetti, cinque copie per ciascuno dei due asset forniti nella cartella della sala. Voli curvi con destinazioni casuali rinnovate continuamente, velocità e dimensioni diverse, inclinazione e cambio di verso. GIF accelerata di 1,4× rispetto al file fornito mediante una copia con ritardo 50 ms invece di 70 ms, senza modificare gli otto fotogrammi, la trasparenza o il loop. WebP confermato animato: 121 frame da 42 ms, ali in movimento. Originali e media/logica/CSS dei ragni conservati per la prossima stanza; la GIF dei ragni resta nella radice di `public/`, dove era già stata spostata. Nuovo campo opzionale `fear.flyingInsectImageSrcs` nei contratti e nella normalizzazione. Audio, attenuazione della musica, lampeggio, popup intermedi/finali e consultazione dello storico mantengono le regole precedenti.

**Verificato localmente:** build e lint superati (warning bundle preesistente); due regressioni sequenziali esistenti superate. Browser con stato/RPC simulati: caricamento dei due file e distribuzione 5+5, spostamento di tutte le copie, dodici cambi di destinazione per copia senza accumulo di animazioni, permanenza oltre quattro secondi, audio in loop a 0,65 e musica attenuata, ridimensionamento desktop/mobile, movimento ridotto con arresto/ripresa, chiusura e ripristino dell'audio. Screenshot a 1366×768 e 390×844 ispezionati, nessun errore JavaScript. Nessuna email, modifica dei servizi remoti o reset; persistenza Supabase reale non collaudata. Dettagli nella [guida sviluppo](GUIDA_SVILUPPO.md#insetti-volanti-e-ragni-agli-errori).

## Errori con ragni, tempi e motivo admin — 17 novembre 2026

**Implementato localmente:** attraversamenti dei ragni rallentati a un terzo della velocità precedente (6,9–9,3 s per percorso), lampeggio rosso continuo a ciclo di 2,4 s fino alla chiusura del popup. Con audio attivo, effetto errore a volume 0,65 e musica ambientale/prova attenuata al 10% del volume normale; la chiusura ferma l'effetto e ripristina la musica. Riattivando l'audio durante l'effetto, il suono riprende. Rimangono rispettate la preferenza audio e quella di movimento ridotto.

Palette a **5 s**, dettagli a **10 s**, con testi aggiornati; le scadenze già salvate non vengono estese. Nel pannello dev il motivo è facoltativo per il proprio profilo: se vuoto viene registrato automaticamente «Intervento sul proprio profilo». Per altri giocatori resta obbligatorio, compresa la validazione del piano. Nessuna modifica al backend.

**Verificato localmente:** dieci test admin/sequenziali, build e lint superati (warning bundle preesistente). Browser con profili/RPC simulati: propria modifica senza motivo e causale automatica inviata, motivo obbligatorio per altro giocatore, riproduzione effettiva del file audio errore con avanzamento del player, attenuazione/ripristino della musica, velocità e ciclo del rosso, pulizia degli effetti alla chiusura. Nessun reset o intervento su giocatori reali, email o scrittura remota.

## «Termina prova» nei giochi sequenziali — 17 novembre 2026

**Riprodotto nel browser:** dopo i tre round della palette, il clic su «Termina prova» generava `Cannot read properties of undefined (reading 'preventDefault')`. Il popup intermedio chiamava `onSubmit()` senza l'evento richiesto da `PlayPage.handleSubmit`, quindi la prova non veniva valutata.

**Corretto localmente:** `SequentialRoundChallenge` inoltra l'evento del clic alla conferma finale. La correzione vale anche per gli altri giochi che condividono il template, senza cambiare draft, ID o ricompense.

**Verificato localmente:** test di regressione fallito prima della correzione e superato dopo; due test sequenziali superati. Percorso browser completo dei tre round palette, ripresa del popup finale dopo refresh, risultato complessivo e passaggio ad Attenzione al dettaglio; crediti e tentativo applicati una volta sola. Nessun errore JavaScript, con profilo e salvataggi simulati. Build e lint superati, warning bundle preesistente. Nessun reset, invio email o modifica dei progressi remoti.

## Intro responsive e osservazione foto — 17 novembre 2026

**Osservato nel browser:** l'intro della sala corpo superava la finestra anche su desktop; «Inizia i Quiz» si sovrapponeva alla musica. A 390×844 la foto della palette iniziava vicino al fondo della finestra e il timer scorreva durante la ricerca dello zoom.

**Implementato localmente:** il contenitore di gioco usa lo spazio rimasto sotto la navigazione. Intro con un solo personaggio attivo, testo su una colonna ampia e azione finale separata; su schermi bassi scorre soltanto il messaggio, con «Mostra tutto» raggiungibile. Dopo il primo messaggio, «Continua» lascia il tempo di leggere prima di passare al secondo personaggio. Spazio riservato alla musica e rispetto delle aree sicure. Palette e dettagli aprono direttamente un dialogo a tutta finestra con foto intera `object-contain`, countdown e barra residua, senza scroll né secondo clic. Palette a 4 secondi, dettagli a 7. Caricamento incompleto non consuma il tempo; errore recuperabile senza riaprire la prova. Le scadenze assolute esistenti restano valide e non si azzerano al refresh. Allo scadere il dialogo sparisce e la domanda riceve il focus.

**Verificato localmente:** build e lint superati, warning bundle preesistente; regressione sequenziale esistente superata. Browser Chrome automatico con stato e salvataggi simulati: intro e pulsanti a 1366×768, 1024×600, 390×844, 320×568 e 844×390; osservazione palette mobile, dettagli desktop/orizzontale, caricamento lento, errore e riprova, scadenza, focus e ripresa senza estensione del tempo. Screenshot ispezionati. Nessuna scrittura remota, email o reset; non è una verifica della persistenza Supabase reale.

## Popup dei round già conclusi — 17 novembre 2026

**Individuato nel browser:** il popup dell'ultimo round di Attenzione al dettaglio ricompariva dopo la registrazione del risultato complessivo. La prova era già risolta e «Termina prova» rimaneva disabilitato, intrappolando la schermata.

**Corretto localmente:** il renderer comunica esplicitamente `isResolved` ai template. I giochi sequenziali già conclusi mostrano una scheda di consultazione con «Rivedi risultato»; non riaprono il popup intermedio conservato nel draft. La consultazione usa il risultato già registrato, senza nuova valutazione o ricompensa.

**Verificato:** test di regressione React per il draft con ultimo round bloccato e per la prova ancora attiva; build e lint superati, warning bundle preesistente. Le porte locali 5173/5174 servono il codice aggiornato. Il difetto è stato osservato nella finestra Chrome dell'utente; la verifica visiva della correzione è rimasta incompleta perché Computer Use si è interrotto al tentativo di ricarica per impossibilità di verificare l'URL. Nessun reset o nuova risposta inviati.

## Pannello admin e registro crediti — 17 novembre 2026

**Implementato:** `/dev` con selezione del giocatore, operazioni configurabili su stanza/gioco/round, introduzioni, accessi, limiti globali, saldo e profilo. Anteprima con importi previsti modificabili e motivo obbligatorio; storico di movimenti/interventi, storni, ripristini e copie dello stato precedente. Accesso esclusivamente admin. Salvataggi serializzati, richieste idempotenti e revisione per bloccare le schede obsolete. La migration è applicata al backend: conserva i saldi esistenti come punto di partenza, senza ricostruire il passato. Dettagli e limiti in [gestione admin](GESTIONE_ADMIN.md).

**Verificato localmente e con servizi:** build/lint, test mirati del modello e della coda, test SQL con profili sintetici e rollback, wrapper frontend con chiave pubblica, caricamento admin e anteprime delle tre stanze. Dati reali confrontati prima/dopo e invariati; nessun reset reale o invio email. **Non completata** la verifica visiva: Computer Use interrotto automaticamente per impossibilità di verificare l'URL del browser. Frontend non pubblicato.

## Interazioni cura-corpo - 17 novembre 2026

**Implementato localmente:** palette con distrattori cromatici piu simili; zoom durante l'osservazione a tempo con chiusura automatica alla scadenza; griglie outfit/prodotti/effetti con risposta anche nello zoom e invio unico; supporti con assegnazione foto ai nomi sul modello GoT. Popup condiviso a ogni conferma dei round sequenziali; ragni sopra il pannello e in loop fino alla chiusura. Economia applicata soltanto all'esito complessivo. Dettagli e compatibilita in [implementazione cura-corpo](IMPLEMENTAZIONE_CORPO_MODA_FOTO.md).

**Verificato localmente:** lint e build superati (warning dimensione bundle). Nessun browser o collaudo end-to-end, nessuna operazione remota.


## Interfaccia sale — 17 novembre 2026

**Implementato localmente:** le introduzioni delle sale possono crescere e scorrere secondo lo spazio disponibile, così il comando «Mostra tutto» resta raggiungibile anche con testi lunghi; su schermi piccoli viene mostrato un solo personaggio e messaggio alla volta. La pagina di gioco occupa tutta la larghezza, senza la cornice di padding del contenitore generale. Nella mappa i punti di accesso mostrano il nome della zona e la lista laterale usa righe leggibili con scorrimento quando necessario. L'audio ambientale continua durante prove e risultati quando la musica è attiva; lascia spazio alla musica specifica di una prova. Le porte già sbloccate di `serie-film` e `cura-corpo` restano navigabili anche con i limiti giornalieri esauriti: il blocco si applica alle prove.

**Verificato localmente:** build e lint superati. Con un profilo autenticato, entrambe le porte aprono la rispettiva route; la mappa di `serie-film` e `cura-corpo` si apre, e la selezione di una zona in `cura-corpo` mostra l'intro della prova. La verifica ha anche rivelato che la consultazione di un archivio richiamava nuovamente `registerRoomOutcome` a ogni rimontaggio, causando il lampeggio della mappa e nuove scritture del riepilogo. Ora l'effetto di registrazione esclude gli archivi in sola lettura. Il profilo di verifica era reale: prima della correzione, l'apertura dell'archivio ha attivato quel percorso remoto; nessuna risposta di prova è stata inviata e nessun reset è stato eseguito. La riproduzione dei file audio e la resa delle intro di stanza su tutte le dimensioni non sono state certificate.

## Correzione sblocco Sala delle Ombre — 17 novembre 2026

**Implementato:** saldo crediti sempre visibile nella mappa. Le porte rivelate di serie-film e cura-corpo aprono la conferma acquisto anche senza un `pendingBridge` conservato nel salvataggio. La disponibilità segue gli stessi requisiti della rivelazione (progressi musica per serie-film; completamento serie-film o passaggio pendente per cura-corpo). Un passaggio narrativo ancora da completare continua a portare alla route bridge. La modale mostra costo, saldo e crediti mancanti; soltanto la conferma acquisto è disabilitata con saldo insufficiente. Con limiti giornalieri esauriti è possibile acquistare, entrando il giorno seguente. Nessuna modifica a prezzi, progressi salvati o servizi remoti.

**Verificato localmente:** lint e build superati; resta il warning sulle dimensioni del bundle. Nessun collaudo browser o con Supabase.

Aggiornamento **16 novembre 2026**, cura-corpo: **implementati** i dodici giochi definitivi, 59 elementi, vittoria 8/12, regalo Kodak Charmera e nessun sottopremio attivo. Round sequenziali irreversibili, timer 3/7 secondi, timeline a sei caselle e stato persistibile: vedere [implementazione e compatibilità](IMPLEMENTAZIONE_CORPO_MODA_FOTO.md). Mappa, sfondo, audio e personaggi sono fuori da questo intervento. Le cifre 18 giochi/11 vittorie riportate nell'analisi storica sotto sono superate per la configurazione attiva della stanza. Verifiche di questa revisione: solo lint e build, senza browser o collaudi di gioco.

Verifiche del **17 novembre 2026** per questa revisione: build superata; lint segnala l'errore preesistente `react-refresh/only-export-components` in `.visual-check.jsx:9` (file dell'utente non modificato né eseguito). Dettagli nella nota d'implementazione.

Analisi storica del **24 ottobre 2026** sul workspace, incluse modifiche locali. Non è una certificazione del deploy. Priorità sotto proposte tecniche, da adattare agli obiettivi del regalo.

## Implementato nel codice

| Area | Evidenza e copertura |
| --- | --- |
| Ingresso | Home VIP, codice personale, bootstrap sessione, logout e route protette |
| Hub | Sala Ombre con porte, rivelazione/sblocco, progressione e artefatti |
| Musica | JSON con 12 sfide, UI, vittoria a 8 corrette e due email premio |
| Serie e film | JSON con 39 sfide, 13 gruppi, sottopremi, modale vittoria e due email |
| Corpo/moda/fotografia | JSON con 18 sfide, 18 gruppi, tre sottopremi e riuso della modale vittoria |
| Motore sfide | 19 tipi registrati, normalizzazione, input/runtime, rendering, valutazione e feedback |
| Sessioni | Avanzamento, draft e risultati persistibili, ripresa della sessione |
| Economia e limiti | Crediti, indizi, acquisto accessi, default di 3 tentativi e 2 vite giornalieri |
| Narrazione | Personaggi, commenti, audio, effetti paura, mappe e passaggi tra sale |
| Persistenza | Wrapper Supabase, payload normalizzati, riepiloghi e archivi delle sale |
| Admin | Pagina riservata e metodi di modifica/reset |
| Email | Quattro handler Resend con destinatario da database o override test e tracking |

Queste funzioni richiedono comunque verifica interattiva e servizi configurati. La sala cura-corpo e i nuovi template erano fra i file modificati/non tracciati durante l'analisi: la documentazione li include, anche se potrebbero non essere ancora nella revisione condivisa.

## Mancanze accertate nel repository

| Priorità proposta | Lacuna | Criterio di completamento |
| --- | --- | --- |
| Alta | Schema base Supabase, RPC principali, grant e policy non versionati integralmente | Un database di test vuoto può essere inizializzato e supporta login, salvataggio, admin e archivi |
| Alta | `.env.example` non elencava la service role richiesta dagli handler e conteneva un valore dall'aspetto di chiave Resend | Esempio con soli placeholder e tutte le variabili; sistemato nella documentazione/configurazione di questo intervento. Se quel valore era una credenziale reale, resta da revocarlo presso il provider |
| Media | Sale `arte-mito-letteratura` e `crittografia-logica` presenti come slot dell'hub, senza JSON caricati | Contenuti, sfide, asset, sblocco e verifica di navigazione aggiunti |
| Media | Corridoio/finale previsto nel design senza route dedicata attuale | Definire e implementare finale, utilizzo artefatti ed esito complessivo |
| Media | Nessun endpoint email specifico per cura-corpo | Decidere se serve e, in caso positivo, implementare premio, trigger, template e tracking |
| Media | Nessuno script test o suite di test di gioco identificata | Copertura mirata per scoring, serializzazione/ripresa e transizioni critiche |
| Bassa | Bundle frontend oltre 500 kB minificati | Valutare caricamento differito di pagine/template e misurare il risultato |
| Bassa | Nessun vincolo Node `engines` nel package | Documentare/fissare una versione verificata per sviluppo e deploy |

## Da verificare, non dichiarato guasto

- Schema effettivo, autorizzazioni RPC, colonne email e migration archivi nell'ambiente Supabase in uso.
- Ripresa dopo refresh di ogni template, soprattutto round, timer e indizi progressivi.
- Integrità di immagini/audio/video dei JSON e comportamento mobile/touch.
- Salvataggi ravvicinati: il provider usa debounce di 900 ms ma non mostra una coda di scritture. Verificare risposte fuori ordine e uscita prima del salvataggio.
- Invii concorrenti e errore dopo l'invio email ma prima del tracking: il controllo attuale non è una garanzia atomica contro duplicati.
- Coerenza dei testi, mittenti e premi della modale condivisa da serie-film e cura-corpo.
- Coerenza tra limiti client e regole del backend, cambio giorno, reset e consumo tentativi/vite.
- Uso effettivo degli artefatti nel finale; un artefatto mostrato nell'hub non dimostra un effetto giocabile finale.

## Verifiche eseguite

| Verifica | Esito |
| --- | --- |
| `npm run build` | Superata; 136 moduli, JS principale circa 770 kB minificati / 208 kB gzip; warning dimensione chunk e tempi plugin |
| `npm run lint` | Superata, exit code 0 |
| Browser/end-to-end | Non eseguiti |
| Supabase remoto e invio email | Non eseguiti |

## Sequenza di lavoro suggerita

1. Rendere riproducibile il backend e confermare il contratto di snapshot/archivi.
2. Collaudare l'intero percorso delle tre sale con un profilo di test, inclusi refresh e recupero errori.
3. Decidere il perimetro finale: altre due sale, corridoio, effetti degli artefatti e premi mancanti.
4. Implementare quel perimetro aggiornando qui stato, evidenze e verifiche.
5. Ottimizzare caricamento e manutenzione dopo aver stabilizzato i flussi.

Per aggiornare questo documento usare stati espliciti: **previsto**, **implementato**, **verificato localmente**, **verificato con servizi**. Indicare sempre revisione/data e cosa è stato realmente provato.
