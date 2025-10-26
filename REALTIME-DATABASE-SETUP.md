# 🔥 Firebase Realtime Database Setup (GRATIS!)

## ✅ Waarom Realtime Database?

De **Realtime Database** van Firebase is **100% GRATIS** binnen de Spark Plan limits:
- ✅ 1 GB opgeslagen data
- ✅ 10 GB/maand downloads
- ✅ 100 gelijktijdige verbindingen

Perfect voor jullie familie quiz event!

---

## 📋 Setup Stappen (5 minuten)

### Stap 1: Open Firebase Console
1. Ga naar: https://console.firebase.google.com/
2. Klik op je project: **de-slimste-meijers**

### Stap 2: Activeer Realtime Database
1. Klik in het linkermenu op **"Realtime Database"** 
   - Of ga naar "Build" → "Realtime Database"
2. Klik op de knop **"Create Database"**

### Stap 3: Kies Locatie
- **Selecteer**: `europe-west1` (Belgi)
- Dit is het dichtst bij Nederland
- Klik **"Next"**

### Stap 4: Beveiligingsregels
- **Selecteer**: **"Start in test mode"**
- Dit geeft tijdelijk toegang voor iedereen (30 dagen)
- Klik **"Enable"**

⏳ **Wacht 10-20 seconden** terwijl de database wordt aangemaakt...

✅ **Klaar!** Je ziet nu een lege database met `null` als waarde.

---

## 🔒 Beveiligingsregels Instellen

Na activering zie je de database. Nu de regels aanpassen:

### Methode 1: Test Mode (Eenvoudig - Voor Familie Event)

1. Klik op het **"Rules"** tabblad bovenaan
2. Je ziet:
```json
{
  "rules": {
    ".read": "now < [TIMESTAMP]",  // Geldig tot bepaalde datum
    ".write": "now < [TIMESTAMP]"
  }
}
```

3. **Vervang dit met**:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

4. Klik **"Publish"**

⚠️ **Let op**: Deze regels zijn open voor iedereen. Perfect voor een tijdelijk familie event!

### Methode 2: Veiligere Regels (Optioneel)

Voor betere beveiliging (als de site langer online blijft):

```json
{
  "rules": {
    "teams": {
      ".read": true,
      ".write": true,
      "$teamId": {
        ".validate": "newData.hasChildren(['name', 'players', 'seconds'])"
      }
    },
    "questions": {
      ".read": true,
      ".write": true
    }
  }
}
```

---

## 🧪 Test de Verbinding

### In de Browser:

1. Open je website: `http://localhost:8000`
2. Open de **Browser Console** (F12)
3. Je zou moeten zien:
   - `Checking for existing questions...`
   - `Initializing default questions...`
   - `Default questions added successfully!`

4. Ga terug naar Firebase Console → Realtime Database
5. Klik het refresh icoontje
6. Je ziet nu data:
   ```
   de-slimste-meijers-default-rtdb
   └── questions
       └── [verschillende vraag IDs]
   ```

✅ **Het werkt!**

### Geen data zichtbaar?

- Wacht 10-15 seconden en refresh
- Check browser console voor errors
- Verifieer dat Rules zijn ingesteld op "read/write: true"

---

## 🔍 Database URL Controleren

Je database URL moet zijn:
```
https://de-slimste-meijers-default-rtdb.europe-west1.firebasedatabase.app
```

Deze staat al correct in `js/firebase-config.js`!

Als je URL anders is:
1. Kopieer de URL uit Firebase Console → Realtime Database (bovenaan de pagina)
2. Update `databaseURL` in `js/firebase-config.js`

---

## 📊 Database Structuur

Na het spelen zie je deze structuur:

```
de-slimste-meijers-default-rtdb/
├── teams/
│   ├── -ABC123/
│   │   ├── name: "Familie Jansen"
│   │   ├── players: ["Jan", "Piet", "Klaas"]
│   │   ├── seconds: 85
│   │   ├── completedRounds: ["open-deur", "puzzel"]
│   │   └── timestamp: 1234567890
│   └── -XYZ789/
│       └── ...
└── questions/
    ├── -DEF456/
    │   ├── type: "open-deur"
    │   ├── hints: ["hint1", "hint2"]
    │   ├── answer: "Nederland"
    │   └── timestamp: 1234567890
    └── -GHI012/
        └── ...
```

Je kunt deze data live bekijken in Firebase Console!

---

## 💰 Kosten & Limieten

### Spark Plan (GRATIS):
- ✅ **Opslag**: 1 GB (jullie gebruiken ~1-5 MB)
- ✅ **Downloads**: 10 GB/maand (quiz gebruikt ~10-50 MB per event)
- ✅ **Verbindingen**: 100 gelijktijdig (perfect voor familie event)

**Conclusie**: Je blijft 100% binnen de gratis limieten! 🎉

### Upgrade nodig?

Alleen als je:
- Meer dan 100 mensen tegelijk laat spelen
- De database maandenlang actief houdt met veel verkeer
- Gigabytes aan data opslaat

Voor een familie event: **absoluut niet nodig!**

---

## 🆘 Troubleshooting

### ❌ Error: "Permission Denied"
**Oplossing**:
1. Ga naar Firebase Console → Realtime Database → Rules
2. Verifieer dat rules zijn:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
3. Klik "Publish"
4. Wacht 10 seconden
5. Refresh browser (F5)

### ❌ Error: "Failed to get document"
**Oplossing**:
- Check of database URL correct is in `firebase-config.js`
- Moet eindigen op `.firebasedatabase.app`
- Check of `europe-west1` in de URL staat

### ❌ Geen data zichtbaar in Firebase Console
**Oplossing**:
- Wacht 15-20 seconden na eerste laden
- Klik refresh icoontje in Firebase Console
- Check browser console (F12) voor JavaScript errors
- Verifieer dat website correct laadt

### ❌ Website werkt lokaal maar niet na hosting
**Oplossing**:
- Check of `databaseURL` in firebase-config.js correct is
- Voor hosting moet je misschien CORS regels instellen (meestal niet nodig)

---

## ✅ Checklist

Voltooi deze stappen:

- [ ] Firebase Console geopend
- [ ] Project "de-slimste-meijers" geselecteerd
- [ ] Realtime Database aangemaakt
- [ ] Locatie: europe-west1 gekozen
- [ ] Rules ingesteld op read/write: true
- [ ] Website geladen (localhost of gehost)
- [ ] Browser console checked - geen errors
- [ ] Firebase Console: data zichtbaar onder "questions"
- [ ] Test team aangemeld
- [ ] Scorebord werkt

---

## 🎉 Klaar!

Je Realtime Database is nu actief en **100% GRATIS**!

**Volgende stap**: Test de complete game flow:
1. Meld een team aan
2. Speel een ronde
3. Check het scorebord
4. Verifieer data in Firebase Console

**Veel plezier met De Slimste Meijers!** 🏆
