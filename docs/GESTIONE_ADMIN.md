# Gestione amministrativa di progressi e crediti

Revisione del **17 novembre 2026**. Il pannello è implementato in `/dev` e riservato al ruolo `admin`. L'amministratore può selezionare il proprio profilo oppure uno degli altri codici attivi. Nessun codice admin è incorporato nel frontend o nelle migration.

## Utilizzo

1. Aprire **Dev**, selezionare il giocatore e premere **Carica profilo**.
2. Scegliere operazione, stanza ed eventualmente gioco/prova/round.
3. Configurare accesso, introduzione e limiti giornalieri quando applicabili.
4. Aprire **Mostra anteprima**, controllare gli effetti e modificare gli importi proposti.
5. Per gli altri giocatori scrivere il motivo; sul proprio profilo è facoltativo. Premere **Applica intervento**.

Revisione del 17 novembre: se il motivo è vuoto e il destinatario coincide con l'amministratore autenticato, il client registra automaticamente **Intervento sul proprio profilo**. Un motivo scritto viene conservato. Il confronto usa il profilo effettivamente caricato, senza codici incorporati nel frontend; per gli altri destinatari il campo resta obbligatorio. Il server continua a ricevere una causale non vuota, senza modifiche a RPC, migration o autorizzazioni.

L'anteprima non modifica il giocatore. Il backend rifiuta una richiesta se il profilo è cambiato dopo il caricamento: ricaricare e prepararla nuovamente. La pagina mostra successo solo dopo la risposta del database.

| Operazione | Comportamento |
| --- | --- |
| Azzera stanza | Rimuove risultati, riepiloghi e archivio della sola stanza; interrompe la sessione se appartiene alla stanza. Le altre stanze restano invariate |
| Ricomincia gioco | Rimuove tutte le prove del gruppo di scoring/sottogioco e riapre la sessione, conservando risposte e stato degli altri giochi. Il risultato finale della stanza è invalidato e verrà ricalcolato alla nuova conclusione |
| Riparti da un round | Per palette, quiz a round e indizi progressivi sequenziali, conserva i round precedenti e riapre quello selezionato e i successivi, cancellando risposte, blocchi, indizi rivelati e timer interessati |
| Ripristina introduzione | Mostra nuovamente l'introduzione della stanza senza cancellare l'avanzamento |
| Imposta accesso | Mantiene, apre gratuitamente o richiede nuovamente lo sblocco della stanza. Musica deve restare accessibile |
| Imposta limiti di oggi | Imposta tentativi e vite **globali** rimasti oggi, non contatori per stanza |
| Interrompi sessione | Elimina la sessione attiva non archiviata e torna alla mappa; mantiene i crediti salvo un successivo intervento economico |
| Rettifica crediti | Applica una variazione firmata, positiva o negativa |
| Azzera profilo | Rimuove tutte le stanze/sessioni/archivi, ripristina i limiti e propone saldo zero. Mantiene codice, ruolo e tracking di premi/email |

Non si possono riaprire contemporaneamente sessioni in stanze diverse: interrompere prima l'altra sessione. Per giochi senza un formato di round supportato usare il reset del gioco intero. Se un vecchio salvataggio non contiene più le risposte necessarie, il pannello lo segnala: resta disponibile il reset stanza.

I passaggi narrativi pendenti collegati alla stanza modificata vengono rimossi. Un reset non revoca automaticamente accessi e risultati delle stanze successive. Il flag `introSeen` separa l'introduzione da `startedAt`; i salvataggi precedenti conservano il fallback storico sul timestamp. Le nuove sessioni chiuse per vittoria anticipata conservano anche il dettaglio parziale per consultazione e ripristino.

## Registro economico, senza ricostruzione del passato

La migration conserva il saldo esistente come **saldo iniziale**, senza ricostruire guadagni o spese precedenti. Da allora ogni variazione viene registrata in `player_credit_movements`:

- ricompense dei giochi;
- indizi e tempo aggiuntivo acquistati;
- accessi alle stanze e acquisti cumulativi;
- rettifiche admin, storni e ripristini;
- variazioni effettuate da client precedenti o query dirette, registrate dal trigger come rettifiche esterne quando non forniscono una causale più precisa.

Ogni movimento contiene importo, saldo risultante, data, causale, autore e, quando disponibili, stanza/prova e intervento amministrativo. Le righe originali non sono cancellate dagli interventi: uno storno crea un movimento inverso collegato; il ripristino crea un ulteriore movimento collegato. Solo l'ultimo elemento della catena è modificabile.

I reset propongono separatamente **rimozione crediti ottenuti** e **restituzione crediti spesi**, calcolate sui movimenti ancora attivi nell'ambito selezionato. Gli importi sono modificabili e il saldo finale è visibile prima dell'applicazione. Un importo diverso dal previsto produce gli storni esatti più una rettifica separata, collegata allo stesso intervento. Anche impostare zero chiude i movimenti selezionati e registra la compensazione necessaria a conservare il saldo.

Il costo dell'accesso a una stanza viene rimborsato automaticamente soltanto se si richiede nuovamente lo sblocco. Un acquisto cumulativo non è ripartibile con certezza fra stanze: viene incluso nel reset completo del profilo, mentre per una singola stanza si può rettificare manualmente l'importo. Per un reset di round, la ricompensa è quella complessiva della prova: non esistono movimenti economici per i singoli round.

Le compensazioni create dall'admin restano movimenti attivi e possono essere coinvolte in reset successivi del medesimo ambito. Un saldo finale negativo è rifiutato; si possono correggere gli importi nell'anteprima. Crediti di attività anteriori al registro possono essere compensati manualmente e la differenza resta tracciata.

