# Instructies voor Het Hosten van De Slimste Meijers

## Optie 1: Lokaal Testen (Eenvoudigste Methode)

### Met Python (Als je Python hebt):
1. Open PowerShell in de projectmap
2. Run: `python -m http.server 8000`
3. Open browser: `http://localhost:8000`

### Met Node.js (Als je Node hebt):
1. Installeer http-server: `npm install -g http-server`
2. Run: `http-server -p 8000`
3. Open browser: `http://localhost:8000`

### Met PHP (Als je PHP hebt):
1. Open PowerShell in de projectmap
2. Run: `php -S localhost:8000`
3. Open browser: `http://localhost:8000`

## Optie 2: Gratis Online Hosting

### Firebase Hosting (Aanbevolen - Werkt samen met Firebase Database)

1. **Installeer Firebase CLI:**
   ```powershell
   npm install -g firebase-tools
   ```

2. **Login bij Firebase:**
   ```powershell
   firebase login
   ```

3. **Initialiseer Firebase in je project:**
   ```powershell
   cd "c:\Users\bartm\OneDrive - Microsoft\Documents\Git Repos\Slimste"
   firebase init hosting
   ```
   - Selecteer je bestaande project: "de-slimste-meijers"
   - Public directory: `.` (huidige directory)
   - Single-page app: `No`
   - Overschrijf index.html: `No`

4. **Deploy:**
   ```powershell
   firebase deploy --only hosting
   ```

5. Je site is nu live op: `https://de-slimste-meijers.web.app`

### Netlify (Heel Eenvoudig)

1. Ga naar [netlify.com](https://www.netlify.com)
2. Maak een gratis account
3. Sleep de hele "Slimste" folder naar Netlify
4. Klaar! Je krijgt een URL zoals: `https://slimste-meijers.netlify.app`

### Vercel (Ook Heel Eenvoudig)

1. Ga naar [vercel.com](https://vercel.com)
2. Maak een gratis account
3. Importeer je project
4. Deploy - Klaar!

## Optie 3: Voor Meerdere Gebruikers op Lokaal Netwerk

Als iedereen op hetzelfde WiFi netwerk zit:

1. Start een lokale server (zie Optie 1)
2. Vind je lokale IP adres:
   ```powershell
   ipconfig
   ```
   Zoek naar "IPv4 Address" (bijv. 192.168.1.100)

3. Andere gebruikers kunnen nu toegang krijgen via:
   `http://192.168.1.100:8000` (vervang met jouw IP)

## Aanbeveling voor Familie Event

**Beste setup voor jullie evenement:**

1. **Host online via Firebase Hosting** (gratis, betrouwbaar, snel)
   - Iedereen kan toegang krijgen via hun telefoon/tablet
   - Werkt ook buiten jullie WiFi netwerk
   - Automatisch SSL (https)

2. **Display Setup:**
   - TV/Beamer met browser: Open het Scorebord view
   - Of gebruik een laptop aangesloten op TV
   - Zet de browser in fullscreen (F11)

3. **Admin Device:**
   - 1 persoon (spelleider) heeft toegang tot Admin panel
   - Voor het toevoegen van extra vragen of resetten van het spel

4. **Speler Devices:**
   - Elke familie/team logt in op hun eigen telefoon/tablet
   - Ze kunnen tegelijk spelen en vragen beantwoorden

## Troubleshooting

### CORS Errors bij lokaal testen?
- Gebruik een van de server opties hierboven
- Open NIET direct het HTML bestand (file://)

### Firebase niet werkend?
- Check of de Firebase configuratie correct is in `js/firebase-config.js`
- Check of Firestore database is geactiveerd in Firebase Console

### Vragen worden niet geladen?
- Check browser console voor errors (F12)
- Wacht 10 seconden na eerste laden (default vragen worden toegevoegd)
- Voeg handmatig vragen toe via Admin panel

## Tips

- Test alles vooraf!
- Zorg dat iedereen dezelfde WiFi gebruikt voor beste prestaties
- Heb een backup plan (extra vragen klaar in Admin panel)
- Stel een "spelleider" aan om het spel te beheren

## Hulp Nodig?

Check de browser console (F12) voor foutmeldingen.
De meeste problemen zijn terug te leiden naar:
1. Geen internet verbinding
2. Firebase configuratie niet correct
3. Browser te oud (gebruik Chrome/Firefox/Safari/Edge - actuele versies)
