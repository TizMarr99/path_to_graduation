# Decisioni finali: stanza corpo, moda e fotografia

16 novembre 2026. L’utente ha chiuso tempi, identità YSL, direzione cavallo e mappatura supporti; ha delegato sinonimi, campioni visivi e bilanciamento, chiedendo riferimento alla stanza serie/film. Ha accettato le formulazioni proposte dei profumi. Questo documento completa e prevale sulle indicazioni ancora aperte nei documenti precedenti. **Non occorre un nuovo giro di approvazione prima di implementare.**

## Tempi e osservazione

- Palette: **3 secondi** per immagine; dettagli: **7 secondi**.
- Riutilizzare il banner/conteggio del tempo residuo già presente nel progetto; cercare il componente/stile usato nelle altre prove, senza creare un flusso nuovo. Il tempo parte quando l’immagine è caricata e viene resa osservabile, non alla richiesta di rete.
- Nessun suggerimento preventivo su cosa osservare, né domanda o alternative visibili durante l’osservazione. Banner neutro: «Tempo per osservare: … s».
- A scadenza originale nascosto; nei dettagli mostrare soltanto la versione `-d`. Nessuna riapertura, zoom residuo o seconda visione prima della conferma. Dopo la conferma irreversibile viene rivelato l’originale nei dettagli. Dopo la conferma: feedback/soluzione del round e avanzamento irreversibile.
- Ripresa: memorizzare scadenza assoluta e fase nel runtime/draft esistente. Se già scaduta, mostrare direttamente la domanda; se ancora valida, solo il tempo residuo, senza azzerare il timer. Se immagine non caricata/non resa visibile, non consumare l’osservazione. Ripresa e salvataggi seguono il provider esistente, senza nuove chiamate remote di verifica.

## Palette: campioni visivi definiti

Una sola risposta corretta per riga. Le etichette sotto sono editoriali: nel gioco mostrare quattro campioni, identificati A/B/C/D o equivalenti, **senza nome o HEX visibile**; conservare la relazione campione/soluzione anche se l’ordine viene mescolato. I valori rappresentano colori del quiz, non una misura colorimetrica delle foto.

| File | Domanda dopo osservazione | Campione corretto | Altri tre campioni |
| --- | --- | --- | --- |
| `palette-01.jpg` | Di che colore erano le cuffie? | Verde `#6E8458` | Senape `#B79B4B`, azzurro grigio `#6E8795`, marrone `#8C6B51` |
| `palette-02.jpg` | Di che colore era la montatura degli occhiali? | Arancione `#C67537` | Rosso mattone `#98483D`, giallo ocra `#B89A3F`, marrone `#79563E` |
| `palette-03.jpg` | Di che colore era la borsa? | Borgogna `#762E44` | Marrone `#76503E`, viola `#70516F`, rosso mattone `#A34B3E` |

I file sono sotto `public/corpo-moda-fotografia/osservazione/`. La prima domanda non è la vecchia ricostruzione di una palette a tre capi.

## Attenzione al dettaglio: quattro domande chiuse

| Round | Domanda | Quattro opzioni (corretta in grassetto) |
| --- | --- | --- |
| 01 | Quali colori avevano i bracciali? | **Oro e marrone**; argento e nero; oro e nero; argento e marrone |
| 02 | Di quale marca era la fotocamera? | **Canon**; Nikon; Olympus; Fujifilm |
| 03 | Verso quale direzione era rivolto il cavallo? | Nord; Sud; **Est**; Ovest |
| 04 | Quale strumento suonava l’uomo nella scena sul dorso? | Una cornamusa; un flauto traverso; **un oboe**; un violino |

Per il cavallo, soltanto nella fase domanda indicare il riferimento: «Nord = alto della foto; Est = destra». Nessun indizio durante l’osservazione. Est è confermato dall’utente.

Correzione dell’utente del 17 novembre: esclusa la cornamusa come soluzione; indicato oboe simile a quello barocco o flauto dolce come lettura della scena. Per il quiz viene scelto **oboe** come risposta attesa, senza presentare l’identificazione come certa. Cornamusa resta un distrattore insieme a flauto traverso e violino. Gli ID delle opzioni restano invariati; `correctChoiceId` passa a `2` (oboe). Nessun azzeramento o ricalcolo dei risultati delle prove già completate.

## Supporti fotografici: mappatura confermata

