# Media dei giochi: corpo, moda e fotografia

> Inventario storico del 24 ottobre: per i file attuali, il riordino del 14 novembre e le correzioni da fare alle immagini usare [Inventario corrente](MEDIA_CORPO_MODA_FOTOGRAFIA_CORRENTE.md). I giochi qui descritti rappresentano ancora il vecchio JSON, non le successive decisioni editoriali.

Audit del 24 ottobre 2026 su chat di riferimento e file effettivi del workspace. Esclusi musica, mappa, personaggi e altri media di stanza. Nessuna modifica al codice di gioco.

## Risultato

- 18 giochi; 68 immagini referenziate; 10 presenti e 58 mancanti ai percorsi attuali.
- 5 immagini aggiuntive esistono in memory-palette, ma non sono referenziate e non corrispondono alle palette configurate.
- 5 giochi non richiedono file multimediali: errore cromatico, famiglie olfattive, emoji, indizi progressivi, cultura generale.
- Riutilizzando 3 foto esistenti per le palette rimangono 55 slot immagine da coprire; eventuali riusi per i dettagli riducono ancora le nuove sorgenti necessarie.

## Inventario per gioco

I percorsi sotto sono relativi alla cartella del progetto. Sono quelli attualmente letti dal JSON; cambiare estensione richiede di aggiornare src, non basta rinominare un WebP in JPG.

### 1. Memory Palette — `memory_palette`

Soglia: 2/3. Immagini richieste: 3; presenti: 0; mancanti: 3.

Versione attuale: look 1 salvia + denim chiaro + crema; look 2 borgogna + nero + champagne; look 3 petrolio + tortora + rame. Le immagini disponibili non corrispondono: adattare i colori alle foto scelte oppure procurare questi look. Specificare esattamente quali capi/accessori ricordare, escludendo sfondo e incarnato.

- [ ] `public/corpo-moda-fotografia/memory-palette/palette_01.jpg`
- [ ] `public/corpo-moda-fotografia/memory-palette/palette_02.jpg`
- [ ] `public/corpo-moda-fotografia/memory-palette/palette_03.jpg`

### 2. Attenzione al Dettaglio — `timed_detail`

Soglia: 2/3. Immagini richieste: 3; presenti: 0; mancanti: 3.

Versione attuale: foulard a pois; orecchini a stella; borsa con tracolla a catena. Il dettaglio deve essere leggibile anche su telefono e inserito in una scena abbastanza ricca da richiedere memoria. Alternativa: riusare le foto esistenti, cambiando domande e risposte (vedi sotto).

- [ ] `public/corpo-moda-fotografia/dettaglio/dettaglio_01.jpg`
- [ ] `public/corpo-moda-fotografia/dettaglio/dettaglio_02.jpg`
- [ ] `public/corpo-moda-fotografia/dettaglio/dettaglio_03.jpg`

### 3. Trova l'Errore Cromatico — `color_intruder`

Soglia: 2/3. Immagini richieste: 0; presenti: 0; mancanti: 0.

Nessuna immagine: swatch HEX già nel JSON e renderizzati dal componente. Esempio: rettangolo beige #F5F5DC etichettato blu petrolio è la coppia errata.


### 4. Come si Chiama? — `garment_names`

Soglia: 3/5. Immagini richieste: 5; presenti: 0; mancanti: 5.

Cinque foto di prodotto, una per trench, blazer, slip dress, slingback e cargo pants. Sfondo semplice; visibili cintura/doppiopetto, taglio giacca, spalline sottili, cinturino al tallone e tasche laterali. Niente scritte con il nome della risposta.

- [ ] `public/corpo-moda-fotografia/guardaroba/capo_01_trench.jpg`
- [ ] `public/corpo-moda-fotografia/guardaroba/capo_02_blazer.jpg`
- [ ] `public/corpo-moda-fotografia/guardaroba/capo_03_slip_dress.jpg`
- [ ] `public/corpo-moda-fotografia/guardaroba/capo_04_slingback.jpg`
- [ ] `public/corpo-moda-fotografia/guardaroba/capo_05_cargo.jpg`

