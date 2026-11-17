# Stato del progetto e lavoro rimanente

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
