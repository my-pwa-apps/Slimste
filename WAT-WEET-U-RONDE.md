# Wat Weet U Over... Ronde

## Wijziging
De **Galerij** ronde is vervangen door de klassieke **"Wat Weet U Over..."** ronde uit De Slimste Mens.

## Hoe Werkt Het?

### Spelverloop
1. **Onderwerp wordt getoond**: bijv. "Wat Weet U Over: Amsterdam"
2. **60 seconden timer**: Start automatisch wanneer de ronde begint
3. **Feiten noemen**: Teams moeten zoveel mogelijk feiten noemen over het onderwerp
4. **Punten verdienen**: 
   - 3 seconden per correct feit
   - 10 seconden bonus als alle feiten gevonden zijn binnen de tijd
5. **Timer waarschuwing**: Laatste 10 seconden wordt de timer rood met animatie

### Scoring
- **Per correct feit**: +3 seconden
- **Alle feiten gevonden**: +10 bonus seconden (bovenop de feiten)
- **Foute antwoorden**: Worden kort getoond en verdwijnen weer

### Visuele Feedback
- ✅ **Correcte antwoorden**: Groen met het volledige feit
- ❌ **Foute antwoorden**: Rood, verdwijnt na 1,5 seconden
- ⚠️ **Al genoemd**: Oranje melding "Al genoemd!"

## Vraag Structuur

### In de Database
```javascript
{
    type: 'wat-weet-u',
    subject: 'Amsterdam',
    facts: [
        'Hoofdstad van Nederland',
        'Veel grachten',
        'Het Rijksmuseum',
        'Anne Frank Huis',
        'Dam en Koninklijk Paleis',
        'Fietsen overal',
        'Grachtengordel is UNESCO',
        'Schiphol vliegveld'
    ],
    timestamp: Date.now()
}
```

### Vragen Toevoegen via Admin Panel
1. Ga naar Admin → Vragen Beheren
2. Selecteer "Wat Weet U Over..."
3. Vul het onderwerp in
4. Voeg feiten toe (1 per regel)
5. Klik op "Vraag Toevoegen"

## Standaard Vragen

### Voor Jongeren (12-20 jaar)
- **Minecraft**: Blokjesspel, Creepers, Redstone, etc.
- **Instagram**: Social media, Stories, Reels, Filters, etc.

### Voor Ouders (30-50 jaar)
- **Friends**: Sitcom, Central Perk, Ross & Rachel, etc.
- **Marco Borsato**: Nederlandse zanger, Dromen zijn bedrog, etc.

### Voor Opa en Oma (60-85 jaar)
- **Koningin Juliana**: Nederlandse koningin, 1948-1980, etc.
- **De Gulden**: Oude munt, voor de Euro, fl, etc.

### Voor Iedereen
- **Amsterdam**: Hoofdstad, grachten, musea, etc.
- **Sinterklaas**: 5 december, uit Spanje, pepernoten, etc.

## Technische Details

### Fuzzy Matching
De ronde gebruikt "fuzzy matching" voor antwoorden:
- Als een antwoord het feit bevat, of het feit het antwoord bevat, wordt het als correct gerekend
- Bijvoorbeeld: "grachten" match met "Veel grachten"
- Of: "Hoofdstad" match met "Hoofdstad van Nederland"

### Timer Implementatie
- 60 seconden countdown
- Laatste 10 seconden: rode achtergrond met pulse animatie
- Automatisch stoppen bij 0 seconden
- Alle resterende feiten worden getoond (half transparant)

### UI Elementen
- **Subject Display**: Grote oranje banner bovenaan
- **Timer**: Ronde cirkel rechtsboven, wordt rood bij waarschuwing
- **Answers Container**: Toont alle ingevoerde antwoorden met kleurcodering
- **Score Display**: Toont "Score: X / Y" onder het antwoordveld

## Tips voor Spelers
1. **Denk breed**: Denk aan geschiedenis, geografie, cultuur, kenmerken
2. **Wees specifiek**: Probeer concrete feiten te noemen
3. **Let op de tijd**: Laatste 10 seconden ga je niet alles vinden
4. **Werk samen**: Elk teamlid kan andere feiten weten
5. **Geen zorgen bij fouten**: Foute antwoorden verdwijnen gewoon

## Technische Bestanden Aangepast
- `index.html`: Nieuwe round HTML structuur
- `css/styles.css`: WWU styling met timer en antwoord animaties  
- `js/app.js`: Volledige WWU logica met timer en scoring
- Alle "galerij" vervangen door "wat-weet-u"

## Browser Compatibiliteit
✅ Chrome/Edge  
✅ Firefox  
✅ Safari  
✅ Mobile browsers

Alles werkt met moderne JavaScript (ES6+) en CSS3 animaties.
