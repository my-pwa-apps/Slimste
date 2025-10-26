// Sample Questions for De Slimste Quiz Game
// Copy and paste this entire file into the browser console when logged in as admin

async function addSampleQuestions() {
    console.log('Starting to add sample questions...');
    
    const sampleQuestions = [
        // OPEN DEUR (12 questions - enough for 90min mode)
        {
            type: 'open-deur',
            hints: [
                'Het is een dier',
                'Het heeft vier poten',
                'Het kan blaffen',
                'Mensen houden het vaak als huisdier',
                'Het is de beste vriend van de mens'
            ],
            answer: 'hond'
        },
        {
            type: 'open-deur',
            hints: [
                'Het is een land',
                'Het ligt in Europa',
                'De hoofdstad is Amsterdam',
                'Het staat bekend om tulpen',
                'Het heeft veel windmolens'
            ],
            answer: 'nederland'
        },
        {
            type: 'open-deur',
            hints: [
                'Het is een fruit',
                'Het is geel',
                'Het groeit in trossen',
                'Apen eten het graag',
                'Je moet het pellen voor je het eet'
            ],
            answer: 'banaan'
        },
        {
            type: 'open-deur',
            hints: [
                'Het is een voertuig',
                'Het heeft twee wielen',
                'Je moet trappen om vooruit te komen',
                'Het heeft een stuur en een zadel',
                'Nederlanders gebruiken het veel'
            ],
            answer: 'fiets'
        },
        {
            type: 'open-deur',
            hints: [
                'Het is een seizoen',
                'Het komt na de lente',
                'Het is de warmste tijd van het jaar',
                'Veel mensen gaan dan op vakantie',
                'School is dan vaak dicht'
            ],
            answer: 'zomer'
        },
        {
            type: 'open-deur',
            hints: [
                'Het is een gebouw',
                'Mensen wonen erin',
                'Het heeft kamers en deuren',
                'Het heeft een dak',
                'Je gaat er slapen'
            ],
            answer: 'huis'
        },
        {
            type: 'open-deur',
            hints: [
                'Het is een kleur',
                'Het staat voor gevaar',
                'Bloedcellen hebben deze kleur',
                'Stoplichten hebben deze kleur',
                'Rozen kunnen deze kleur hebben'
            ],
            answer: 'rood'
        },
        {
            type: 'open-deur',
            hints: [
                'Het is een beroep',
                'Deze persoon helpt zieke mensen',
                'Werkt vaak in een ziekenhuis',
                'Draagt vaak een witte jas',
                'Schrijft recepten voor'
            ],
            answer: 'dokter'
        },
        {
            type: 'open-deur',
            hints: [
                'Het is een lichaamsdeel',
                'Je hebt er twee van',
                'Ze zitten aan je armen',
                'Je gebruikt ze om te grijpen',
                'Hebben vijf vingers'
            ],
            answer: 'hand'
        },
        {
            type: 'open-deur',
            hints: [
                'Het is een vogel',
                'Het kan niet vliegen',
                'Leeft in Antarctica',
                'Zwart-wit gekleurd',
                'Wadelt als het loopt'
            ],
            answer: 'pinguïn'
        },
        {
            type: 'open-deur',
            hints: [
                'Het is een instrument',
                'Het heeft toetsen',
                'Zwart en wit',
                'Maakt muziek',
                'Staat vaak in een concertzaal'
            ],
            answer: 'piano'
        },
        {
            type: 'open-deur',
            hints: [
                'Het is een maaltijd',
                'Je eet het in de ochtend',
                'Vaak met brood of ontbijtgranen',
                'Eerste maaltijd van de dag',
                'Soms met eieren'
            ],
            answer: 'ontbijt'
        },

        // PUZZEL (6 vragen - enough for 90min mode)
        {
            type: 'puzzel',
            clues1: ['Heeft vier poten', 'Geeft melk', 'Eet gras', 'Zegt "moo"'],
            answer1: 'koe',
            clues2: ['Vliegt in de lucht', 'Heeft vleugels', 'Legt eieren', 'Heeft een snavel'],
            answer2: 'vogel',
            clues3: ['Leeft in water', 'Heeft kieuwen', 'Zwemt met vinnen', 'Kan niet praten'],
            answer3: 'vis'
        },
        {
            type: 'puzzel',
            clues1: ['Rood fruit', 'Klein', 'Groeit laag bij grond', 'Zoet'],
            answer1: 'aardbei',
            clues2: ['Geel fruit', 'Zuur', 'Maakt limonade', 'Ovaal van vorm'],
            answer2: 'citroen',
            clues3: ['Oranje fruit', 'Rond', 'Moet je pellen', 'Vol vitamine C'],
            answer3: 'sinaasappel'
        },
        {
            type: 'puzzel',
            clues1: ['Je draagt het', 'Op je voeten', 'Beschermt tegen regen', 'Komt in paren'],
            answer1: 'schoenen',
            clues2: ['Je draagt het', 'Op je hoofd', 'Houdt je warm', 'Beschermt tegen zon'],
            answer2: 'hoed',
            clues3: ['Je draagt het', 'Om je nek', 'Houdt warm', 'Lang stuk stof'],
            answer3: 'sjaal'
        },
        {
            type: 'puzzel',
            clues1: ['Heeft wielen', 'Rijdt op straat', 'Vervoert mensen', 'Heeft een motor'],
            answer1: 'auto',
            clues2: ['Heeft wielen', 'Vliegt in lucht', 'Vervoert mensen', 'Landt op vliegveld'],
            answer2: 'vliegtuig',
            clues3: ['Heeft wielen', 'Rijdt op rails', 'Vervoert veel mensen', 'Heeft wagons'],
            answer3: 'trein'
        },
        {
            type: 'puzzel',
            clues1: ['In de keuken', 'Koud apparaat', 'Bewaart eten', 'Houdt vers'],
            answer1: 'koelkast',
            clues2: ['In de keuken', 'Verhit apparaat', 'Bakt eten', 'Heeft pitten'],
            answer2: 'fornuis',
            clues3: ['In de keuken', 'Verhit vloeistof', 'Maakt thee', 'Fluit soms'],
            answer3: 'waterkoker'
        },
        {
            type: 'puzzel',
            clues1: ['Sport', 'Met bal', 'Op veld', 'Met doelen'],
            answer1: 'voetbal',
            clues2: ['Sport', 'Met bal', 'Op baan', 'Over net'],
            answer2: 'tennis',
            clues3: ['Sport', 'Met bal', 'In zwembad', 'Met doelen'],
            answer3: 'waterpolo'
        },

        // WOORDZOEKER (12 vragen - enough for 90min mode)
        {
            type: 'woordzoeker',
            question: 'Hoofdstad van Frankrijk',
            answer: 'parijs'
        },
        {
            type: 'woordzoeker',
            question: 'Grootste planeet in ons zonnestelsel',
            answer: 'jupiter'
        },
        {
            type: 'woordzoeker',
            question: 'Kleur die je krijgt als je rood en blauw mengt',
            answer: 'paars'
        },
        {
            type: 'woordzoeker',
            question: 'Dier dat bekend staat om zijn lange nek',
            answer: 'giraffe'
        },
        {
            type: 'woordzoeker',
            question: 'Maand waarin Kerst wordt gevierd',
            answer: 'december'
        },
        {
            type: 'woordzoeker',
            question: 'Continent waar Nederland ligt',
            answer: 'europa'
        },
        {
            type: 'woordzoeker',
            question: 'Dier dat honing maakt',
            answer: 'bij'
        },
        {
            type: 'woordzoeker',
            question: 'Hoofdstad van Italië',
            answer: 'rome'
        },
        {
            type: 'woordzoeker',
            question: 'Metaal dat magnetisch is',
            answer: 'ijzer'
        },
        {
            type: 'woordzoeker',
            question: 'Grootste land ter wereld',
            answer: 'rusland'
        },
        {
            type: 'woordzoeker',
            question: 'Dier dat een bult heeft',
            answer: 'kameel'
        },
        {
            type: 'woordzoeker',
            question: 'Instrument met snaren dat je bespeelt met een strijkstok',
            answer: 'viool'
        },

        // WAT WEET U OVER (6 onderwerpen - enough for 90min mode)
        {
            type: 'wat-weet-u',
            subject: 'Amsterdam',
            facts: [
                'Het is de hoofdstad van Nederland',
                'Het heeft meer dan 100 kilometers aan grachten',
                'De stad heeft meer fietsen dan inwoners',
                'Het Anne Frank Huis is hier gevestigd',
                'Het Rijksmuseum staat hier',
                'Het wordt ook wel "Mokum" genoemd',
                'Schiphol is de luchthaven van deze stad'
            ]
        },
        {
            type: 'wat-weet-u',
            subject: 'Pizza',
            facts: [
                'Het komt oorspronkelijk uit Italië',
                'De basis is een plat brooddeeg',
                'Margherita is een klassieke variant',
                'Het wordt vaak belegd met kaas',
                'Tomaat wordt vaak als saus gebruikt',
                'Het wordt gebakken in een hete oven',
                'Napels wordt gezien als de bakermat'
            ]
        },
        {
            type: 'wat-weet-u',
            subject: 'De Zon',
            facts: [
                'Het is een ster',
                'Het is het middelpunt van ons zonnestelsel',
                'Het geeft licht en warmte',
                'De aarde draait eromheen',
                'Het is ongeveer 150 miljoen km van de aarde',
                'Het bestaat hoofdzakelijk uit waterstof',
                'Een zonnedag duurt ongeveer 8 minuten om de aarde te bereiken'
            ]
        },
        {
            type: 'wat-weet-u',
            subject: 'Voetbal',
            facts: [
                'Het is de populairste sport ter wereld',
                'Een team heeft 11 spelers',
                'Het WK wordt om de 4 jaar gehouden',
                'Je mag de bal niet met je handen aanraken (behalve keeper)',
                'Een wedstrijd duurt 90 minuten',
                'Het doel is om de bal in het doel te krijgen',
                'De scheidsrechter fluit bij overtredingen'
            ]
        },
        {
            type: 'wat-weet-u',
            subject: 'Water',
            facts: [
                'Het is essentieel voor leven',
                'Het bestaat uit H2O moleculen',
                'Het heeft drie fases: vast, vloeibaar en gas',
                'Het bevriest bij 0 graden Celsius',
                'Het kookt bij 100 graden Celsius',
                '70% van de aarde is bedekt met water',
                'De mens bestaat voor ongeveer 60% uit water'
            ]
        },
        {
            type: 'wat-weet-u',
            subject: 'Fiets',
            facts: [
                'Het heeft twee wielen',
                'Je moet trappen om vooruit te komen',
                'Het heeft een stuur en zadel',
                'Nederlanders gebruiken het veel',
                'Het is milieuvriendelijk vervoer',
                'Je kunt er een bel op hebben',
                'Het heeft vaak verlichting'
            ]
        },

        // COLLECTIEF GEHEUGEN (9 categorieën - enough for 90min mode)
        {
            type: 'collectief-geheugen',
            category: 'Nederlandse steden',
            answers: [
                'Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven',
                'Groningen', 'Tilburg', 'Almere', 'Breda', 'Nijmegen',
                'Apeldoorn', 'Haarlem', 'Arnhem', 'Enschede', 'Amersfoort'
            ]
        },
        {
            type: 'collectief-geheugen',
            category: 'Kleuren van de regenboog',
            answers: [
                'Rood', 'Oranje', 'Geel', 'Groen', 'Blauw', 'Indigo', 'Violet'
            ]
        },
        {
            type: 'collectief-geheugen',
            category: 'Maanden van het jaar',
            answers: [
                'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
                'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
            ]
        },
        {
            type: 'collectief-geheugen',
            category: 'Europese landen',
            answers: [
                'Nederland', 'België', 'Duitsland', 'Frankrijk', 'Spanje',
                'Italië', 'Griekenland', 'Portugal', 'Zweden', 'Noorwegen',
                'Denemarken', 'Polen', 'Oostenrijk', 'Zwitserland', 'Ierland'
            ]
        },
        {
            type: 'collectief-geheugen',
            category: 'Disney films',
            answers: [
                'De Leeuwenkoning', 'Frozen', 'Aladdin', 'Mulan', 'Pocahontas',
                'Assepoester', 'Sneeuwwitje', 'Bambi', 'Dumbo', 'Pinokkio',
                'Peter Pan', 'Jungle Book', 'Aristokatten', 'Robin Hood', 'Tarzan'
            ]
        },
        {
            type: 'collectief-geheugen',
            category: 'Dieren met vier poten',
            answers: [
                'Hond', 'Kat', 'Paard', 'Koe', 'Varken', 'Schaap', 'Geit',
                'Leeuw', 'Tijger', 'Olifant', 'Nijlpaard', 'Neushoorn',
                'Zebra', 'Giraf', 'Aap'
            ]
        },
        {
            type: 'collectief-geheugen',
            category: 'Groenten',
            answers: [
                'Wortel', 'Tomaat', 'Komkommer', 'Paprika', 'Sla', 'Ui',
                'Aardappel', 'Broccoli', 'Bloemkool', 'Prei', 'Courgette',
                'Aubergine', 'Spinazie', 'Andijvie', 'Knoflook'
            ]
        },
        {
            type: 'collectief-geheugen',
            category: 'Muziekinstrumenten',
            answers: [
                'Piano', 'Gitaar', 'Viool', 'Drums', 'Fluit', 'Trompet',
                'Saxofoon', 'Trombone', 'Klarinet', 'Harp', 'Cello',
                'Accordeon', 'Xylofoon', 'Mondharmonica', 'Triangel'
            ]
        },
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const question of sampleQuestions) {
        try {
            const questionData = {
                ...question,
                timestamp: Date.now()
            };
            
            // Use the modular Firebase API that's used in app.js
            const { ref, push, set } = window.firebaseModules;
            const questionsRef = ref(db, 'questions');
            const newQuestionRef = push(questionsRef);
            await set(newQuestionRef, questionData);
            
            successCount++;
            console.log(`✅ Added ${question.type} question`);
        } catch (error) {
            errorCount++;
            console.error(`❌ Error adding question:`, error);
        }
    }

    console.log(`\n🎉 Done! Added ${successCount} questions successfully.`);
    if (errorCount > 0) {
        console.log(`⚠️ ${errorCount} questions failed to add.`);
    }
    
    return {
        success: successCount,
        errors: errorCount,
        total: sampleQuestions.length
    };
}

// Run the function
console.log('📝 Sample questions ready to add!');
console.log('Run: addSampleQuestions()');