## Storico e recupero

Il pannello offre due viste paginate (50 righe per pagina), con ricerca nella pagina corrente:

- **Movimenti crediti:** causale, importo, saldo, riferimenti e comando per preparare annullamento/ripristino del singolo movimento. Questa operazione modifica solo i crediti.
- **Interventi e ripristini:** motivo, importi previsti/applicati e comando per preparare il ripristino dello stato precedente.

Ogni intervento conserva una copia completa prima e dopo: progresso, limiti del giorno, archivi e stato delle catene economiche. Il ripristino di uno stato precedente sostituisce **anche i progressi successivi**: l'anteprima lo esplicita e propone il saldo precedente, modificabile. Anche il ripristino è un nuovo intervento e conserva lo stato che sostituisce.

Il tracking delle email resta invariato: il pannello non invia, reinvia o ritira messaggi. Le nuove giocate possono assegnare nuovamente crediti; le ricompense non sono bloccate da un divieto generale di ripetizione. Il reinvio amministrativo delle email e una modalità di testing/allenamento sono fuori da questo intervento.

## Persistenza e autorizzazioni

Migration: `supabase/migrations/20261117194025_admin_operations_and_credit_ledger.sql`, applicata al backend collegato il 17 novembre 2026. Il nome locale è allineato alla versione effettiva registrata dal backend. Dipende dallo schema base esistente, recuperato e ispezionato prima dell'intervento; il repository continua a non contenere un bootstrap completo di quel backend.

Nuove RPC:

| RPC | Contratto |
| --- | --- |
| `admin_list_players` | `p_admin_code` → codici attivi e ruoli |
| `admin_get_player_context` | `p_admin_code`, `p_target_code`, `p_history_offset` → snapshot, archivi, ultimi movimenti/interventi e tutte le catene economiche correnti |
| `admin_get_operation` | `p_admin_code`, `p_target_code`, `p_operation_id` → checkpoint autorizzato |
| `admin_apply_operation` | `p_admin_code`, `p_target_code`, `p_plan` → applicazione atomica e nuovo contesto |

Il piano include ID di richiesta, revisione attesa, motivo, impostazioni, righe economiche, nuovo progresso/limiti e archivi da conservare. Il server verifica il ruolo tramite il codice dell'**attore**, separato dal codice del destinatario; blocca il profilo per la durata della transazione e valida catene, saldo e revisione. Le tabelle sono protette da RLS e prive di accesso diretto per `anon`/`authenticated`; gli helper sono nello schema privato o non eseguibili dal client. Le RPC pubbliche usano il modello di autenticazione per codice già presente nel gioco, non una sessione Supabase Auth.

`app_save_snapshot` riceve anche `state_revision`, `save_id`, `credit_movements` e gli eventuali `archives` nel progresso. Progresso, contatori, registro e archivi vengono salvati nella stessa transazione. `playerSaveQueue.js` serializza le richieste, rimuove i movimenti già confermati e riutilizza lo stesso ID quando manca la risposta a una richiesta potenzialmente già applicata. Una risposta di un login precedente non aggiorna la sessione successiva.

I client precedenti vengono ancora registrati come rettifiche esterne; dopo un intervento admin sul giocatore devono usare il frontend aggiornato, perché i salvataggi senza revisione vengono rifiutati. Il vecchio salvataggio separato degli archivi ha la stessa protezione dopo un intervento admin. I vecchi reset RPC richiedono l'admin e rimandano al nuovo pannello. Il normale salvataggio non può aumentare i limiti giornalieri, rimuovere stanze/accessi o azzerare risultati già registrati; gli interventi passano dalla RPC amministrativa.

In caso di conflitto le scritture di quella scheda vengono fermate e un avviso propone di ricaricare il gioco. Per errori di rete l'avviso permette di riprovare il salvataggio. Se una richiesta admin non riceve conferma, il pannello mantiene il payload identico per ritentarla senza duplicazioni.

Gli advisor Supabase sono stati consultati prima/dopo: restano i warning delle RPC `SECURITY DEFINER` eseguibili dai ruoli client, previsti dal modello di accesso tramite codice; ogni nuova RPC admin verifica il ruolo server-side. Le segnalazioni informative RLS senza policy indicano qui tabelle volutamente non accessibili direttamente. I due warning preesistenti sul search path di `set_updated_at` e `app_rome_today` non sono stati modificati. [Riferimento advisor](https://supabase.com/docs/guides/database/database-linter).

## Verifiche effettuate

- Build e lint locali; test mirati con `node --test tests/adminOperations.test.mjs tests/playerSaveQueue.test.mjs`.
- `supabase/tests/admin_operations.sql`: test sul database con codici sintetici in una transazione annullata, comprendenti guadagni/spese, idempotenza, importi modificati, reset archivi/contatori, permessi, salvataggi obsoleti, rollback atomico, ripristino checkpoint, annullamento/ripristino movimento e quadratura del registro.
- Chiamate reali attraverso i wrapper frontend e la chiave pubblica: elenco giocatori, autorizzazione admin, caricamento storico/snapshot, preparazione delle anteprime per le tre stanze. Nessun piano applicato a giocatori reali.
- HTTP locale: route `/dev` e modulo React del pannello serviti correttamente.
- Impronte dei dati dei giocatori confrontate prima/dopo migration e test SQL: progresso, archivi e contatori invariati; aggiunte soltanto le voci di saldo iniziale.
- Verifica visiva/interattiva **non completata**: browser host non disponibile, poi Computer Use interrotto automaticamente perché non poteva determinare con sicurezza l'URL della finestra. Nessuna email inviata e nessun reset reale eseguito. Il frontend non è stato pubblicato da questo intervento.
