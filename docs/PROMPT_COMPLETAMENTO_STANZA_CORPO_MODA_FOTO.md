# Specifica unica per implementare la stanza corpo, moda e fotografia

Consolidata il 16 novembre 2026. Questo documento sostituisce le precedenti versioni dello stesso prompt: contiene soltanto le decisioni attive. I documenti con inventari del 14/15 novembre, snapshot e manifest sono storici, non specifiche funzionali. Non considerare gli esempi del vecchio JSON come contenuti approvati. ID stanza: `cura-corpo`; preservare ID delle sfide mantenute e salvataggi esistenti.

## Chiusura delle decisioni — aggiornamento prioritario

**Progettazione chiusa.** Leggere anche `docs/DECISIONI_FINALI_CORPO_MODA_FOTO.md`, che è parte integrante di questa specifica: contiene tempi 3/7 secondi, banner residuo, tutte le alternative, sinonimi delegati, mappatura dei supporti, campioni ottanio, soglie e bonus. Vittoria **8 giochi su 12**, unico regalo **Kodak Charmera**, nessun sottoregalo. L’utente ha delegato le scelte di bilanciamento e validazione e ha accettato le domande profumi: non richiedere nuovamente conferma dei precedenti punti aperti.

## Come iniziare in VS Code

Leggere AGENTS.md, README.md, docs/STATO_PROGETTO.md, docs/README.md e docs/GUIDA_SVILUPPO.md. Eseguire `git status --short`: esistono numerose modifiche dell’utente e implementazioni parziali, da preservare e confrontare con questa specifica. Lo stato progetto è una fotografia storica, non certifica questa revisione.

1. Leggere questa specifica, `DECISIONI_FINALI_CORPO_MODA_FOTO.md` e i documenti di contenuto sotto.
2. Confrontarli con il codice già avviato, identificando le differenze reali senza riaprire le scelte approvate/delegate.
3. Completare l’implementazione, riusando quanto già corretto nel workspace. Non fermarsi a un piano o a un template scollegato. Chiedere chiarimenti soltanto in presenza di una discrepanza nuova e concreta non risolta dai documenti.

Documenti di dettaglio:
- `docs/CULTURA_GENERALE_PROPOSTA.md`: otto domande finali e percorsi aggiornati.
- `docs/PROFUMI_CINQUE_ROUND.md`: selezione attiva di TRE profumi, domande e fonti; nome file mantenuto per compatibilità dei link.
- `docs/BRAND_EMOJI_CONCORDATI.md`: quattro brand e sequenze esatte.
- `docs/BRAND_INDIZI_CONTENUTI.md`: quattro brand, testi esatti degli indizi e dei disegni.
- `docs/MEDIA_DA_RECUPERARE_CORPO_MODA_FOTO.md`: inventario dei nove media finali già recuperati; il nome storico del file non indica che manchino ancora nove immagini.

## Perimetro e verifiche

Implementare i giochi della sola stanza cura-corpo. Riferimento strutturale: serie/film; per la rivelazione Hitster usare musica, per le associazioni usare il matching GoT. Non modificare globalmente le altre stanze. Mappa illustrata, musica ambientale, personaggi e nuovi premi narrativi saranno affrontati dopo; conservare le integrazioni esistenti.

**NON aprire browser. NON eseguire test visivi, screenshot, automazione UI, collaudi manuali o end-to-end.** I file `.visual-check.*` e gli script presenti non autorizzano a usarli. Nella fase di chiarimento non eseguire build/lint; dopo l’implementazione sono ammessi soltanto i controlli del repository `npm run lint` e `npm run build`, distinguendo problemi preesistenti da regressioni. Non esiste `npm test`. Una build riuscita non certifica il flusso giocabile. Nessuna email reale, reset giocatori, pubblicazione o operazione remota.

## Regola comune dei round

Per palette, dettagli, outfit, prodotti, dupe, profumi, emoji, indizi e cultura generale: una domanda/immagine/coppia alla volta, risposta confermata irreversibilmente, **feedback giusto/sbagliato e soluzione subito dopo la conferma**, poi passaggio al round successivo. Niente ritorno, anteprime delle risposte precedenti modificabili o riepilogo prima di un secondo invio finale.

Per emoji/indizi la risposta è al brand; la rivelazione di un indizio non è una risposta da valutare. Feedback soltanto quando si conferma la risposta al brand.