### 5. Stile da Immagine — `style_moodboard`

Soglia: 3/5. Immagini richieste: 5; presenti: 0; mancanti: 5.

Cinque look o collage: old money (maglia sulle spalle, camicia, pantaloni sartoriali, mocassini); Y2K (vita bassa, mini borsa, accessori lucidi); coquette (fiocchi, pizzo, rosa tenue); streetwear (felpa oversize, cargo, sneakers); dark academia (tweed, dolcevita, marrone, libri). Evitare sovrapposizioni fra collage.

- [ ] `public/corpo-moda-fotografia/stili/stile_01_old_money.jpg`
- [ ] `public/corpo-moda-fotografia/stili/stile_02_y2k.jpg`
- [ ] `public/corpo-moda-fotografia/stili/stile_03_coquette.jpg`
- [ ] `public/corpo-moda-fotografia/stili/stile_04_streetwear.jpg`
- [ ] `public/corpo-moda-fotografia/stili/stile_05_dark_academia.jpg`

### 6. Errore di Styling — `styling_error`

Soglia: 2/3. Immagini richieste: 3; presenti: 0; mancanti: 3.

Tre tavole: look elegante con sneakers tecniche; look spiaggia con blazer pesante; look palestra con clutch da sera. Meglio collage di quattro elementi per far corrispondere tutte le opzioni. I prompt devono dichiarare una regola precisa: le scelte attuali sono soggettive, non errori universali.

- [ ] `public/corpo-moda-fotografia/styling-error/errore_styling_01.jpg`
- [ ] `public/corpo-moda-fotografia/styling-error/errore_styling_02.jpg`
- [ ] `public/corpo-moda-fotografia/styling-error/errore_styling_03.jpg`

### 7. Hitster With Style — `hitster_style`

Soglia: 4/6. Immagini richieste: 6; presenti: 0; mancanti: 6.

Sei look rappresentativi: flapper, New Look, hippie, power dressing, grunge, Y2K. Si possono usare foto moderne che rappresentino le silhouette. Nessuna data scritta nelle immagini. Il percorso 1920 contiene attualmente il refuso frapper: conservarlo finché non si aggiorna il JSON.

- [ ] `public/corpo-moda-fotografia/hitster-style/decade_1920_frapper.jpg`
- [ ] `public/corpo-moda-fotografia/hitster-style/decade_1950_new_look.jpg`
- [ ] `public/corpo-moda-fotografia/hitster-style/decade_1970_hippie.jpg`
- [ ] `public/corpo-moda-fotografia/hitster-style/decade_1980_power_dressing.jpg`
- [ ] `public/corpo-moda-fotografia/hitster-style/decade_1990_grunge.jpg`
- [ ] `public/corpo-moda-fotografia/hitster-style/decade_2000_y2k.jpg`

### 8. Outfit Iconico Nascosto — `iconic_outfits`

Soglia: 3/5. Immagini richieste: 5; presenti: 0; mancanti: 5.

Cinque crop senza volto: completo giallo a quadri di Clueless; tubino nero e perle di Audrey; revenge dress nero di Diana; abito bianco di Marilyn; look denim di Britney. Conservare abbastanza abito da renderlo riconoscibile; il template mostra il file intero, quindi il crop va preparato prima.

- [ ] `public/corpo-moda-fotografia/outfit-iconici/outfit_01_clueless_yellow.jpg`
- [ ] `public/corpo-moda-fotografia/outfit-iconici/outfit_02_audrey_black_dress.jpg`
- [ ] `public/corpo-moda-fotografia/outfit-iconici/outfit_03_diana_revenge_dress.jpg`
- [ ] `public/corpo-moda-fotografia/outfit-iconici/outfit_04_marilyn_white_dress.jpg`
- [ ] `public/corpo-moda-fotografia/outfit-iconici/outfit_05_britney_denim.jpg`

### 9. Filtri & Effetti — `photo_filters`

