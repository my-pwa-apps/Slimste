# 🚀 Snelstart Gids

## ⚠️ BELANGRIJK: Stap 1 - Firebase Realtime Database Setup

**Je MOET dit doen anders werkt de website niet!**

De app gebruikt **Firebase Realtime Database** (100% GRATIS!) voor data opslag.

### Activeer Realtime Database (5 minuten):

1. Ga naar [Firebase Console](https://console.firebase.google.com/)
2. Open je project: **de-slimste-meijers**
3. Klik op **Realtime Database** in het linkermenu (of Build → Realtime Database)
4. Klik op **"Create Database"** knop
5. Selecteer locatie: **europe-west1** (België)
6. Selecteer **"Start in test mode"** ← Belangrijk!
7. Klik op **"Enable"**
8. Ga naar **"Rules"** tab
9. Vervang de regels met:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
10. Klik **"Publish"**

📖 **Gedetailleerde instructies**: Zie `REALTIME-DATABASE-SETUP.md`

✅ **Voordelen Realtime Database**:
- 100% GRATIS (Spark Plan)
- Real-time synchronisatie
- Geen credit card nodig
- Perfect voor familie events

## Stap 2: Test Lokaal (Snelste Manier)

### Optie A: Python (Als je Python hebt)
```powershell
cd "c:\Users\bartm\OneDrive - Microsoft\Documents\Git Repos\Slimste"
python -m http.server 8000
```
Open browser: http://localhost:8000

### Optie B: Node.js http-server
```powershell
npm install -g http-server
cd "c:\Users\bartm\OneDrive - Microsoft\Documents\Git Repos\Slimste"
http-server -p 8000
```
Open browser: http://localhost:8000

### Optie C: Live Server (VS Code extensie)
1. Installeer "Live Server" extensie in VS Code
2. Rechtsklik op index.html
3. Klik "Open with Live Server"

## Stap 3: Host Online (Voor Familie Event)

### Firebase Hosting (Aanbevolen):
```powershell
# Installeer Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy
cd "c:\Users\bartm\OneDrive - Microsoft\Documents\Git Repos\Slimste"
firebase deploy
```

Je site is live op: **https://de-slimste-meijers.web.app**

### Netlify (Nog Eenvoudiger):
1. Ga naar [netlify.com](https://netlify.com)
2. Sleep de hele "Slimste" folder
3. Klaar!

## Stap 4: Eerste Gebruik

1. **Open de website**
2. De eerste keer laden duurt ~10 seconden (standaard vragen worden toegevoegd)
3. **Navigeer naar Admin** (onderaan de pagina)
4. Verifieer dat er vragen zijn toegevoegd
5. **Test het spel**:
   - Ga naar Home
   - Meld een test team aan
   - Speel een ronde
   - Check het Scorebord

## Stap 5: Event Setup

### Voor het echte evenement:

1. **Display/TV Setup:**
   - Open de website op een laptop/tablet aangesloten op TV
   - Klik op "Scorebord" in de navigatie
   - Zet browser in fullscreen (F11)

2. **Spelleider Device:**
   - Open de website op een tablet/laptop
   - Ga naar "Admin" sectie
   - Voeg extra vragen toe indien gewenst

3. **Team Devices:**
   - Elk team opent de website op hun telefoon/tablet
   - Ze klikken op "Home"
   - Vullen team naam en spelers in
   - Klikken op "Spelen" om te beginnen

## Troubleshooting

### ❌ Vragen laden niet?
- Wacht 10-15 seconden na eerste laden
- Refresh de pagina (F5)
- Check browser console (F12) voor errors

### ❌ Firebase errors?
- Verifieer dat Firestore is geactiveerd in Firebase Console
- Check dat de database regels correct zijn ingesteld

### ❌ Lokaal testen werkt niet?
- Gebruik een van de server opties (Python/Node/Live Server)
- Open NIET direct het bestand (file:/// URLs werken niet met Firebase)

### ❌ Mobiel werkt niet goed?
- Gebruik een moderne browser (Chrome, Safari, Firefox, Edge)
- Check internet verbinding
- Zorg dat alle devices op hetzelfde WiFi netwerk zitten voor beste prestaties

## Tips voor Beste Ervaring

✅ Test alles 1 dag van tevoren
✅ Voeg eventueel extra vragen toe via Admin panel
✅ Zorg voor goede WiFi voor alle deelnemers
✅ Heb een backup device klaar
✅ Stel een spelleider aan voor Admin taken

## Veel Plezier! 🎉

Wie wordt De Slimste Meijers? 🏆
