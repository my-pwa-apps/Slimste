# De Puzzel - 3 op een rij

## Overzicht
De klassieke puzzel uit De Slimste Mens! Teams krijgen een raster van 3x4 (12 hokjes) te zien met hints. Elk groep van 4 hints wijst naar één woord. Het doel is om de 3 woorden te vinden.

## Spelregels

### Opzet
- **12 hokjes** in een raster van 3 rijen x 4 kolommen
- **3 woorden** moeten gevonden worden
- **4 hints per woord** (12 hints in totaal)
- Alle hints worden **door elkaar** getoond

### Spelverloop
1. Alle 12 hints verschijnen tegelijk in het raster
2. Teams moeten ontdekken welke 4 hints bij elkaar horen
3. Die 4 hints wijzen samen naar 1 woord
4. Herhaal dit voor de andere 2 woorden
5. Vul de 3 woorden in (in willekeurige volgorde)

### Scoring
- **+5 seconden** per correct gevonden woord
- **+25 seconden** als alle 3 woorden correct zijn
- **-5 seconden** per fout antwoord
- Geen tijdslimiet (werk in je eigen tempo)

### Visuele Feedback
- ✅ **Groen**: Antwoord correct - hints worden groen
- ❌ **Rood**: Antwoord fout - probeer opnieuw
- **Kleuren per woord**: Geel, Oranje, Groen voor de 3 gevonden woorden

## Voorbeeld Puzzel

### Raster (door elkaar):
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│    App      │   Berichten │   Chatten   │  Groen logo │
├─────────────┼─────────────┼─────────────┼─────────────┤
│   Video     │     Kort    │    Dans     │   Trends    │
├─────────────┼─────────────┼─────────────┼─────────────┤
│   Game      │   Blokjes   │   Bouwen    │   Creeper   │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Oplossing:
**Woord 1**: WhatsApp (App, Berichten, Chatten, Groen logo)  
**Woord 2**: TikTok (Video, Kort, Dans, Trends)  
**Woord 3**: Minecraft (Game, Blokjes, Bouwen, Creeper)

## Vraag Structuur in Database

```javascript
{
    type: 'puzzel',
    clues1: ['App', 'Berichten', 'Chatten', 'Groen logo'],
    answer1: 'WhatsApp',
    clues2: ['Video', 'Kort', 'Dans', 'Trends'],
    answer2: 'TikTok',
    clues3: ['Game', 'Blokjes', 'Bouwen', 'Creeper'],
    answer3: 'Minecraft',
    timestamp: Date.now()
}
```

## Vragen Toevoegen via Admin

1. Ga naar **Admin → Vragen Beheren**
2. Selecteer **"De Puzzel (3 op een rij)"**
3. Voor elk van de 3 woorden:
   - Vul 4 hints in (1 per regel)
   - Vul het antwoord in
4. Klik op **"Vraag Toevoegen"**

### Tips voor Goede Hints
- **Varieer moeilijkheid**: Van breed naar specifiek
- **Vermijd overlap**: Zorg dat hints niet voor meerdere woorden kunnen gelden
- **Denk aan de doelgroep**: Mix voor alle leeftijden
- **Test het**: Zijn 4 hints genoeg om het woord te raden?

## Standaard Puzzels

### Voor Jongeren
**Puzzel 1**: WhatsApp, TikTok, Minecraft  
**Puzzel 2**: Spotify, Instagram, YouTube

### Voor Ouders
**Puzzel 1**: Borsato, Friends, Harry (Potter)  
**Puzzel 2**: Netflix, TheVoice, Anouk

### Voor Opa en Oma
**Puzzel 1**: Juliana, Gulden, Alberti  
**Puzzel 2**: Bevrijdingsdag, Koningsdag, Sinterklaas

### Voor Iedereen
**Puzzel 1**: Amsterdam, Utrecht, Rotterdam  
**Puzzel 2**: Hond, Kat, Vogel

## Technische Details

### HTML Structuur
- `#puzzelGrid`: 3x4 grid met alle hints
- `#puzzelAnswer1/2/3`: Input velden voor de 3 woorden
- `.btn-check`: Bevestig knoppen per antwoord

### CSS Classes
- `.puzzle-grid`: Grid container (4 kolommen)
- `.puzzle-cell`: Individuele hint cel
- `.puzzle-cell.found-1/2/3`: Gevonden hints per woord
- `.puzzle-answer-input.correct`: Correct ingevuld antwoord

### JavaScript Functie
```javascript
initializePuzzel()
- Laadt vraag uit database
- Shuffelt alle 12 hints door elkaar
- Toont hints in random volgorde
- Check antwoorden individueel
- Highlight gevonden hints met kleur
- Award punten per correct woord
```

## Verschillen met "De Woordzoeker"

| Puzzel (3 op een rij) | Woordzoeker |
|----------------------|-------------|
| 12 hints in raster | 1 vraag/hint |
| 3 woorden vinden | 1 woord vinden |
| Hints door elkaar | Letters door elkaar |
| Type antwoord in | Klik letters aan |
| +25 seconden | +15 seconden |
| Complexer | Eenvoudiger |

## Tips voor Teams
1. **Scan alle hints**: Lees eerst alle 12 hints
2. **Zoek patronen**: Welke 4 horen bij elkaar?
3. **Start met het makkelijkste**: Vind eerst het woord dat je zeker weet
4. **Elimineer**: Als je 1 woord hebt, weet je welke 8 hints overblijven
5. **Overleg**: Verschillende teamleden zien verschillende verbanden

## Browser Compatibiliteit
✅ Chrome/Edge (volledig ondersteund)  
✅ Firefox (volledig ondersteund)  
✅ Safari (volledig ondersteund)  
✅ Mobile browsers (responsive grid)

Grid past automatisch aan op kleinere schermen (3x4 → 2x6 → kleinere cellen).