Soglia: 4/6. Immagini richieste: 6; presenti: 0; mancanti: 6.

Una sola foto sorgente, esportata in sei varianti: bianco e nero, seppia, vignettatura, light leak, fisheye, soft focus. Scena con bordi geometrici e zone chiare per rendere gli effetti distinguibili. Stesso ritaglio e dimensioni; un solo effetto dominante per variante. La sorgente non serve come settima immagine nel gioco.

- [ ] `public/corpo-moda-fotografia/fotografia-filtri/filtro_01_bn.jpg`
- [ ] `public/corpo-moda-fotografia/fotografia-filtri/filtro_02_seppia.jpg`
- [ ] `public/corpo-moda-fotografia/fotografia-filtri/filtro_03_vignettatura.jpg`
- [ ] `public/corpo-moda-fotografia/fotografia-filtri/filtro_04_light_leak.jpg`
- [ ] `public/corpo-moda-fotografia/fotografia-filtri/filtro_05_fisheye.jpg`
- [ ] `public/corpo-moda-fotografia/fotografia-filtri/filtro_06_soft_focus.jpg`

### 10. Supporto Fotografico — `photo_supports`

Soglia: 4/6. Immagini richieste: 6; presenti: 0; mancanti: 6.

Sei scatti con estetiche: stampa istantanea con bordo; pellicola 35 mm; usa e getta con flash diretto; compatta digitale anni 2000; smartphone; action cam grandangolare. Limite: il solo aspetto non prova il dispositivo usato, soprattutto rullino/usa e getta e smartphone/digitale. Per risposte nette proporrei foto del dispositivo o una tavola scatto + indizio sul supporto, aggiornando il prompt.

- [ ] `public/corpo-moda-fotografia/fotografia-supporti/supporto_01_polaroid.jpg`
- [ ] `public/corpo-moda-fotografia/fotografia-supporti/supporto_02_rullino_35mm.jpg`
- [ ] `public/corpo-moda-fotografia/fotografia-supporti/supporto_03_usa_e_getta.jpg`
- [ ] `public/corpo-moda-fotografia/fotografia-supporti/supporto_04_digitale_2000.jpg`
- [ ] `public/corpo-moda-fotografia/fotografia-supporti/supporto_05_smartphone.jpg`
- [ ] `public/corpo-moda-fotografia/fotografia-supporti/supporto_06_action_cam.jpg`

### 11. Makeup: Look & Nome — `makeup_names`

Soglia: 4/6. Immagini richieste: 6; presenti: 0; mancanti: 6.

Sei close-up: smokey eye (sfumatura scura); cut crease (piega definita); eyeliner grafico; no makeup makeup; bold lip (labbra protagoniste); glass skin (incarnato luminoso). Le due ultime estetiche di pelle possono sovrapporsi: scegliere esempi molto distinti, con luce coerente e senza testo della risposta.

- [ ] `public/corpo-moda-fotografia/beauty-makeup/makeup_01_smokey_eye.jpg`
- [ ] `public/corpo-moda-fotografia/beauty-makeup/makeup_02_cut_crease.jpg`
- [ ] `public/corpo-moda-fotografia/beauty-makeup/makeup_03_eyeliner_grafico.jpg`
- [ ] `public/corpo-moda-fotografia/beauty-makeup/makeup_04_no_makeup_makeup.jpg`
- [ ] `public/corpo-moda-fotografia/beauty-makeup/makeup_05_bold_lip.jpg`
- [ ] `public/corpo-moda-fotografia/beauty-makeup/makeup_06_glass_skin.jpg`

### 12. Nome Prodotto da Immagine — `product_names`

Soglia: 3/5. Immagini richieste: 5; presenti: 0; mancanti: 5.

Cinque foto di primer, setting spray, contour, illuminante e lip tint. Mostrare confezione aperta, applicatore e/o texture: il solo flacone anonimo non distingue sempre la funzione. Evitare di rendere il testo leggibile sulla confezione l'unico indizio.

