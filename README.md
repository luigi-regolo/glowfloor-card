<a href="https://www.tiktok.com/@luigi.regolo" title="Segui i tutorial Home Assistant su TikTok"><img src="assets/tiktok-segui.svg" alt="TikTok | Segui" width="116" height="22"></a>

# GlowFloor Card

**Una piantina interattiva per Home Assistant**, con pulsanti luminosi circolari, conteggio delle luci accese, spegnimento globale, illuminazione diffusa sulla piantina e fino a tre scene rapide personalizzabili.

![Anteprima di GlowFloor in modalità scura](assets/glowfloor-dark.png)

GlowFloor è una card personalizzata per le dashboard di Home Assistant. Può mostrare una piantina fornita dall'utente oppure l'illustrazione dimostrativa inclusa. Le luci vengono associate alle entità `light.*` e posizionate sulla piantina con l'editor visuale.

## Funzionalità

- **Pulsanti sempre riconoscibili:** ogni lampadina ha una base circolare visibile anche da spenta; quando la luce è accesa compare un alone luminoso.
- **Illuminazione diffusa:** quando una luce è accesa, una zona della piantina viene illuminata attorno al marker. Il colore segue `rgb_color` quando disponibile e l’intensità tiene conto della luminosità; l’effetto si può disattivare e la dimensione si regola per ciascuna luce. L’effetto non riconosce le pareti della piantina.
- **Conteggio in tempo reale:** indica quante entità luce distinte, configurate nella card, risultano accese.
- **Spegni tutte:** spegne soltanto le luci accese presenti nella configurazione della card.
- **Fino a tre scene facoltative:** l'utente sceglie le entità `scene.*` e il testo dei rispettivi pulsanti. Non esistono nomi obbligatori.
- **Intestazione facoltativa:** testo superiore, titolo e sottotitolo possono essere modificati singolarmente o lasciati vuoti. Se tutti sono vuoti, rimangono soltanto i comandi in alto.
- **Tema automatico, chiaro o scuro:** modalità `auto`, `light` e `dark`.
- **Editor visuale in italiano:** cinque sezioni (Piantina, Luci, Scene, Aspetto e Avanzate), selettori nativi Home Assistant per cercare le entità, immagine caricabile oppure selezionabile dalla libreria multimediale di Home Assistant e posizionamento dei marker con un tocco, senza YAML.
- **Dimensione dei marker personalizzabile:** controllo generale da 32 a 76 px nella sezione Aspetto e dimensione facoltativa per ogni luce in Avanzate. Anche i marker piccoli mantengono un’area di interazione ampia almeno 44 px.
- **Layout adattivo:** utilizzabile su dashboard desktop e mobili.
- **Nessun servizio esterno necessario:** la card non richiede account cloud, librerie caricate da CDN o servizi di analisi.

## Anteprime

| Modalità scura | Modalità chiara |
| :---: | :---: |
| ![GlowFloor scuro](assets/glowfloor-dark.png) | ![GlowFloor chiaro](assets/glowfloor-light.png) |

Le immagini mostrano una piantina dimostrativa. È possibile utilizzare una propria immagine.

## Installazione con HACS (consigliata)

GlowFloor Card si installa direttamente da **HACS**, aggiungendo l'indirizzo del repository GitHub come archivio personalizzato. Non è necessario scaricare file o compilare il codice.