| File in `fotografia-supporti/` | Nome da associare |
| --- | --- |
| `01-scogliera-rullino-35mm.jpg` | Fotocamera a pellicola 35 mm |
| `02-neve-fuoristrada.jpg` | Smartphone |
| `03-concerto-flash.jpg` | Fotocamera usa e getta |
| `04-ritratto-istantanea.jpg` | Fotocamera istantanea / Polaroid |
| `05-scena-subacquea.jpg` | Action cam / GoPro |

Il primo scatto è Canon AF35ML con Kodak Portra 400, dichiarato dall’utente; colori naturali, grana fine e contrasto morbido sono metadati di preparazione, **non indizi da mostrare nel gioco**. Per tutti: foto + nomi da associare, nessun altro suggerimento. Un unico invio del matching.

## Prodotti beauty: identità e risposte ammesse

Brand e loghi restano visibili. È richiesto il tipo di prodotto, non obbligatoriamente marca/modello commerciale. Il solo brand non è sufficiente.

| File in `beauty-prodotti/` | Soluzione mostrata | Risposte accettate |
| --- | --- | --- |
| `01-primer-elf.png` | Primer | primer; primer viso; base trucco; base per il trucco; makeup primer; face primer |
| `02-setting-spray-urban-decay.png` | Spray fissante | spray fissante; spray fissante trucco; fissante; fissante trucco; fissatore trucco; spray fissatore; setting spray; fixing spray; makeup setting spray; all nighter |
| `03-illuminante-rare-beauty.png` | Illuminante liquido | illuminante; illuminante liquido; highlighter; liquid highlighter; luminizer; liquid luminizer; positive light |
| `04-prodotto-labbra-ysl.png` | Tinta labbra / rossetto liquido | tinta labbra; tinta per labbra; tinta; rossetto liquido; rossetto; liquid lipstick; lip stain; vernis a levres; vinyl cream; vernis a levres vinyl cream; rouge pur couture vernis a levres vinyl cream |

Identità YSL confermata dall’utente: **Rouge Pur Couture Vernis À Lèvres Vinyl Cream**. «Gloss» o «lucidalabbra» da soli non sono sinonimi della categoria scelta. Accettare anche la combinazione nome prodotto + marca riconosciuta (e.l.f./elf, Urban Decay, Rare Beauty, YSL/Yves Saint Laurent), senza permettere che la sola marca passi.

## Risposte aperte: regola comune

Riutilizzare `matchesAcceptedAnswer`/normalizzazione esistente: case insensitive, accenti, spazi, apostrofi e punteggiatura equivalenti. Niente confronto per sottostringa, AI remota o distanza approssimativa globale. Le liste seguenti sono alias definitivi per questa stanza, delegati dall’utente. La normalizzazione deve valere anche in valutazione, ripresa e soluzione, senza alterare le altre stanze.

### Outfit, in ordine di file

1. Marilyn Monroe: Marilyn Monroe; Marilyn; Marylin; Marylin Monroe.
2. Michael Jackson: Michael Jackson; Michael; Jackson; MJ.
3. Lady Diana: Diana; Lady Diana; Lady D; Diana Spencer; principessa Diana; Princess Diana.
4. Audrey Hepburn: Audrey Hepburn; Audrey; Hepburn.
5. Undici: Undici; Eleven; El; Jane; Jane Hopper; Jane Ives.
6. Frida Kahlo: Frida Kahlo; Frida; Frida Kalo.
7. Freddie Mercury: Freddie Mercury; Freddy Mercury; Freddie; Freddy; Mercury.

Si chiede il personaggio, non titolo della serie/film o nome dell’abito. Non accettare «Stranger Things», «Thriller», «Queen» o «Colazione da Tiffany» da soli.

### Effetti

- Bianco e nero: bianco e nero; bianco nero; bianconero; b/n; bn; black and white; black white; b&w; bw; scala di grigi; grayscale.
- Seppia: seppia; sepia; effetto seppia; filtro seppia.
- Vignettatura: vignettatura; vignetta; vignette; vignetting; effetto vignetta; bordi scuri; angoli scuri.
- Sfocatura: sfocatura; sfocato; sfocata; sfuocatura; sfuocato; sfuocata; blur; effetto sfocato; effetto blur.
- Pixelatura: pixelatura; pixellatura; pixelato; pixellato; pixelata; pixellata; pixel; pixelation; pixelated; effetto pixel; mosaico; effetto mosaico.

### Brand

