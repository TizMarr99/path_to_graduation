# Media corpo, moda e fotografia: inventario corrente

> Ultimo aggiornamento modalità/naming: filtri a risposta aperta, cinque varianti tutte insieme con originale di confronto; supporti ad associazione come GoT senza indizi. Unico invio finale per entrambi. In `osservazione/` i nomi attivi sono ora `palette-01.jpg` ... `palette-03.jpg`, `dettaglio-01.png` ... `dettaglio-04.png` e corrispondenti `dettaglio-NN-d.png` oscurati, già forniti dall’utente. Nessun pixel modificato nella rinomina. Le descrizioni storiche sotto non prevalgono sul [prompt corrente](PROMPT_COMPLETAMENTO_STANZA_CORPO_MODA_FOTO.md).

> Correzione metodologica del 15 novembre: prima concordare tutte le modalità, poi implementare. Nessun browser o test visivo/manuale/end-to-end in questa fase. Hitster progressivo, un look alla volta, bonus per nome e anni, riordino e casella condivisa per disco/punk. Outfit e prodotti beauty a risposta aperta con varianti concordate; superate le precedenti indicazioni di associazione/opzioni. Specifica aggiornata nel [documento di passaggio](PROMPT_COMPLETAMENTO_STANZA_CORPO_MODA_FOTO.md).

> Aggiornamento 15 novembre: dupe puliti verificati (10 JPEG 1254×1254, percorsi JSON validi); originali in `originali/dupe-originale/`. Beauty: mantenere i brand, nessuna scritta funzionale evidente nelle quattro immagini attuali, nessun ulteriore editing richiesto. Ora ci sono sette foto di osservazione (sei più una riserva da selezionare) e sette outfit senza volto, inclusi Frida e Freddie Mercury. I punti sotto relativi a sesta foto e due outfit mancanti sono quindi superati. Per lo stato e il passaggio a VS Code usare [Prompt di completamento](PROMPT_COMPLETAMENTO_STANZA_CORPO_MODA_FOTO.md); snapshot corrente in `MEDIA_CORPO_MODA_FOTOGRAFIA_CHECK_2026-11-15.json`.

Aggiornato il 14 novembre 2026. Sostituisce come inventario operativo il report del 24 ottobre. Stato: file organizzati e verificati; contenuti e template dei giochi non ancora riallineati al progetto rivisto in chat.

## Organizzazione eseguita

Radice: `public/corpo-moda-fotografia/`. Tutti i 51 file preesistenti sono conservati senza modifiche ai pixel o al formato. Il manifest `MEDIA_CORPO_MODA_FOTOGRAFIA_MANIFEST.json` registra percorso precedente, percorso nuovo e SHA-256 per ogni file. Nessuna eliminazione di immagini.

| Cartella | File | Destinazione |
| --- | ---: | --- |
| `osservazione` | 5 | Foto raccolte per palette/dettagli; assegnazione definitiva ancora da chiudere |
| `hitster-stili` | 7 | Flapper, greaser, hippie, disco, punk, hip-hop, grunge |
| `outfit-iconici` | 5 | Versioni senza volto di Marilyn, Michael Jackson, Diana, Audrey e Undici |
| `fotografia-effetti` | 5 | Bianco e nero, seppia, vignettatura, sfocatura, pixelatura |
| `fotografia-supporti` | 5 | Scogliera, neve/fuoristrada, concerto, ritratto istantaneo, scena subacquea |
| `beauty-prodotti` | 4 | Primer e.l.f., setting spray Urban Decay, illuminante Rare Beauty, prodotto labbra YSL |
| `dupe-originale` | 10 | Cinque coppie; numero iniziale comune identifica la coppia, non la risposta A/B |
| `originali` | 8 | Cinque foto outfit, sorgente effetti, due alternative/sorgenti beauty |
| `riserve` | 2 | Power dressing escluso dalla selezione; variante verde primer e.l.f. |

Successivamente al riordino, su richiesta dell'utente, i 12 file AVIF/WebP attivi sono stati convertiti in veri JPEG, qualità 95, senza ridimensionamento, con sfondo bianco per eventuale trasparenza. I sorgenti integri sono conservati in `originali/formati-sorgente/`; il manifest conserva hash dei sorgenti e delle conversioni. Ora i file complessivi sono 63: 51 sorgenti conservati e 12 JPG derivati. Le dieci referenze dupe del JSON sono aggiornate ai nuovi percorsi, inclusa l'estensione JPG; gli altri media non sono stati collegati a domande obsolete per evitare risposte incoerenti. Il JSON contiene ancora la vecchia stanza da 18 prove.