[![Apri GlowFloor in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=luigi-regolo&repository=glowfloor-card&category=plugin)

Il pulsante apre GlowFloor in HACS attraverso My Home Assistant: **l’aggiunta dell’archivio e l’installazione richiedono comunque la conferma dell’utente**. Se il collegamento non è disponibile, utilizzare la procedura manuale riportata sotto.

1. Aprire **HACS** in Home Assistant.
2. Aprire il menu **⋮** in alto a destra e selezionare **Archivi personalizzati** (*Custom repositories*).
3. Incollare l'indirizzo del repository:

   `https://github.com/luigi-regolo/glowfloor-card`

4. Scegliere **Dashboard** come categoria e premere **Aggiungi**.
5. Cercare **GlowFloor Card** in HACS, aprirla e premere **Scarica**.
6. Aprire una dashboard in modalità modifica e aggiungere **GlowFloor Card**. Configurare la piantina e le luci attraverso l'editor visuale.

### Se la card non compare dopo l'installazione

Ricaricare la pagina di Home Assistant. Se la risorsa non è stata aggiunta automaticamente, nelle **Risorse** della dashboard aggiungere manualmente il seguente percorso come **modulo JavaScript**:

`/hacsfiles/glowfloor-card/glowfloor-card.js`

### Installazione manuale (alternativa)

Per chi non utilizza HACS, è possibile copiare `dist/glowfloor-card.js` nella cartella `/config/www/` e registrare `/local/glowfloor-card.js` come risorsa **modulo JavaScript** della dashboard. Quindi ricaricare la pagina e aggiungere la card.

## Collegare la piantina, le luci e le scene (senza YAML)

1. Installare GlowFloor da HACS, quindi aprire una dashboard in modalità modifica e scegliere **Aggiungi card → GlowFloor Card**.
2. Nella sezione **Piantina**, scegliere **Carica immagine dal dispositivo** per importare una nuova piantina oppure **Scegli immagine esistente** per usare un file già disponibile nei media di Home Assistant. In alternativa, usare la piantina dimostrativa. Le immagini personali **non vanno caricate su GitHub**. Il caricamento richiede che la libreria multimediale e la funzione di upload siano disponibili nella versione e configurazione di Home Assistant. Le immagini restano archiviate nell’istanza e non vengono pubblicate nel repository.
3. Nella sezione **Luci**, premere **Aggiungi luce**. Nel campo **Entità luce** cercare e selezionare una luce dalla propria installazione Home Assistant (`light.*`); quindi impostare il nome mostrato sul pulsante. Ripetere per le altre luci. Se il selettore nativo non è disponibile, è previsto un campo manuale per inserire l'ID effettivo.
4. Tornare in **Piantina**, scegliere dall'elenco la luce da posizionare e **toccare il punto desiderato**. Le coordinate vengono salvate automaticamente in percentuale.
5. Nella sezione **Scene**, se desiderato, aggiungere fino a tre scene (`scene.*`). Selezionare l'entità dal selettore e cambiare il testo del pulsante. Non è obbligatorio configurare scene.
6. In **Aspetto**, modificare o eliminare titolo, testo superiore e sottotitolo; scegliere il tema e attivare/disattivare l'effetto di illuminazione diffusa. Le coordinate e l'ampiezza dell'effetto per ciascuna luce sono in **Avanzate**.
7. Salvare la card e verificare che ogni lampadina comandi soltanto la luce associata. **Turn all off** spegne soltanto le luci configurate nella card.

La card utilizza le entità già presenti in Home Assistant, non crea nuove luci o scene. Per controllare manualmente un ID, aprire **Impostazioni → Dispositivi e servizi → Entità**, per esempio `light.soggiorno`. I nomi e gli ID nel README sono soltanto esempi. Se un'entità è associata a più marker, il contatore la considera una sola volta.

## Configurazione

L'editor visuale è organizzato in cinque sezioni:

| Sezione | Opzioni |
| --- | --- |
| **Piantina** | Caricamento dal dispositivo o scelta nei media di Home Assistant, piantina di esempio e posizionamento dei marker con un tocco |
| **Luci** | Selettore Home Assistant filtrato alle `light.*`, nome personalizzato e aggiunta/rimozione luci |
| **Scene** | Da 0 a 3 scene `scene.*` con nomi dei pulsanti personalizzabili |
| **Aspetto** | Titolo, testo superiore, sottotitolo, tema automatico/chiaro/scuro, illuminazione diffusa e dimensione generale dei pulsanti (32–76 px) |
| **Avanzate** | Coordinate percentuali, ampiezza delle aree illuminate, dimensione individuale facoltativa dei marker e inserimento manuale del percorso immagine |

Tutti i testi dell'intestazione sono facoltativi. Lasciandoli vuoti, il contatore e i comandi rimangono visibili.

### Esempio YAML (facoltativo)

```yaml
type: custom:glowfloor-card
eyebrow: ""
title: ""
subtitle: ""
image: /local/floorplans/casa.png
theme_mode: auto
spill_enabled: true
marker_size: 52
lights:
  - entity: light.soggiorno
    name: Soggiorno
    x: 27
    y: 44
    spread: 34
    size: 62
  - entity: light.cucina
    name: Cucina
    x: 75
    y: 29
    spread: 27
scenes:
  - entity: scene.relax
    name: Relax
  - entity: scene.cinema
    name: Cinema
  - entity: scene.notte
    name: Buonanotte
```

Le entità sono esempi: è necessario sostituirle con quelle effettivamente disponibili nella propria installazione. `x` e `y` rappresentano percentuali da 0 a 100 riferite alla piantina. `spread` regola l’area illuminata (12–75%, valore standard 32). `spill_enabled: false` disattiva tutte le illuminazioni diffuse mantenendo i marker. `marker_size` imposta la dimensione generale (32–76 px, predefinita 52). `size` è facoltativo per ogni luce e prevale sulla dimensione generale; omettendolo viene usata quella della card.

### Utilizzare una piantina personale

Il metodo consigliato è **Carica immagine dal dispositivo** oppure **Scegli immagine esistente**, nella sezione Piantina dell’editor. GlowFloor usa il selettore media ufficiale e risolve il percorso dell’immagine tramite Home Assistant, senza caricare immagini su server esterni. In alternativa, chi possiede già un file in `/config/www/floorplans/casa.png` può inserire `/local/floorplans/casa.png` nella sezione Avanzate. Evitare di pubblicare piantine reali, identificativi dei dispositivi o altri dati privati nei repository e nelle segnalazioni di problemi.

## Comandi

| Interazione | Risultato |
| --- | --- |
| Tocco su una lampadina | Accensione o spegnimento della luce associata |
| Pressione prolungata o clic destro | Apertura dei dettagli dell'entità in Home Assistant |
| **Turn all off** | Spegnimento delle luci accese configurate in questa card |
| Tocco su una scena | Attivazione della scena Home Assistant associata |
| Selezione del tema | Passaggio tra modalità automatica, chiara e scura |

## Limiti attuali

- I marker controllano entità `light.*`; non sono ancora supportati altri tipi di dispositivi.
- Le scene rapide sono facoltative e possono essere al massimo tre.
- L’illuminazione diffusa è un effetto radiale grafico: non interpreta le pareti e non cambia le impostazioni della lampadina.
- Non sono ancora disponibili slider della luminosità, raggruppamenti per stanza o trascinamento dei punti. Il posizionamento funziona selezionando una luce e toccando la piantina.
- Il cambio del tema dall'intestazione della card è temporaneo; per salvarne la scelta si utilizza l'editor.
- La disponibilità dei selettori nativi, incluso il caricamento immagini, dipende dalla versione di Home Assistant. Se non disponibili, restano i campi manuali per le entità e i percorsi locali per le immagini.

## Privacy e sicurezza

GlowFloor utilizza le API della dashboard Home Assistant e opera con i permessi dell'utente autenticato. Non contiene telemetria, strumenti di analisi né richieste a un server del progetto. Se viene configurato un URL esterno per la piantina, il browser potrà contattare il relativo servizio: per questo si consiglia di usare immagini servite localmente da Home Assistant.


## Licenza

Distribuito con licenza **GNU GPL v3.0**: consultare [LICENSE](LICENSE). Copyright © 2026 luigi-regolo. Il software rimane utilizzabile e modificabile secondo i termini della licenza. Progetto indipendente, non affiliato né approvato da Home Assistant o HACS.