- [ ] `public/corpo-moda-fotografia/beauty-prodotti/prodotto_01_primer.jpg`
- [ ] `public/corpo-moda-fotografia/beauty-prodotti/prodotto_02_setting_spray.jpg`
- [ ] `public/corpo-moda-fotografia/beauty-prodotti/prodotto_03_contour.jpg`
- [ ] `public/corpo-moda-fotografia/beauty-prodotti/prodotto_04_illuminante.jpg`
- [ ] `public/corpo-moda-fotografia/beauty-prodotti/prodotto_05_lip_tint.jpg`

### 13. Profumo & Famiglia Olfattiva — `fragrance_families`

Soglia: 3/5. Immagini richieste: 0; presenti: 0; mancanti: 0.

Nessun file: le cinque combinazioni di note sono già nel JSON. Esempio vaniglia + caramello + cacao -> gourmand; limone + bergamotto + arancia -> agrumato.


### 14. Dupe o Originale — `dupe_original`

Soglia: 3/5. Immagini richieste: 10; presenti: 10; mancanti: 0.

Tutte le dieci immagini sono presenti e collegate: Hollywood/elf, J'adore/Lidl, Prada/JW Pei, Prada/Zara, Van Cleef/Swarovski. Prima della prova finale alternare A/B: attualmente tutte le risposte sono A e l'hint lo dichiara. Il controllo qui certifica i percorsi, non l'equivalenza commerciale delle coppie.

- [x] `public/corpo-moda-fotografia/hollywood_illuminante.avif`
- [x] `public/corpo-moda-fotografia/elf_illuminante.avif`
- [x] `public/corpo-moda-fotografia/jadore_profumo.avif`
- [x] `public/corpo-moda-fotografia/lidl_profumo.webp`
- [x] `public/corpo-moda-fotografia/prada_borsa.avif`
- [x] `public/corpo-moda-fotografia/jwPei_borsa.jpg`
- [x] `public/corpo-moda-fotografia/prada_scarpe.avif`
- [x] `public/corpo-moda-fotografia/zara_scarpe.jpg`
- [x] `public/corpo-moda-fotografia/vanCleef_bracciale.avif`
- [x] `public/corpo-moda-fotografia/swarovski_bracciale.jpg`

### 15. Brand da Emoji — `brand_emoji`

Soglia: 3/4. Immagini richieste: 0; presenti: 0; mancanti: 0.

Nessun file necessario: bastano emoji Unicode. Il JSON attuale usa descrizioni in parole. Proposta: coccodrillo + polo -> Lacoste; spunta + scarpa -> Nike; numero 5 + doppia C -> Chanel. Il quarto rebus attuale è Apple (mela + telefono): per restare nella stanza proporrei Puma (felino + scarpa), aggiornando risposte e spiegazione.


### 16. Brand a Indizi Progressivi — `brand_clues`

Soglia: 6/12. Immagini richieste: 0; presenti: 0; mancanti: 0.

Nessun media: tre brand (Chanel, Nike, Dior), quattro indizi testuali ciascuno, già nel JSON. Esempio Chanel: Francia -> profumo numerato -> tweed/bianco e nero -> due C intrecciate. Il foglio per disegnare resta un accessorio fisico opzionale; il componente usa testo.


### 17. Brand da Prodotto — `brand_products`

Soglia: 3/5. Immagini richieste: 5; presenti: 0; mancanti: 5.

Cinque foto: Nike Air Force 1, Louis Vuitton Neverfull, Maison Margiela Tabi, Dr. Martens 1460, Chanel Classic Flap. Un prodotto per immagine, angolo che ne mostri la forma distintiva; evitare didascalie con il brand. Se si vuole riconoscimento dalla forma, limitare i loghi troppo evidenti senza eliminare i dettagli distintivi.