Eccezioni strutturali:
- Hitster: riordino e bonus modificabili fino all’unico invio finale.
- Effetti: originale e cinque varianti tutti insieme, unico invio finale.
- Supporti: unico tabellone di associazione, unico invio finale.

Feedback per round non significa nuova vita/tentativo o ricompensa a ogni round. La prova mantiene soglia e risultato complessivi. Evitare doppio conteggio/pagamento al refresh o alla ripresa; persistere stato serializzabile, risposte bloccate, avanzamento e indizi rivelati usando l’architettura esistente.

## Cinque macrogruppi, dodici giochi

| Macrogruppo | Giochi | Round/elementi |
| --- | --- | --- |
| Specchio dei dettagli | Palette; attenzione al dettaglio | 3 + 4 |
| Passerella delle icone | Hitster stili; outfit iconici | 7 look in 6 caselle + 7 outfit |
| Camera oscura | Effetti; supporti fotografici | 5 varianti + 5 associazioni |
| Beauty e profumi | Prodotti; dupe/originale; profumi | 4 + 5 coppie + 3 |
| Vetrina degli enigmi | Brand emoji; brand a indizi; cultura generale | 4 + 4 + 8 |

Sono 59 elementi/round distribuiti in 12 prove, non 59 tentativi distinti. Vecchi giochi autonomi styling, moodboard, nomi makeup/capi e brand da prodotto non vanno duplicati: eliminati o assorbiti nei giochi sopra. Non riutilizzare vecchie domande filler. La vecchia vittoria 11/18 è sostituita da 8/12; un solo regalo Kodak Charmera, nessun sottoregalo.

## 1. Specchio dei dettagli

Radice media `public/corpo-moda-fotografia/osservazione/`.

**Palette:** originali `palette-01.jpg`, `palette-02.jpg`, `palette-03.jpg`, mostrati per 3 secondi con banner del tempo residuo. Non anticipare domanda, oggetto o opzioni. Poi nascondere la foto e chiedere, rispettivamente, colore delle cuffie (verde), degli occhiali (arancione), della borsa (borgogna). Risposta tramite campioni visivi; non ricostruire una combinazione di tre capi. Campioni e distrattori definiti in `DECISIONI_FINALI_CORPO_MODA_FOTO.md`; soglia 2/3.

**Dettagli:** quattro originali `dettaglio-01.png`–`dettaglio-04.png`, osservati per 7 secondi con banner del tempo residuo senza indizi preventivi. A scadenza mostrare soltanto la corrispondente foto oscurata `dettaglio-NN-d.png` e la domanda con opzioni. Prima della conferma nessuna seconda visualizzazione originale o zoom che superi il timer. Dopo la conferma irreversibile mostrare l’originale come rivelazione. Versioni oscurate già fornite: non rigenerarle.

| Round | Domanda | Stato risposta |
| --- | --- | --- |
| 01 | Colore dei bracciali | Oro e marrone; alternative nel documento delle decisioni finali |
| 02 | Marca della fotocamera | Canon; alternative Nikon, Olympus, Fujifilm |
| 03 | Direzione del cavallo nella scena sul dorso | Est confermato; Nord/Sud/Est/Ovest con riferimento ai bordi della foto |
| 04 | Strumento suonato dall’uomo nella scena sul dorso | Oboe come risposta attesa dopo la correzione dell’utente del 17 novembre; alternative cornamusa, flauto traverso, violino |

Timer solo dopo caricamento del media; gestire refresh/ripresa senza permettere nuova osservazione illimitata. Scadenza assoluta persistita e sola durata residua alla ripresa, secondo le decisioni finali.

## 2. Passerella delle icone

**Hitster:** `hitster-stili/01-flapper.jpg`, `02-greaser.jpg`, `03-hippie.jpg`, `04-disco.jpg`, `05-punk.jpg`, `06-hip-hop.jpg`, `07-grunge.jpg`.

