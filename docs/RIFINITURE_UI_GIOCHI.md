# Rifiniture visive dei giochi cura-corpo

17 novembre 2026. Intervento di presentazione sui template esistenti, con sfondo scuro, accenti ciano/ambra e cornici arrotondate coerenti con la sala.

- **Brand da Emoji e Brand a Indizi Progressivi:** `ProgressiveClueBoard` dispone tracce e risposta su due colonne quando il contenitore raggiunge 640 px; sotto questa misura torna a una colonna. Emoji in carte numerate, indizi testuali in righe numerate, spazi segnaposto per le tracce ancora coperte. Pulsante secondario ciano per rivelare, conferma primaria ambra nel pannello risposta. Sono espliciti obiettivo, istruzioni, punti descrittivi e irreversibilità della conferma. Gli indizi coperti non sono inseriti nel testo accessibile.
- **Dupe o Originale:** `DupeRoundChoices` collega ciascuna foto alla propria scelta radio A/B. Foto e lettera sono selezionabili, il prodotto scelto ha contorno ambra, segno di spunta e testo di conferma; lo zoom ha un comando separato e un dialogo nativo chiudibile con Escape. A/B seguono le didascalie delle immagini, indipendentemente dall'ordine casuale dei pulsanti nel draft. La spiegazione distingue originale e alternativa simile.
- **Giochi sequenziali condivisi:** intestazione con titolo e obiettivo, barra dei round, selezioni arrotondate, riepilogo della scelta e conferma primaria. Vale anche per palette, dettagli, profumi e cultura generale.
- **Outfit, prodotti ed effetti:** schede numerate, stato di compilazione e conteggio delle risposte; campi e conferma coerenti con i giochi sequenziali. La variante opzionale `compact` di `ChallengeAssetGallery` evita cornici e intestazioni ripetute nelle schede, mantenendo zoom e contenuto del dialogo.

Gli stili sono in `src/components/challenges/common/round-games.css`, con container query e focus visibile. Le transizioni rispettano la preferenza di movimento ridotto. Hitster conserva la propria interfaccia; i supporti fotografici sono stati rifiniti nella revisione del 18 novembre descritta sotto.

## Abbinamento scatti e cultura generale — 18 novembre 2026

**Scatti e strumenti:** le foto restano mescolate secondo `imageOptionItemOrderIds`, ma i numeri visibili sono ora assegnati dopo il riordino, da Scatto 1 a Scatto 5. Numeri coerenti su schede, indicazione dello scatto attivo, destinazioni e nuove soluzioni del risultato. Gli ID salvati non cambiano. La selezione automatica segue il primo scatto libero nell'ordine mostrato. Le etichette degli archivi già registrati non vengono riscritte.

Eliminati i punti interrogativi letterali tra numero e stato. I comandi mostrano separatamente numero e «Seleziona»/«Selezionato». Due sezioni esplicite, «Seleziona uno scatto» e «Abbina lo strumento», sono affiancate da 900 px di contenitore; sotto questa misura si impilano. Ogni destinazione abbinata mostra miniatura, numero dello scatto e un vero pulsante «Rimuovi». Contatore delle coppie assegnate e conferma ambra disponibile dopo l'assegnazione di tutte le foto. Stili specifici in `templates/photo-support-matching.css`; il wrapper mantiene il contratto originale foto → strumento nel draft.

**Cultura generale:** `CultureRoundQuestion` distingue le domande fotografiche, aperte e a scelta. Foto intere più grandi, con zoom, a sinistra e pannello domanda/risposta a destra da 700 px; disposizione verticale sui contenitori stretti. Le domande senza foto usano lo spazio per opzioni leggibili; l'ottanio presenta campioni più grandi con lettere nell'ordine visibile. Conservati gli ID delle opzioni, i colori, le risposte, la valutazione e il flusso sequenziale.

**Verifiche:** build/lint e tredici verifiche React di interazione/regressione (`node --test --test-concurrency=1 tests/photoSupportInteraction.test.mjs tests/sequentialRoundCompletion.test.mjs`), rendering server dei dodici template e delle otto domande di cultura generale. I test nuovi controllano selezione nell'ordine visibile, corrispondenza tra numeri e ID salvati, sostituzione/rimozione senza duplicati, ripresa, blocco dei controlli e numeri nelle soluzioni. Resta il warning bundle preesistente.

**Browser nativo, anteprima isolata:** osservato l'abbinamento a tutta larghezza e in un contenitore da 390 px; verificati selezione, assegnazione, miniatura, contatore e avanzamento automatico alla foto successiva. Osservata la prima domanda di cultura generale a 390 px. Il controllo si è interrotto automaticamente al tentativo di passare alle domande successive, per impossibilità di verificare con sufficiente affidabilità l'URL di Chrome. Verifica visiva di cultura generale dunque parziale; foto/colore, zoom, tastiera e flusso completo non certificati nel browser. Nessuna risposta reale, reset, invio email o scrittura remota. Le prove usano soltanto stato React locale in un'anteprima separata.

ID, contenuti JSON, tipi di sfida, chiavi di draft/runtime, valutazione, soglie, timer, ricompense e persistenza restano quelli esistenti. Le callback del componente sequenziale continuano a gestire rivelazioni e conferme; i componenti aggiunti presentano questi dati. Nessuna migrazione richiesta.

## Verifiche e limiti

Build e lint superati; resta il warning preesistente sulle dimensioni del bundle. Superate le sette verifiche esistenti di `node --test tests/sequentialRoundCompletion.test.mjs`. Controlli aggiuntivi locali: rendering React server dei dodici template, corrispondenza foto/risposta per tutte le cinque coppie Dupe con scelte invertite, callback di rivelazione/risposta dei due giochi progressivi con conservazione degli altri conteggi.

**Verifica visiva incompleta:** osservata nel browser nativo soltanto l'interfaccia precedente di Hitster. Durante l'apertura di una scheda per l'anteprima isolata, Computer Use ha interrotto automaticamente il controllo perché non riusciva a verificare l'URL di Chrome con sufficiente affidabilità. Nessun ulteriore comando al browser; le nuove schermate desktop/mobile, lo zoom e la navigazione da tastiera richiedono ancora verifica visiva. Il rendering server non certifica questi aspetti né il flusso end-to-end. Nessuna risposta reale, reset, email o modifica dei servizi remoti effettuata in questo intervento.

## Riferimenti consultati

La ricerca web ha fornito spunti per la gerarchia dei controlli e per tenere insieme confronto, scelta e ingrandimento: [UI/UX Revamp, GDC 2025](https://media.gdcvault.com/gdc2025/Slides/Meretzky_Steve_Anatomy_Of_A.pdf), [Quick Pick: confronto a coppie](https://marisstella.app/quick-pick-survey/pick-the-best-photo). Le soluzioni visive sono adattate alla palette e ai componenti già presenti nell'applicazione.