## Scelte recepite e limiti del codice attuale

- **Hitster:** power dressing tolto dalla selezione. Hip-hop resta come candidato anni Ottanta; disco e punk appartengono allo stesso gruppo anni Settanta e il loro ordine reciproco deve essere indifferente. Ordine previsto: flapper (20), greaser (50), hippie (60), disco/punk (70, equivalenti), hip-hop (80), grunge (90). Sono periodi simbolo del gioco, non origini o durate esclusive degli stili. Fonti cronologiche delle singole foto ancora da documentare.
- Il template attuale usa un'unica lista e confronta ID a posizioni esatte (`countCorrectPlacements`). Non supporta ancora slot condivisi o parità. Nella prossima implementazione di Hitster estendere soltanto questo tipo alla valutazione per gruppi equivalenti; non modificare la funzione condivisa alterando altri giochi. Accettare entrambe le permutazioni disco/punk nelle due posizioni dello stesso periodo e mostrarne la parità nell'interfaccia. Non considerare questa funzionalità implementata.
- **Outfit:** mantenere le cinque versioni senza volto così come sono, inclusi Marilyn e Michael Jackson; niente ulteriori ritagli complessi. Obiettivo proposto dall'utente: sette soggetti e soglia 6/7. Mancano due outfit meno facili, ancora da scegliere; nessuna sostituzione o aumento della soglia è stato applicato al JSON corrente.
- **Supporti:** compatta digitale esclusa per scarsa distinguibilità; rimangono cinque categorie (rullino 35 mm, istantanea, usa e getta, smartphone, action cam). La scogliera è dichiarata dall'utente scattata con Canon AF35ML e Kodak Portra 400, formato 35 mm: categoria rullino, indipendentemente dal fatto che la fotocamera sia compatta. Le altre immagini hanno nomi di soggetto, non nomi di dispositivi dedotti dall'estetica. Fonti e abbinamenti degli altri quattro scatti/indizi da registrare prima della pubblicazione delle domande.
- **Beauty:** una sola immagine per ciascuno dei quattro prodotti; e.l.f. compare una volta nella selezione attiva e una volta nella coppia dupe. Variante primer e foto beauty alternative conservate separatamente. Il prodotto YSL non è identificabile con certezza come lip tint dalla sola immagine: recuperare nome esatto o formulare la domanda come prodotto labbra/rossetto liquido soltanto dopo conferma. Non inventare la funzione di un prodotto.
- **Effetti:** cinque versioni approvate e conservate; l'originale è separato. Nessun aumento della difficoltà o ulteriore effetto introdotto.

## Immagini su cui lavorare ancora

### Beauty: quattro immagini attive

Caricare ciascun file individualmente in ChatGPT. Prompt base:

> Mantieni marca, logo e monogrammi originali. Rimuovi soltanto le parole che dichiarano la funzione o la categoria del prodotto (per esempio primer, setting spray, highlighter, lip tint e traduzioni), compresi eventuali nomi commerciali che contengono esplicitamente la risposta. Conserva i nomi commerciali che non la rivelano. Ricostruisci soltanto le aree delle scritte rimosse. Conserva esattamente forma, colore e dimensioni del contenitore, tappo, pompa o applicatore, livello del liquido e texture mostrata. Non aggiungere dettagli, non sostituire il prodotto, non cambiare sfondo o inquadratura. Non aggiungere testo, etichette o watermark. Mantieni la risoluzione e restituisci un'immagine singola.

| File in `beauty-prodotti/` | Correzione |
| --- | --- |
| `01-primer-elf.png` | Mantenere e.l.f.; togliere soltanto parole che svelano la funzione. Conservare goccia di gel e dosatore |
| `02-setting-spray-urban-decay.png` | Mantenere logo, monogramma e marca Urban Decay; togliere soltanto scritte funzionali come setting spray. Conservare erogatore e confezione viola |
| `03-illuminante-rare-beauty.png` | Mantenere Rare Beauty; togliere soltanto parole come illuminante/highlighter se presenti. Conservare applicatore, colore e swatch luminoso |
| `04-prodotto-labbra-ysl.png` | Mantenere i monogrammi YSL su flacone e tappo. Rimuovere soltanto eventuali parole che svelano la categoria. Conservare applicatore e prodotto rosso. Prima di fissare la risposta, identificare il prodotto esatto |