- [ ] `public/corpo-moda-fotografia/brand-prodotti/brand_prodotto_01_air_force_1.jpg`
- [ ] `public/corpo-moda-fotografia/brand-prodotti/brand_prodotto_02_neverfull.jpg`
- [ ] `public/corpo-moda-fotografia/brand-prodotti/brand_prodotto_03_tabi.jpg`
- [ ] `public/corpo-moda-fotografia/brand-prodotti/brand_prodotto_04_1460_boots.jpg`
- [ ] `public/corpo-moda-fotografia/brand-prodotti/brand_prodotto_05_classic_flap.jpg`

### 18. Cultura Generale Mista — `general_culture`

Soglia: 5/8. Immagini richieste: 0; presenti: 0; mancanti: 0.

Nessun media: otto domande già presenti, fra cui regola dei terzi, primer, trench, gourmand, stampa istantanea, bold lip, Y2K, vignettatura.


## Recupero delle cinque immagini già raccolte

Valutazione visiva:

- `4464ce2e87d470f12b9561d38c893551.webp`: candidata palette, chiedendo solo giacca verde oliva, basco borgogna e maglia rosa. Contiene altri colori: indicare i tre capi esatti.
- `ca7c42d41b0a374a2a3cc65e3a4f8fe5.webp`: candidata palette focalizzata sulla giacca (corallo, azzurro/turchese, crema); molte sfumature, da verificare con gli swatch.
- `0ecd9608547d83ed7e4bc853e43eede5.webp`: candidata palette focalizzata su jeans chiari, scarpe rosse e borsa paglia; escludere la camicia multicolore dal compito.
- `a49e6105c5fd662dc7434f1fe4520003.webp`: meglio come dettaglio, ad esempio colore della borsa (crema) o delle scarpe (blu).
- `c47b59390607a19c6ce78b07553c39c0.webp`: meglio come dettaglio, ad esempio forma ondulata della montatura bianca o colore della borsa (borgogna). Gli orecchini hanno forma raggiata: eviterei una domanda stella/sole ambigua.

Queste sono alternative alle domande e palette attuali: richiedono aggiornamento coerente di src, colori, opzioni e risposte. Nessun collegamento è stato modificato durante questo audit.

## Rifiniture del codice prima di considerare i giochi pronti

1. Attenzione al dettaglio: MultiRoundQuizChallenge mostra tutti i round e lascia le immagini visibili. Manca la fase temporizzata con scomparsa e domanda successiva; il normalizzatore non conserva displaySeconds per questo tipo.
2. Memory Palette: si può rivelare più volte la foto, scegliere colori mentre è visibile e ricevere feedback anticipato diverso per la palette corretta. Il confronto delle scelte è esatto, senza tolleranza cromatica. Definire la regola desiderata e adeguare il componente.
3. Dupe: alternare la posizione dell'originale e riscrivere l'hint che oggi svela tutte le risposte.
4. Emoji: sostituire le descrizioni letterali con emoji nel prompt; il template visualizza già il testo e non necessita di immagini.
5. Hitster: le descrizioni visibili contengono già anni/decenni (anni ruggenti, anni 2000). Togliere i riferimenti temporali espliciti se si vuole una prova di riconoscimento visivo.
6. Outfit nascosti: il template non maschera automaticamente il volto, quindi servono crop pronti.
7. Styling, supporti e alcuni prodotti/makeup: risolvere le ambiguità indicate sopra prima di procurare i media definitivi.

## Sequenza proposta

1. Selezionare le tre palette e riusare due/tre foto per i dettagli, aggiornando i contenuti.
2. Chiudere dupe ed emoji, per cui non servono nuovi file.
3. Raccogliere guardaroba, stili, outfit iconici e prodotti/brand.
4. Preparare la foto sorgente con i sei effetti e i sei esempi makeup.
5. Definire regole nette per styling e supporti fotografici, poi procurare le immagini.
6. Correggere le modalità memoria e verificare ciascun gioco in interfaccia con media reali.

Verifica eseguita: inventario dei percorsi, lettura di dati/normalizzazione/template/registro e ispezione visiva delle cinque foto palette. Non eseguito collaudo interattivo dei 18 giochi.
