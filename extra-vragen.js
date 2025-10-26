// Extra vragen voor De Slimste Meijers
// Deze kunnen via het Admin panel worden toegevoegd

const extraVragen = {
    openDeur: [
        {
            hints: [
                'Dit is een land in Azië',
                'Het heeft de grootste bevolking ter wereld',
                'De hoofdstad is Beijing',
                'De Grote Muur is hier gebouwd'
            ],
            answer: 'China'
        },
        {
            hints: [
                'Dit is een beroemde schilder',
                'Hij kwam uit Nederland',
                'Hij sneed zijn eigen oor af',
                'Hij schilderde Zonnebloemen'
            ],
            answer: 'Van Gogh'
        },
        {
            hints: [
                'Dit is een sport',
                'Het wordt gespeeld met een bal',
                'Je mag de bal niet met je handen aanraken',
                'Het WK wordt elke 4 jaar gehouden'
            ],
            answer: 'Voetbal'
        },
        {
            hints: [
                'Dit is een element',
                'Het is essentieel voor het leven',
                'Het maakt 21% van de atmosfeer uit',
                'We ademen het in'
            ],
            answer: 'Zuurstof'
        },
        {
            hints: [
                'Dit is een muziekinstrument',
                'Het heeft snaren',
                'Het wordt vaak gebruikt in rockmuziek',
                'Jimi Hendrix was er beroemd mee'
            ],
            answer: 'Gitaar'
        },
        {
            hints: [
                'Dit is een Nederlandse traditie',
                'Het gebeurt op 5 december',
                'Een man op een wit paard',
                'Hij komt uit Spanje'
            ],
            answer: 'Sinterklaas'
        },
        {
            hints: [
                'Dit is een lichaamsdeel',
                'Het pompt bloed',
                'Het klopt ongeveer 100.000 keer per dag',
                'Symboliseert liefde'
            ],
            answer: 'Hart'
        },
        {
            hints: [
                'Dit is een historische periode',
                'Het duurde van 1939 tot 1945',
                'Het grootste conflict in de geschiedenis',
                'Het eindigde met atoombommen'
            ],
            answer: 'Wereldoorlog'
        }
    ],
    
    puzzel: [
        {
            question: 'Grootste zoogdier ter wereld',
            answer: 'WALVIS'
        },
        {
            question: 'Hoofdstad van Italië',
            answer: 'ROME'
        },
        {
            question: 'Koudste seizoen van het jaar',
            answer: 'WINTER'
        },
        {
            question: 'Geel fruit dat apen lekker vinden',
            answer: 'BANAAN'
        },
        {
            question: 'Dag waarop we niet werken in het weekend',
            answer: 'ZONDAG'
        },
        {
            question: 'Nederlands woord voor computer muis',
            answer: 'MUIS'
        },
        {
            question: 'Water in vaste vorm',
            answer: 'IJS'
        },
        {
            question: 'Koning der dieren',
            answer: 'LEEUW'
        },
        {
            question: 'Nederlandse kaasstad',
            answer: 'GOUDA'
        },
        {
            question: 'Vaartuig op het water',
            answer: 'BOOT'
        }
    ],
    
    galerij: [
        {
            question: 'Welke muziekstijl verbindt deze artiesten?',
            answer: 'Rock'
        },
        {
            question: 'Welke historische periode tonen deze beelden?',
            answer: 'Middeleeuwen'
        },
        {
            question: 'Welk land wordt hier getoond?',
            answer: 'Japan'
        },
        {
            question: 'Welke beroepen zie je hier?',
            answer: 'Brandweer'
        },
        {
            question: 'Welk seizoen wordt hier afgebeeld?',
            answer: 'Herfst'
        },
        {
            question: 'Welke sport is dit?',
            answer: 'Tennis'
        }
    ],
    
    collectiefGeheugen: [
        {
            category: 'Maanden van het Jaar',
            answers: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December']
        },
        {
            category: 'Nederlandse Voetbalclubs',
            answers: ['Ajax', 'PSV', 'Feyenoord', 'AZ', 'FC Utrecht', 'FC Twente', 'Vitesse', 'FC Groningen', 'Heerenveen', 'Willem II']
        },
        {
            category: 'Harry Potter Boeken',
            answers: ['De Steen der Wijzen', 'De Geheime Kamer', 'De Gevangene van Azkaban', 'De Vuurbeker', 'De Orde van de Feniks', 'De Halfbloed Prins', 'De Relieken van de Dood']
        },
        {
            category: 'Sneeuwwitje Dwergen',
            answers: ['Doc', 'Grumpy', 'Happy', 'Sleepy', 'Bashful', 'Sneezy', 'Dopey']
        },
        {
            category: 'Europese Landen',
            answers: ['Nederland', 'België', 'Duitsland', 'Frankrijk', 'Spanje', 'Italië', 'Verenigd Koninkrijk', 'Polen', 'Zweden', 'Noorwegen', 'Denemarken', 'Finland', 'Portugal', 'Griekenland', 'Oostenrijk', 'Zwitserland']
        },
        {
            category: 'Wereldzeeen en Oceanen',
            answers: ['Stille Oceaan', 'Atlantische Oceaan', 'Indische Oceaan', 'Noordelijke IJszee', 'Zuidelijke Oceaan', 'Middellandse Zee', 'Caribische Zee', 'Noordzee']
        },
        {
            category: 'Disney Prinsessen',
            answers: ['Sneeuwwitje', 'Assepoester', 'Aurora', 'Ariel', 'Belle', 'Jasmine', 'Pocahontas', 'Mulan', 'Tiana', 'Rapunzel', 'Merida', 'Elsa', 'Anna', 'Moana']
        },
        {
            category: 'Nederlandse Rivieren',
            answers: ['Rijn', 'Maas', 'Waal', 'IJssel', 'Lek', 'Amstel', 'Vecht', 'Dommel']
        },
        {
            category: 'Chemische Elementen',
            answers: ['Waterstof', 'Helium', 'Koolstof', 'Stikstof', 'Zuurstof', 'Ijzer', 'Goud', 'Zilver', 'Koper', 'Zwavel']
        },
        {
            category: 'Muziekinstrumenten',
            answers: ['Piano', 'Gitaar', 'Viool', 'Drums', 'Saxofoon', 'Trompet', 'Fluit', 'Cello', 'Harp', 'Klarinet']
        }
    ]
};

// Instructies voor het toevoegen van deze vragen:
// 1. Ga naar de Admin pagina
// 2. Selecteer het vraagtype
// 3. Vul de velden in volgens de voorbeelden hierboven
// 4. Klik op "Vraag Toevoegen"

console.log('Extra vragen beschikbaar:', {
    'Open Deur': extraVragen.openDeur.length,
    'Puzzel': extraVragen.puzzel.length,
    'Galerij': extraVragen.galerij.length,
    'Collectief Geheugen': extraVragen.collectiefGeheugen.length,
    'Totaal': extraVragen.openDeur.length + extraVragen.puzzel.length + 
              extraVragen.galerij.length + extraVragen.collectiefGeheugen.length
});
