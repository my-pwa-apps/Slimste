# Spelmodus en Gecoördineerde Start

## Overzicht

Het spel heeft nu drie nieuwe functionaliteiten:
1. **Spelmodus Selectie** - Kies tussen test, kort, normaal of lang spel
2. **Dynamische Vraag Allocatie** - Aantal vragen past zich aan aan gekozen spelmodus
3. **Gecoördineerde Start** - Alle teams moeten klaar zijn voordat het spel start

## Spelmodi

### ⚡ Test Modus (~5 minuten)
- **Doel**: Snel testen of alles werkt
- **Vragen per ronde**:
  - Open Deur: 2 vragen
  - Puzzel: 1 puzzel
  - Woordzoeker: 2 puzzels
  - Wat Weet U Over: 1 onderwerp
  - Collectief Geheugen: 1 categorie

### ⏱️ Kort Spel (~30 minuten)
- **Doel**: Snelle quiz voor een klein groepje
- **Vragen per ronde**:
  - Open Deur: 5 vragen
  - Puzzel: 2 puzzels
  - Woordzoeker: 5 puzzels
  - Wat Weet U Over: 2 onderwerpen
  - Collectief Geheugen: 3 categorieën

### 🎯 Normaal Spel (~60 minuten) - AANBEVOLEN
- **Doel**: Volledige spelervaring voor gezinsavond
- **Vragen per ronde**:
  - Open Deur: 8 vragen
  - Puzzel: 4 puzzels
  - Woordzoeker: 8 puzzels
  - Wat Weet U Over: 4 onderwerpen
  - Collectief Geheugen: 6 categorieën

### 🏆 Lang Spel (~90 minuten)
- **Doel**: Maximale uitdaging voor echte quizfans
- **Vragen per ronde**:
  - Open Deur: 12 vragen
  - Puzzel: 6 puzzels
  - Woordzoeker: 12 puzzels
  - Wat Weet U Over: 6 onderwerpen
  - Collectief Geheugen: 9 categorieën

## Hoe Werkt Het?

### Stap 1: Setup (Admin)
1. Open de website - je komt op het **Setup scherm**
2. Kies een spelmodus door op één van de vier knoppen te klikken
3. Klik op **"Bevestig en Open voor Teams"**
4. De spelmodus wordt opgeslagen in Firebase
5. Je komt automatisch op het login scherm

### Stap 2: Teams Aanmelden
1. Elk team ziet de gekozen spelmodus bovenaan het login formulier
2. Teams vullen teamnaam en spelers in
3. Na aanmelden komen ze in de **Wachtkamer (Lobby)**

### Stap 3: Wachtkamer
- Teams zien een lijst van alle aangemelde teams
- Elk team kan de status van andere teams zien:
  - ⏳ **Wachten** - Team is nog niet klaar
  - ✓ **Klaar** - Team heeft aangegeven klaar te zijn
- Elk team klikt op de **"✓ Ik ben Klaar!"** knop wanneer ze klaar zijn
- De teller onderaan toont hoeveel teams klaar zijn (bijv. "2/3 klaar")

### Stap 4: Gecoördineerde Start
- Zodra **alle teams** hun ready-status hebben aangegeven:
  - Verschijnt de melding: "🎉 Alle teams zijn klaar! Het spel start over 3 seconden..."
  - Na 3 seconden start het spel automatisch voor **alle teams tegelijk**
  - Alle teams gaan naar het spel scherm en kunnen beginnen

## Technische Details

### Firebase Structuur

```
gameState/
  ├── mode: "test" | "short" | "normal" | "long"
  ├── gameStarted: true | false
  └── readyTeams: {} (deprecated - now using team.ready field)

teams/
  ├── teamId1/
  │   ├── name: "Familie Jansen"
  │   ├── players: ["Jan", "Piet"]
  │   ├── seconds: 60
  │   ├── completedRounds: []
  │   ├── ready: true | false
  │   └── timestamp: 1234567890
  └── teamId2/
      └── ...
```

### Vraag Selectie Algoritme

1. Alle vragen van het juiste type worden opgehaald uit Firebase
2. Als er meer vragen zijn dan nodig voor de gekozen modus:
   - Vragen worden **random geschud** (shuffleArray functie)
   - Alleen het benodigde aantal wordt geselecteerd
3. Dit gebeurt bij elke ronde, zodat teams verschillende vragen kunnen krijgen

### Real-time Synchronisatie

De app gebruikt Firebase Realtime Database listeners voor:
- **Game Mode**: Teams zien meteen de gekozen spelmodus
- **Ready Status**: Wanneer een team op "Klaar" klikt, zien andere teams dit direct
- **Game Start**: Wanneer het spel start, worden alle teams tegelijk doorgestuurd

## Voordelen van dit Systeem

### ✅ Flexibiliteit
- Test snel in 5 minuten of alles werkt
- Pas de speeltijd aan aan je beschikbare tijd
- Meer vragen = meer variatie en uitdaging

### ✅ Eerlijkheid
- Alle teams starten tegelijk
- Niemand kan beginnen terwijl anderen nog bezig zijn met aanmelden
- Iedereen heeft dezelfde voorbereidingstijd

### ✅ Gebruiksvriendelijk
- Duidelijke indicatoren wie klaar is en wie niet
- Automatische countdown wanneer iedereen klaar is
- Geen handmatige coördinatie nodig

## Tips voor Organisatoren

### Voor een Eerste Test
- Gebruik **Test Modus** (5 min)
- Meld 1 of 2 teams aan
- Verifieer dat alle rondes werken
- Check of de scoreboard correct update

### Voor een Gezinsavond
- Gebruik **Normaal Spel** (60 min)
- Geef teams tijd om hun teamnaam te bedenken
- Wacht tot iedereen is ingelogd voordat je "Klaar" klikt
- Zorg voor een groot scherm voor het scoreboard

### Voor een Competitie
- Gebruik **Lang Spel** (90 min)
- Voeg meer vragen toe in het admin panel
- Gebruik het scoreboard met muziek voor sfeer
- Maak screenshots van het eindresultaat

## Troubleshooting

### "Ik zie geen setup scherm"
- Clear je browser cache en cookies
- Verwijder `gameState` uit Firebase Database om opnieuw te beginnen

### "Het spel start niet automatisch"
- Check of alle teams op "Klaar" hebben geklikt
- Kijk in de browser console voor errors
- Verifieer de Firebase Database regels

### "Ik wil de spelmodus veranderen"
- Ga naar Firebase Console
- Navigeer naar Database → gameState
- Verwijder de `mode` en `gameStarted` velden
- Refresh de website - je komt weer op setup scherm

### "Teams kunnen niet aanmelden"
- Check of de spelmodus is ingesteld in setup
- Verifieer Firebase Database regels
- Check browser console voor errors

## Toekomstige Uitbreidingen

Mogelijke verbeteringen:
- Admin panel om spelmodus te wijzigen zonder Firebase Console
- "Herstart Spel" knop om opnieuw te beginnen
- Custom modus waar je zelf aantal vragen per ronde instelt
- Timer per ronde om competitief element toe te voegen
- Replay functie om vragen opnieuw te gebruiken

---

**Let op**: Zorg dat je voldoende vragen hebt toegevoegd in het Admin Panel voor de gekozen spelmodus. De app selecteert random vragen, dus hoe meer vragen je hebt, hoe meer variatie mogelijk is.
