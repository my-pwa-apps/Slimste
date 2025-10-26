# De Slimste Familie 🧠

Een interactieve quiz website gebaseerd op het populaire TV-programma "De Slimste Mens", speciaal gemaakt voor de Meijers familie!

## 🎮 Spelonderdelen

### 1. De Open Deur
Teams krijgen hints getoond en moeten raden wat het antwoord is. Hoe sneller je het goede antwoord geeft, hoe beter!

### 2. De Puzzel
Vorm woorden uit de gegeven letters door ze in de juiste volgorde te klikken.

### 3. De Galerij
Bekijk afbeeldingen en ontdek het gemeenschappelijke thema of antwoord op de vraag.

### 4. Het Collectief Geheugen
Noem zoveel mogelijk items uit een gegeven categorie voordat je 3 fouten maakt.

## 🚀 Hoe te starten

1. **Open de website**
   - Open `index.html` in een moderne webbrowser (Chrome, Firefox, Safari, Edge)
   - Of host de bestanden op een webserver

2. **Team Aanmelden**
   - Vul een teamnaam in (bijvoorbeeld jullie gezinsnaam)
   - Voeg 1-4 spelers toe
   - Klik op "Start het Spel"

3. **Spelen**
   - Kies een ronde om te spelen
   - Beantwoord vragen en verdien seconden
   - Juiste antwoorden = meer seconden ⬆️
   - Foute antwoorden = minder seconden ⬇️

## 📱 Views

### Voor Deelnemers
- **Home**: Meld je team aan
- **Spelen**: Speel de verschillende rondes
- **Scorebord**: Bekijk alle teams en hun scores

### Voor Admin
- **Admin Panel**: 
  - Voeg nieuwe vragen toe
  - Beheer bestaande vragen
  - Bekijk actieve teams
  - Reset het spel

### Voor Display
- **Scorebord View**: Volledig scherm voor op een TV/beamer om de scores live bij te houden

## 🎨 Design

De website is gestyled in de kenmerkende kleuren van De Slimste Mens:
- **Primair Oranje**: #FF6B35
- **Primair Blauw**: #004E89
- **Accent Geel**: #FFD23F
- **Succes Groen**: #00D084

## 📊 Scoring

- **De Open Deur**: +15 seconden per goed antwoord, -5 bij fout
- **De Puzzel**: +20 seconden per goed antwoord, -5 bij fout
- **De Galerij**: +25 seconden per goed antwoord, -5 bij fout
- **Het Collectief Geheugen**: +30 seconden voor complete categorie, +3 per correct item, -5 bij 3 fouten

## 🔥 Firebase Database

De applicatie gebruikt Firebase Firestore voor:
- Opslag van teams en scores
- Vragenbank
- Real-time synchronisatie tussen apparaten

### Database Structuur

**Teams Collection:**
```javascript
{
  name: "Familie Jansen",
  players: ["Jan", "Piet", "Klaas"],
  seconds: 60,
  completedRounds: ["open-deur", "puzzel"],
  timestamp: Date
}
```

**Questions Collection:**
```javascript
{
  type: "open-deur" | "puzzel" | "galerij" | "collectief-geheugen",
  // Type-specifieke velden...
  timestamp: Date
}
```

## 📱 Mobiel Vriendelijk

De website is volledig responsive en werkt perfect op:
- 📱 Smartphones
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktop computers

## 🎯 Standaard Vragen

Bij eerste gebruik worden automatisch 25+ vragen toegevoegd:
- 5 Open Deur vragen
- 6 Puzzel vragen
- 4 Galerij vragen
- 6 Collectief Geheugen vragen

Dit zorgt voor minimaal 30 minuten speelplezier!

## 🛠️ Technische Details

- **Pure HTML/CSS/JavaScript** - Geen TypeScript of frameworks
- **Firebase Firestore** - Voor database en real-time updates
- **ES6 Modules** - Voor moderne JavaScript structuur
- **Responsive Design** - Werkt op alle schermformaten
- **Geen build stappen** - Direct te gebruiken

## 🎮 Tips voor de beste ervaring

1. **Meerdere apparaten**: Elk team kan op hun eigen telefoon/tablet inloggen
2. **Display scherm**: Gebruik een TV/beamer voor het Scorebord
3. **Admin device**: Gebruik 1 apparaat als admin om vragen te beheren
4. **WiFi**: Zorg voor goede internetverbinding voor alle deelnemers

## 🎉 Veel speelplezier!

Wie wordt **De Slimste Meijers**? 🏆
