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
- **Editor visuale:** aggiunta delle luci e posizionamento dei punti direttamente sulla piantina, senza bisogno di scrivere YAML per la configurazione ordinaria.
- **Layout adattivo:** utilizzabile su dashboard desktop e mobili.
- **Nessun servizio esterno necessario:** la card non richiede account cloud, librerie caricate da CDN o servizi di analisi.

## Anteprime

| Modalità scura | Modalità chiara |
| :---: | :---: |
| ![GlowFloor scuro](assets/glowfloor-dark.png) | ![GlowFloor chiaro](assets/glowfloor-light.png) |

Le immagini mostrano una piantina dimostrativa. È possibile utilizzare una propria immagine.

## Installazione con HACS (consigliata)

GlowFloor Card si installa direttamente da **HACS**, aggiungendo l'indirizzo del repository GitHub come archivio personalizzato. Non è necessario scaricare file o compilare il codice.

1. Aprire **HACS** in Home Assistant.
2. Aprire il menu **⋮** in alto a destra e selezionare **Archivi personalizzati** (*Custom repositories*).
3. Incollare l'indirizzo del repository:

   `https://github.com/luigi-regolo/glowfloor-card`

4. Scegliere **Dashboard** come categoria e premere **Aggiungi**.
5. Cercare **GlowFloor Card** in HACS, aprirla e premere **Scarica**.
6. Aprire una dashboard in modalità modifica e aggiungere **GlowFloor Card**. Configurare la piantina e le luci attraverso l'editor visuale.

> **Nota:** HACS può scaricare soltanto repository pubblici. Il link sarà utilizzabile per questa procedura quando il repository sarà pubblico.

### Se la card non compare dopo l'installazione

Ricaricare la pagina di Home Assistant. Se la risorsa non è stata aggiunta automaticamente, nelle **Risorse** della dashboard aggiungere manualmente il seguente percorso come **modulo JavaScript**:

`/hacsfiles/glowfloor-card/glowfloor-card.js`

### Installazione manuale (alternativa)

Per chi non utilizza HACS, è possibile copiare `dist/glowfloor-card.js` nella cartella `/config/www/` e registrare `/local/glowfloor-card.js` come risorsa **modulo JavaScript** della dashboard. Quindi ricaricare la pagina e aggiungere la card.

## Collegare le luci e le scene tramite l'editor (senza YAML)

1. In Home Assistant aprire **Impostazioni → Dispositivi e servizi → Entità** e cercare la luce da utilizzare. Controllare l'**ID entità**, ad esempio `light.soggiorno`. È possibile individuarlo anche in **Impostazioni → Strumenti per sviluppatori → Stati**, filtrando per `light.`. Usare sempre l'ID effettivo presente nel proprio Home Assistant, non quello degli esempi.
2. Aprire la dashboard e scegliere **Modifica dashboard → Aggiungi card → GlowFloor Card** (la voce è disponibile dopo aver installato e registrato la risorsa della card).
3. Nell'editor, nel campo **Piantina**, inserire il percorso dell'immagine oppure lasciare vuoto per usare la piantina dimostrativa.
4. Nella sezione **Light markers**, premere **Add light**, inserire l'**ID entità** `light.*` e il **nome** da visualizzare sul pulsante. Ripetere per tutte le luci desiderate.
5. In **Position markers**, selezionare il marker nell'elenco e poi toccare il punto della piantina in cui posizionarlo. Le coordinate percentuali vengono compilate automaticamente. Il campo **Area luce %** permette di scegliere l'ampiezza dell'effetto luminoso per quella luce; l'opzione **Illuminazione diffusa sulla piantina** permette di disattivarlo per l'intera card.
6. Facoltativo: in **Optional scenes** aggiungere fino a tre scene. Ogni scena richiede un'**entità `scene.*` realmente esistente** e il nome che si vuole mostrare sul pulsante. Per creare scene in Home Assistant: **Impostazioni → Automazioni e scene → Scene → Crea scena**. Il nome scelto nella card non cambia l'ID né il nome della scena originale.
7. Salvare la card e verificare che il tocco su una lampadina accenda soltanto l'entità assegnata. **Turn all off** spegne unicamente le luci configurate nella card.

**Nota:** la card non scopre o crea automaticamente luci o scene; collega entità già presenti in Home Assistant. Se la stessa entità luce viene configurata su più marker, il contatore la considera una sola volta.

## Configurazione

Nell'editor della card si possono impostare:

1. **Testo superiore, titolo e sottotitolo**: ciascun campo è facoltativo. Per non visualizzare alcuna scritta nell'intestazione, svuotare tutti e tre i campi.
2. **Piantina**: percorso di un'immagine, ad esempio `/local/floorplans/casa.png`. Se il campo è vuoto viene mostrata l'illustrazione dimostrativa.
3. **Luci**: entità `light.*`, nome del pulsante, posizione e ampiezza della zona luminosa. Selezionare una luce e fare clic sulla piantina per spostarne il marker.
4. **Scene rapide**: da zero a tre entità `scene.*`. Per ognuna è possibile scrivere liberamente il nome visualizzato sul pulsante (ad esempio *Relax*, *Cinema*, *Buonanotte*). Modificare il nome nella card **non rinomina** la scena in Home Assistant.
5. **Illuminazione diffusa**: attiva/disattiva l’effetto sulla piantina senza modificare i dispositivi.
6. **Tema**: automatico, scuro o chiaro.

### Esempio YAML (facoltativo)

```yaml
type: custom:glowfloor-card
eyebrow: ""
title: ""
subtitle: ""
image: /local/floorplans/casa.png
theme_mode: auto
spill_enabled: true
lights:
  - entity: light.soggiorno
    name: Soggiorno
    x: 27
    y: 44
    spread: 34
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

Le entità sono esempi: è necessario sostituirle con quelle effettivamente disponibili nella propria installazione. `x` e `y` rappresentano percentuali da 0 a 100 riferite alla piantina. `spread` regola l’area illuminata (12–75%, valore standard 32). `spill_enabled: false` disattiva tutte le illuminazioni diffuse mantenendo i marker.

### Utilizzare una piantina personale

Salvare l'immagine, per esempio, in `/config/www/floorplans/casa.png` e indicare `/local/floorplans/casa.png` nella configurazione. Evitare di pubblicare piantine reali, identificativi dei dispositivi o altri dati privati nei repository e nelle segnalazioni di problemi.

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
- Non sono ancora disponibili slider della luminosità, raggruppamenti per stanza o trascinamento dei punti nell'editor. Il posizionamento funziona selezionando una luce e cliccando sulla piantina.
- Il cambio del tema dall'intestazione della card è temporaneo; per salvarne la scelta si utilizza l'editor.
- Non è garantita la compatibilità con ogni versione di Home Assistant o con ogni dispositivo.

## Privacy e sicurezza

GlowFloor utilizza le API della dashboard Home Assistant e opera con i permessi dell'utente autenticato. Non contiene telemetria, strumenti di analisi né richieste a un server del progetto. Se viene configurato un URL esterno per la piantina, il browser potrà contattare il relativo servizio: per questo si consiglia di usare immagini servite localmente da Home Assistant.

La demo inclusa simula gli stati delle luci e non si collega a un'installazione Home Assistant.


## Licenza

Distribuito con licenza **GNU GPL v3.0**: consultare [LICENSE](LICENSE). Copyright © 2026 luigi-regolo. Il software rimane utilizzabile e modificabile secondo i termini della licenza. Progetto indipendente, non affiliato né approvato da Home Assistant o HACS.