- Rivelare un solo look alla volta, come Hitster musica. All’inizio solo inserimento/riordino dei look già rivelati.
- Sei caselle per sette look: la quarta predisposta in posizione corretta e divisa in due per i contemporanei disco/punk. Ordine interno indifferente. Nessun nome/decade nelle caselle; non mostrare tutti i look subito. Serve una vera casella condivisa, non soltanto tollerare due permutazioni nel valutatore.
- Dopo che tutti i look sono rivelati e collocati, mostrare i campi bonus nome stile/periodo e decade. Timeline e bonus modificabili fino all’unico invio finale; validazione e soluzioni soltanto allora.
- Periodi simbolo: flapper anni 20; greaser anni 50; hippie anni 60; disco e punk anni 70; hip-hop anni 80; grunge anni 90. Chiedere decadi, non anni esatti. Power dressing escluso.
- Soglia 5/7 collocazioni; nomi e decadi bonus +1 credito ciascuno (aggiornamento approvato il 17 novembre), non necessari per superare e accreditati anche con timeline insufficiente. Alias e regole esatte nel documento decisioni finali. Non cambiare la modalità del gioco musica.

**Outfit:** risposta aperta al personaggio, una foto/round e feedback a ogni conferma secondo la regola comune. Soglia **6/7**. `outfit-iconici/`: `01-marilyn.png`, `02-michael-jackson.png`, `03-diana.png`, `04-audrey.png`, `05-undici.png`, `06-frida.png`, `07-freddie-mercury.png`. Foto senza volto; mantenere Marilyn/Michael come forniti senza altri ritagli. Nomi ammessi definiti nel documento decisioni finali (es. Undici/Eleven), niente associazione a nomi proposti.

## 3. Camera oscura

**Effetti:** originale `originali/fotografia-effetti/00-scena-urbana.png` visibile per confronto; cinque varianti in `fotografia-effetti/`: `01-bianco-e-nero.png`, `02-seppia.png`, `03-vignettatura.png`, `04-sfocatura.png`, `05-pixelatura.png`. Tutte insieme, risposta aperta sotto ciascuna, nessun elenco di nomi da associare. Unico invio con feedback finale. L’originale è un’eccezione esplicitamente autorizzata all’esclusione di `originali/` dal gioco. Sinonimi definiti nel documento decisioni finali; soglia 4/5.

**Supporti:** matching come motti GoT, cinque scatti e cinque nomi, ciascuna opzione utilizzabile una volta, modificabili fino all’unico invio. **Nessun indizio**. `fotografia-supporti/`: `01-scogliera-rullino-35mm.jpg` = rullino 35mm, Canon AF35ML/Kodak Portra400 dichiarati dall’utente. `02-neve-fuoristrada.jpg`, `03-concerto-flash.jpg`, `04-ritratto-istantanea.jpg`, `05-scena-subacquea.jpg` coprono smartphone, usa e getta, istantanea, action cam: corrispondenza confermata dall’utente: 02 smartphone, 03 usa e getta, 04 Polaroid, 05 action cam/GoPro. Non dedurre provenienza certa dall’aspetto. Compatta digitale esclusa; non cercare un sesto dispositivo. Soglia 4/5.

## 4. Beauty e profumi

**Prodotti:** quattro foto in `beauty-prodotti/`, risposta aperta, un round alla volta con feedback immediato. Soglia **3/4**. `01-primer-elf.png`, `02-setting-spray-urban-decay.png`, `03-illuminante-rare-beauty.png`, `04-prodotto-labbra-ysl.png`. Conservare brand/loghi: eliminare soltanto eventuali scritte che dichiarino la funzione. YSL confermato: Rouge Pur Couture Vernis À Lèvres Vinyl Cream, accettare tinta labbra/rossetto liquido. Sinonimi italiani/inglesi definiti nel documento decisioni finali.

**Dupe/originale:** cinque coppie pulite in `dupe-originale/`; **una coppia A/B per round**, conferma irreversibile e feedback immediato. Soglia **3/5**. Coppie: `01-illuminante-elf.jpg`/`01-illuminante-hollywood.jpg`; `02-profumo-jadore.jpg`/`02-profumo-lidl.jpg`; `03-borsa-jwpei.jpg`/`03-borsa-prada.jpg`; `04-scarpe-prada.jpg`/`04-scarpe-zara.jpg`; `05-bracciale-swarovski.jpg`/`05-bracciale-vancleef.jpg`. Posizione corretta dell’originale B/B/A/B/A nei nuovi tentativi, conservare la disposizione dopo refresh e allineare foto/didascalie/soluzioni. Togliere l’hint vecchio che svela tutte le risposte A. Usare i media già puliti, non una verifica di autenticità commerciale.