- Prada: Prada.
- Versace: Versace; Gianni Versace.
- Pandora: Pandora.
- Ralph Lauren: Ralph Lauren; Polo Ralph Lauren; Ralph. «Polo» da solo escluso.
- Chanel: Chanel; Coco Chanel.
- Levi’s: Levi’s; Levi's; Levis; Levi Strauss; Levi Strauss & Co; Levi Strauss and Co.
- Gucci: Gucci.
- Under Armour: Under Armour; Under Armor; UA.

### Cultura generale, risposte aperte

- Samba: Samba; adidas Samba; Samba OG; adidas Samba OG.
- 1460: 1460; Dr Martens 1460; Doctor Martens 1460; Doc Martens 1460; anfibi 1460; anfibio 1460; stivali 1460; boots 1460. Il solo brand non basta.
- Trench: trench; trench coat; trenchcoat; impermeabile; cappotto trench; soprabito trench.
- Chemisier: chemisier; abito chemisier; vestito chemisier; abito camicia; vestito camicia; abito a camicia; vestito a camicia; shirt dress; shirtdress.
- Pied-de-poule: pied de poule; pieddepoule; pied de poul; houndstooth; dogtooth.

### Bonus Hitster

Nomi ammessi, in ordine cronologico:
- Flapper: flapper; stile flapper; anni ruggenti; roaring twenties; charleston; stile charleston.
- Greaser: greaser; stile greaser; rockabilly; rock and roll; rock n roll; stile rockabilly.
- Hippie: hippie; hippy; figli dei fiori; figlia dei fiori; flower power; stile hippie.
- Disco: disco; disco music; disco style; stile disco; disco fever.
- Punk: punk; punk rock; stile punk.
- Hip-hop: hip hop; hiphop; old school hip hop; hip hop old school; b boy; bboy; streetwear hip hop. «Streetwear» da solo è troppo generico.
- Grunge: grunge; stile grunge; seattle sound.

Decadi: accettare forma numerica estesa (1920/1950/1960/1970/1980/1990), abbreviata (20/50/60/70/80/90), «anni …», «…s» e nome italiano (venti/cinquanta/sessanta/settanta/ottanta/novanta), anche con «anni». Non richiedere anni puntuali di origine.

## Ottanio: quattro campioni vicini

Domanda confermata: «Quale campione rappresenta l’ottanio?» Mostrare quattro campioni pieni con identico formato, senza nome/HEX visibile, stesso sfondo neutro e bordo; non differenziarli per luminosità artificiale, icone o dimensione.

| Identità interna | HEX | Ruolo |
| --- | --- | --- |
| Ottanio | `#006D77` | Corretta |
| Blu petrolio | `#145B83` | Distrattore più blu |
| Verde acqua scuro | `#238A82` | Distrattore più verde |
| Blu ardesia | `#475E73` | Distrattore più grigio |

Sono campioni editoriali definiti per il gioco, non uno standard universale dei nomi colore. Ordine casuale stabile nel tentativo; evitare testo accessibile che contenga la soluzione prima della risposta. Gli altri nomi non compaiono durante la scelta. La domanda testuale sui blu resta Prussia/navy/cobalto/ceruleo con risposta Prussia voluta dall’utente; non modificarla.

## Soglie e punteggi definitivi

Riferimento letto nel JSON serie-film: peso 1 per ogni gioco/gruppo, soglia stanza 0.6, valutazione per gruppi superati. Qui manteniamo **12 giochi di pari peso**, non pesi diversi per i 59 elementi e non un voto per ciascuno dei cinque macrogruppi. **Vittoria a 8 giochi superati su 12** (soglia 60%, con conteggio intero minimo 8). Nessun requisito aggiuntivo di superare tutte le zone.

| Gioco | Soglia interna |
| --- | --- |
| Palette | 2/3 |
| Attenzione al dettaglio | 3/4 |
| Hitster | 5/7 look nella casella cronologica corretta |
| Outfit iconici | 6/7 |
| Effetti fotografici | 4/5 |
| Supporti fotografici | 4/5 |
| Prodotti beauty | 3/4 |
| Dupe/originale | 3/5 |
| Profumi | 2/3 |
| Brand emoji | 3/4 brand indovinati |
| Brand a indizi | 3/4 brand indovinati |
| Cultura generale | 6/8 |

