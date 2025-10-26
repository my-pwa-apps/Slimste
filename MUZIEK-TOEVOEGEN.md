# Achtergrondmuziek Toevoegen

## Overzicht
Het scorebord heeft nu een muziek toggle knop waarmee je achtergrondmuziek kunt afspelen. Standaard is er een placeholder muziekbron ingesteld, maar je kunt dit vervangen door de echte "De Slimste Mens" muziek.

## Huidige Implementatie

### HTML (index.html)
```html
<audio id="backgroundMusic" loop>
    <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg">
</audio>
```

### Features
- 🔊 **Toggle knop** in scoreboard header
- 🔁 **Loop mode** - muziek herhaalt automatisch
- 🎚️ **Volume 30%** - niet te hard, niet te zacht
- ▶️ **Auto-play** (kan geblokkeerd worden door browser)
- ⏸️ **Handmatige controle** via toggle knop

## De Slimste Mens Muziek Toevoegen

### Optie 1: Lokaal MP3 Bestand

1. **Download de muziek:**
   - Zoek "De Slimste Mens themesong" op YouTube
   - Gebruik een YouTube to MP3 converter
   - Of gebruik de officiële soundtrack als je die hebt

2. **Plaats het bestand:**
   ```
   /Slimste
   ├── index.html
   ├── js/
   ├── css/
   └── assets/
       └── music/
           └── slimste-mens-theme.mp3  ← Plaats hier
   ```

3. **Update index.html:**
   ```html
   <audio id="backgroundMusic" loop>
       <source src="assets/music/slimste-mens-theme.mp3" type="audio/mpeg">
   </audio>
   ```

### Optie 2: Online Hosting

Als je de muziek online host (bijv. Firebase Storage, Dropbox, Google Drive):

```html
<audio id="backgroundMusic" loop>
    <source src="JOUW_ONLINE_URL_HIER" type="audio/mpeg">
</audio>
```

**Let op:** Zorg dat de URL direct naar het MP3 bestand wijst en CORS toegestaan is.

### Optie 3: Meerdere Muziek Tracks

Je kunt ook meerdere tracks toevoegen voor variatie:

```html
<audio id="backgroundMusic" loop>
    <source src="assets/music/slimste-mens-1.mp3" type="audio/mpeg">
</audio>

<audio id="backgroundMusic2" loop style="display: none;">
    <source src="assets/music/slimste-mens-2.mp3" type="audio/mpeg">
</audio>
```

## Muziek Controles

### Volume Aanpassen

In `js/app.js`, functie `initializeScoreboardMusic()`:
```javascript
music.volume = 0.3;  // 0.0 (stil) tot 1.0 (vol)
```

### Auto-play Uitschakelen

Verwijder of comment uit in `initializeScoreboardMusic()`:
```javascript
// setTimeout(() => {
//     music.play().catch(err => {
//         console.log('Autoplay prevented');
//     });
// }, 500);
```

### Andere Track voor Verschillende Momenten

Je kunt verschillende muziek afspelen voor verschillende situaties:

```javascript
// In showLeaderChangeNotification()
const fanfare = new Audio('assets/music/fanfare.mp3');
fanfare.volume = 0.5;
fanfare.play();
```

## Browser Compatibiliteit

### Autoplay Beleid

Moderne browsers blokkeren vaak autoplay:
- ✅ **Chrome/Edge**: Autoplay geblokkeerd totdat gebruiker interactie heeft
- ✅ **Firefox**: Idem
- ✅ **Safari**: Striktere autoplay beleid
- ✅ **Mobile**: Meestal geblokkeerd

**Oplossing:** De toggle knop zorgt dat gebruikers handmatig kunnen starten.

### Ondersteunde Formaten

- ✅ **MP3**: Beste compatibiliteit
- ✅ **OGG**: Alternatief voor Firefox
- ✅ **WAV**: Grote bestanden, maar universeel

```html
<audio id="backgroundMusic" loop>
    <source src="assets/music/slimste-mens.mp3" type="audio/mpeg">
    <source src="assets/music/slimste-mens.ogg" type="audio/ogg">
    Your browser does not support the audio element.
</audio>
```

## Aanbevolen Instellingen

### Voor Scoreboard Display
- **Volume**: 0.2 - 0.4 (niet te hard)
- **Loop**: Ja (continue muziek)
- **Autoplay**: Optioneel (kan geblokkeerd worden)

### Voor Spannende Momenten
- **Leader Change**: Korte fanfare (3-5 seconden)
- **Round Complete**: Applaus geluid
- **Correct Answer**: Ding/bell geluid

## Troubleshooting

### "Muziek speelt niet af"
1. Check of het MP3 bestand bestaat
2. Check browser console voor errors
3. Klik op de toggle knop (autoplay geblokkeerd?)
4. Check volume niet op 0 staat

### "CORS Error"
Als je externe URL gebruikt:
- Zorg dat de server CORS headers heeft
- Of host het bestand lokaal

### "Te hard/zacht"
Pas volume aan in code:
```javascript
music.volume = 0.3;  // Pas aan naar wens
```

## Tips

1. **Korte intro**: Overweeg een 30-60 seconden loop voor minder herhaling
2. **Fade in/out**: Voeg CSS transitions toe voor smooth start/stop
3. **Playlist**: Roteer tussen verschillende tracks voor variatie
4. **Mute bij inactief**: Stop muziek als scoreboard niet zichtbaar is (✅ al geïmplementeerd)

## Licentie & Copyright

⚠️ **Let op:** De officiële "De Slimste Mens" muziek is auteursrechtelijk beschermd. 
- Voor privé/familie gebruik is dit meestal geen probleem
- Voor publieke of commerciële gebruik moet je toestemming vragen
- Overweeg alternatieve royalty-free muziek voor publiek gebruik

## Alternatieve Muziek Bronnen (Royalty-Free)

Als je geen copyright issues wilt:
- **YouTube Audio Library**: Gratis muziek
- **Incompetech**: Creative Commons muziek
- **Bensound**: Gratis tracks met attributie
- **Pixabay Music**: Gratis voor elk gebruik

Je kunt zoeken naar "quiz show music" of "game show theme" voor vergelijkbare stijl.