**Profumi:** **tre round, soglia 2/3**, quattro opzioni, uno alla volta, feedback immediato irreversibile. Nome e flacone possono essere visibili. `profumi/01.jpg` Bellagio Soleil d’Or (profilo/famiglia), `02.jpg` Power of You (insieme di note), `03.jpg` Libre EDP originale (insieme di note). Montblanc escluso; Party Hard riserva, non aggiungere un quarto round. Testi/opzioni e fonti in `PROFUMI_CINQUE_ROUND.md`; formulazioni e alternative accettate dall’utente. Non chiedere testa/cuore/fondo o ingredienti INCI.

## 5. Vetrina degli enigmi

**Emoji:** quattro round distinti: Prada 😈→👠→👜; Versace 🏛️→🐍→👩; Pandora 📦→🏺→📿; Ralph Lauren 👕→🐎→🏑. Tre emoji cumulative progressive su richiesta, risposta aperta anche prima dell’ultima, feedback alla conferma del brand. Lacoste escluso; hockey suggerisce una mazza, non identifica correttamente il polo. Soglia 3/4 brand; punti descrittivi 3/2/1 in base alla rivelazione. Alias definiti nel documento decisioni finali. Testo esatto in `BRAND_EMOJI_CONCORDATI.md`.

**Indizi:** quattro round: Chanel e Levi’s, tre indizi storici ciascuno; Gucci e Under Armour, quattro tratti ciascuno, disegno su carta senza canvas. Testi esatti in `BRAND_INDIZI_CONTENUTI.md`: **non riscrivere o comprimere**, i risultati grafici sono già stati testati dall’utente. Indizi progressivi cumulativi su richiesta; risposta aperta anche prima dell’ultimo, feedback alla conferma del brand. Non anticipare logo/nome prima della conferma. Soglia 3/4 brand; punti descrittivi 3/2/1 per gli storici e 3/2/1/1 per i disegni, stesso massimo. Alias definiti nel documento decisioni finali.

**Cultura generale:** otto round secondo `CULTURA_GENERALE_PROPOSTA.md`: blu più scuro (Prussia/navy/cobalto/ceruleo, Prussia come risposta voluta dall’utente); ottanio da quattro campioni; Samba; 1460; trench; chemisier; pied-de-poule; prospettiva forzata. Round 3–7 aperti; round 1,2,8 a quattro opzioni. Feedback immediato, nessun riepilogo modificabile. Soglia 6/8. Campioni ottanio definiti nel documento decisioni finali. Media: `cultura-generale/03.png`, `04.jpg`–`08.jpg`. La Samba è stata sostituita dall’utente con PNG senza la scritta SAMBA dopo la rinomina: non ripristinare il precedente JPG né usare il manifest storico come elenco corrente.

## Integrazione tecnica

Allineare dati JSON, contratti JSDoc `src/types/challenge.d.ts`, normalizzazione, draft/runtime/serializzazione, registro/valutatori, template e PlayPage dove necessario; seguire `GUIDA_SVILUPPO.md`. React funzionale, hook, JS ESM e Tailwind; React Router 7. Non ricreare `src/data/categories.json`. Progresso globale via provider/Supabase: localStorage non sostituisce il database. Nessuna migrazione distruttiva di sessioni/archivi. La modifica ai 12 gruppi richiede allineamento di challengeIds/quizTypes, weightedScoring, subPrizes e conteggi; mantenere gli ID delle prove mantenute, trattare quelli assorbiti con compatibilità esplicita.

Usare esclusivamente i media attivi e i percorsi reali; niente riserve/originali con volto durante la domanda. Aggiornamento del 17 novembre: gli originali con volto degli outfit e quelli non ripuliti dei dupe sono ammessi esclusivamente nella rivelazione dopo la conferma irreversibile, insieme agli originali non oscurati dei dettagli. Non mostrare filename, titoli, alt o didascalie che anticipino la risposta. Gestire accessibilità senza esporre le soluzioni. L’inventario file conferma presenza, non correttezza del gameplay.

## Stato finale e consegna

Non restano punti editoriali obbligatori aperti. Per soglie, alias, opzioni, tempi e unico regalo fare riferimento a `DECISIONI_FINALI_CORPO_MODA_FOTO.md`; non recuperare le proposte superate dai documenti storici. L’implementazione deve adeguare anche salvataggi, valutatori e configurazione del premio, senza modificare altre stanze o servizi remoti. Nessun browser/test visivo; soltanto lint/build al termine del codice. Questo documento descrive la specifica, non certifica un flusso già implementato.