Hitster: disco e punk sono ciascuno un look corretto soltanto se nella casella condivisa quarta; ordine interno irrilevante. Ogni altro look vale 1 se nella casella prevista. La soglia riguarda l’ordinamento, non nomi/anni. Dopo l’invio mostrare tre risultati distinti: ordinamento su 7, nomi su 7, decadi su 7. Aggiornamento approvato il 17 novembre: bonus **+1 credito per nome e +1 credito per decade corretti**, massimo 14 crediti extra oltre ai 12 massimi della timeline. Sono accreditati all’invio finale anche se la timeline non supera 5/7, senza modificare esito, peso o vite. Il massimo Hitster è 26 crediti; i bonus non confluiscono nel rapporto di scoring.

Emoji e indizi: la correttezza del brand conta 1 per il superamento, indipendentemente da quanti indizi ha richiesto. Per premiare l’anticipo senza obbligarla a indovinare prima, punteggio descrittivo per brand corretto: **3 punti al primo indizio, 2 al secondo, 1 dal terzo in poi**; 0 se errato. Quindi disegni a quattro passi valgono 3/2/1/1, gli altri 3/2/1; massimo 12 per ciascun gioco, soglia sempre 3 brand su 4, non un vecchio 8/12. Nessuna penalità per rivelazione che consumi crediti/vite oltre alle regole di stanza già esistenti. Non convertire i bonus descrittivi in nuovi premi economici.

Implementazione scoring: i 12 gruppi devono consumare il risultato complessivo della prova, non una media dei feedback interni già renderizzati. Usare rapporti esatti e confronto intero per le soglie, senza errori di arrotondamento (2/3 non deve diventare 0.7). Se il motore riceve già un unico esito booleano per prova, il gruppo passa su quell’esito senza applicare una seconda soglia incompatibile. Tutte le prove restano raggiungibili durante la stanza; il raggiungimento del requisito premio segue il ciclo di vittoria esistente senza moltiplicare gli accrediti.

## Unico regalo

**Kodak Charmera**, un solo regalo finale alla vittoria della stanza. Nessun sottoregalo o traguardo premio nei cinque macrogruppi; eliminare dalla configurazione attiva i tre vecchi sottopremi di cura-corpo, conservando la compatibilità degli archivi e senza cancellare progressi. I 12 giochi continuano a essere gruppi di scoring, i cinque macrogruppi solo zone organizzative.

Conservare l’economia standard delle prove già esistente; non aggiungere regali per bonus. Non confondere il regalo fisico con un eventuale artefatto narrativo di progressione; conservare quello richiesto dall’architettura. Aggiornare etichetta/modale finale a Kodak Charmera senza introdurre nuove email o inviarne di reali.

## Profumi e stato di chiusura

Le tre domande e tutte le loro alternative in `PROFUMI_CINQUE_ROUND.md` sono ora accettate dall’utente: Bellagio fruttato/floreale, Power of You frutto della passione/frangipani/vaniglia, Libre lavanda/fiori d’arancio/vaniglia. Non riproporre un giro di approvazione.

Non restano decisioni editoriali obbligatorie prima dell’implementazione. Media presenti, Samba già corretta in PNG. Eventuali discrepanze tecniche reali vanno segnalate con evidenza, non trasformate in nuove domande sulle scelte già delegate. **In questa chat aggiornati soltanto documenti; implementazione, lint/build ed eventuali prove di gioco non eseguiti.**

## Crediti aggiornati — 17 novembre 2026

Proposta approvata: Hitster 12, outfit 10, effetti 9, supporti 9, emoji 8, indizi 10, cultura 12. Invariati palette 6, dettagli 6, prodotti 5, dupe 6 e profumi 5. Massimo base stanza 98; con tutti i bonus Hitster 112, contro 170 di serie-film. Accesso 90 e costi indizi invariati. I risultati già registrati non vengono riaccreditati retroattivamente.

## Rivelazioni fotografiche — 17 novembre 2026

Approvate e implementate dopo la conferma irreversibile del singolo round: foto non oscurata nei quattro dettagli; originale con volto e nome nei sette outfit; originali non ripuliti dei prodotti con marchio e indicazione Originale/Dupe nelle cinque coppie. Le immagini possono essere ingrandite soltanto in questa fase di rivelazione. Nessuna anticipazione durante la domanda o l’osservazione. L’ordine A/B resta quello del tentativo salvato: nei nuovi tentativi l’originale segue B/B/A/B/A (illuminante, profumo, borsa, scarpe, bracciale), come richiesto dall’utente. I vecchi draft senza inversioni conservano il precedente ordine per compatibilità.
