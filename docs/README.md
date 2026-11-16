# Documentazione del progetto

Aggiornamento cura-corpo del **16 novembre 2026**: [implementazione dei dodici giochi, salvataggi e compatibilità](IMPLEMENTAZIONE_CORPO_MODA_FOTO.md). Questo aggiornamento sostituisce i conteggi storici della stanza riportati nei documenti del 24 ottobre.

Riferimento: **24 ottobre 2026**, codice del workspace incluse modifiche non committate. Implementato significa presente nel codice; verificato significa effettivamente provato. I servizi remoti non sono stati collaudati durante questa analisi.

| Esigenza | Documento |
| --- | --- |
| Comprendere moduli, route, stato e scoring | [Architettura](ARCHITETTURA.md) |
| Sapere cosa è pronto e cosa manca | [Stato e backlog](STATO_PROGETTO.md) |
| Preparare i media della stanza corpo/moda/fotografia | [Inventario corrente e correzioni immagini](MEDIA_CORPO_MODA_FOTOGRAFIA_CORRENTE.md) |
| Ultimi media per profumi e finale | [Inventario delle 9 immagini finali](MEDIA_DA_RECUPERARE_CORPO_MODA_FOTO.md) |
| Tempi, sinonimi, opzioni, soglie e regalo definitivi | [Decisioni finali corpo/moda/fotografia](DECISIONI_FINALI_CORPO_MODA_FOTO.md) |
| Riprendere il completamento dei giochi in VS Code | [Specifica consolidata al 16 novembre](PROMPT_COMPLETAMENTO_STANZA_CORPO_MODA_FOTO.md) |
| Implementare una sfida, sala o modifica | [Guida sviluppo](GUIDA_SVILUPPO.md) |
| Configurare ambiente, Supabase ed email | [Configurazione](CONFIGURAZIONE.md) |
| Iniziare una nuova chat con un agente o ChatGPT | [Contesto chat](CONTESTO_CHAT.md) |
| Istruzioni operative per agent nel repository | [AGENTS.md](../AGENTS.md) |

Per una nuova chat leggere prima contesto e stato, poi il documento pertinente. In caso di conflitto il codice descrive il comportamento implementato; il design descrive intenzioni.

## Materiale storico

[shadow_hall_design.md](shadow_hall_design.md) contiene proposte, sale future e il vecchio ID `film-serie`: l'ID attuale è `serie-film`. Cita inoltre `categories.json`, sostituito dai file in `src/data/categories/`.

[EMAIL_CONFIGURATION.md](EMAIL_CONFIGURATION.md), [EMAIL_INFRASTRUCTURE.md](EMAIL_INFRASTRUCTURE.md) e [RESEND_SETUP.md](RESEND_SETUP.md) contengono parti superate: integrazione UI, destinatario e template sono già presenti. Per lo stato corrente partire da [Configurazione](CONFIGURAZIONE.md).