La marca è un indizio ammesso in questa prova e non va oscurata. Se l'immagine non contiene già scritte funzionali, non occorre modificarla. Dopo l'eventuale editing verificare insieme a opzioni plausibili, non soltanto come immagini isolate. Questa regola non si applica alle coppie dupe, dove i marchi espliciti vanno rimossi.

### Dupe: dieci immagini, cinque coppie

Modificare ciascuna immagine separatamente. Conservare geometria e dettagli del prodotto: il gioco richiede riconoscimento, non confronto fra confezioni reinventate. Non sostituire le forme caratteristiche (triangolo metallico della borsa, quadrifogli, fibbie, silhouette dei flaconi).

Prompt base:

> Rimuovi nomi di marca/prodotto, testi e loghi leggibili che svelano direttamente la marca. Mantieni rigorosamente forma, materiali, colori, cuciture, chiusure, motivi e dettagli strutturali del prodotto; sui badge elimina solo scritte e simboli espliciti, mantenendone la forma. Non abbellire, non ridisegnare e non rendere il prodotto più simile all'altro della coppia. Sfondo neutro, nessuna nuova scritta o watermark.

| Coppia/file in `dupe-originale/` | Intervento mirato |
| --- | --- |
| `01-illuminante-hollywood.jpg` / `01-illuminante-elf.jpg` | Togliere testi Hollywood/Flawless Filter, monogramma CT, e.l.f. e testi residui. Preservare applicatori e flaconi |
| `02-profumo-jadore.jpg` / `02-profumo-lidl.jpg` | Togliere nomi e scritte. Per Lidl eliminare la scatola e ricostruire lo sfondo, mantenendo il flacone; poi uniformare visivamente lo spazio occupato dalle due immagini |
| `03-borsa-prada.jpg` / `03-borsa-jwpei.jpg` | Togliere scritte/logo, conservando badge e sagoma. Uniformare margini e dimensione apparente senza deformare le borse |
| `04-scarpe-prada.jpg` / `04-scarpe-zara.jpg` | Togliere scritte sulle placche o solette se visibili, senza rimuovere fibbie, placche o dettagli strutturali. Uniformare scala e margini |
| `05-bracciale-vancleef.jpg` / `05-bracciale-swarovski.jpg` | Rimuovere marchi eventualmente leggibili. Nel Van Cleef eliminare la barra/scarabocchio sotto il bracciale ricostruendo lo sfondo. Conservare quadrifogli e fiore: sono la differenza da riconoscere |

Per tutte le coppie: stessa proporzione del riquadro, sfondo e dimensione apparente comparabili. La galleria attuale mostra i file con `object-contain`: differenze di spazio bianco resterebbero visibili. Non serve identificare il lato corretto nel nome pubblico o nelle didascalie; A/B sarà alternato quando si aggiorneranno le domande. L'hint attuale che svela tutte le risposte A deve essere rimosso in quella fase.

### Nessun intervento richiesto ora

- I cinque outfit attivi sono già senza volto e sono stati accettati così dall'utente. Gli originali con volto non vanno usati come file di gioco.
- I cinque effetti sono completi e non richiedono ulteriori modifiche.
- Le foto Hitster non richiedono oscuramento dei volti: il gioco testa il periodo e non l'identità del soggetto. Eventuali scritte che rivelano lo stile/decade andranno verificate alla visualizzazione finale.
- I cinque scatti dei supporti non devono essere ritoccati: si altererebbero gli indizi visivi. Definire prima gli indizi testuali.
- Le cinque foto di osservazione non vanno ritoccate prima di fissare domande e palette; manca una sesta foto a carico dell'utente.

## Ancora aperto

1. Sesta foto di osservazione e assegnazione definitiva delle sei domande.
2. Due nuovi outfit meno immediati: selezione sospesa, nessun soggetto aggiunto autonomamente.
3. Identità esatta del prodotto labbra YSL.
4. Abbinamenti/fonti dei quattro supporti diversi dalla scogliera e relativi indizi.
5. Modalità profumi, rebus emoji, indizi brand e otto domande di cultura generale.
6. Riallineamento del JSON, gruppi, soglie, sottopremi, timer e template al progetto rivisto.

## Verifica di questo intervento

- Ispezione visiva delle immagini tramite fogli di contatto e immagini singole.
- Conteggio e SHA-256 prima/dopo per tutti i 51 spostamenti; nessuna modifica del contenuto binario.
- Percorsi dupe del JSON aggiornati e verificati sul filesystem.
- Questo riordino non certifica il funzionamento dei giochi: nessuna modifica ai template o alle risposte delle sfide.
