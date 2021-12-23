# Top 2000 Bot

Top 2000 Bot is een Discord bot voor de [NPO Radio 2 Top 2000](https://www.nporadio2.nl/top2000).

In de [Discord server](https://discord.gg/6MPqCy9GjN) stuurt de bot het huidig afspelend nummer. 

Met de [commands](#Commands) kan je naar nummers zoeken en de bot je een reminder sturen wanneer een nummer bijna aan bod komt.

## Links

[Voeg de bot toe](https://discord.com/api/oauth2/authorize?client_id=792764683391598632&permissions=18432&scope=bot%20applications.commands)

[Discord Server](https://discord.gg/6MPqCy9GjN)

## Commands

### Zoeken

Zoek naar nummers in de lijst.

`/zoek titel/artiest/plek [zoekterm]`

Voorbeelden:

> Vind Bohemian Rhapsody van Queen `/zoek titel Bohemian Rhapsody`

> Vind alle nummers van ABBA `/zoek artiest ABBA`

> Vind alle nummers met "sing" in de titel (uprising meegeteld) `/zoek titel sing`

> Vind het nummer op plek #481 `/zoek plek 481`

### Lijst
Krijg de Top 2000 lijst

`/lijst`

De lijst opent bij de aankomende nummers. Je kan de knoppen gebruiken om door de lijst te navigeren.

### Reminder
Stel een reminder in zodat de bot je laat weten wanneer een nummer bijna aan bod komt.

`/remind [plek]`

Bijvoorbeeld: `/remind 1827`