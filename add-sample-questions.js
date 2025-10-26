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
            answer: 'hond',
            options: ['hond', 'kat', 'konijn', 'paard']
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
            answer: 'nederland',
            options: ['nederland', 'belgië', 'duitsland', 'frankrijk']
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
            answer: 'banaan',
            options: ['banaan', 'appel', 'sinaasappel', 'peer']
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
            answer: 'fiets',
            options: ['fiets', 'auto', 'scooter', 'motor']
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
            answer: 'zomer',
            options: ['zomer', 'winter', 'lente', 'herfst']
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
            answer: 'huis',
            options: ['huis', 'school', 'winkel', 'kantoor']
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
            answer: 'rood',
            options: ['rood', 'blauw', 'groen', 'geel']
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
            answer: 'dokter',
            options: ['dokter', 'verpleger', 'tandarts', 'apotheker']
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
            answer: 'hand',
            options: ['hand', 'voet', 'arm', 'been']
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
            answer: 'pinguïn',
            options: ['pinguïn', 'papegaai', 'struisvogel', 'kiwi']
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
            answer: 'piano',
            options: ['piano', 'gitaar', 'viool', 'drums']
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
            answer: 'ontbijt',
            options: ['ontbijt', 'lunch', 'diner', 'avondeten']
        },

        // PUZZEL (6 vragen - enough for 90min mode)
        {
            type: 'puzzel',
            answer1: 'koe',
            answer2: 'vogel',
            answer3: 'vis',
            wordOptions: ['koe', 'vogel', 'vis', 'paard', 'hond', 'kat', 'slang', 'muis', 'konijn']
        },
        {
            type: 'puzzel',
            answer1: 'aardbei',
            answer2: 'citroen',
            answer3: 'sinaasappel',
            wordOptions: ['aardbei', 'citroen', 'sinaasappel', 'appel', 'banaan', 'peer', 'druif', 'kiwi', 'mango']
        },
        {
            type: 'puzzel',
            answer1: 'schoenen',
            answer2: 'hoed',
            answer3: 'sjaal',
            wordOptions: ['schoenen', 'hoed', 'sjaal', 'broek', 'shirt', 'jas', 'handschoenen', 'sokken', 'riem']
        },
        {
            type: 'puzzel',
            answer1: 'auto',
            answer2: 'vliegtuig',
            answer3: 'trein',
            wordOptions: ['auto', 'vliegtuig', 'trein', 'fiets', 'boot', 'bus', 'tram', 'metro', 'taxi']
        },
        {
            type: 'puzzel',
            answer1: 'koelkast',
            answer2: 'fornuis',
            answer3: 'waterkoker',
            wordOptions: ['koelkast', 'fornuis', 'waterkoker', 'oven', 'magnetron', 'blender', 'mixer', 'broodrooster', 'vaatwasser']
        },
        {
            type: 'puzzel',
            answer1: 'voetbal',
            answer2: 'tennis',
            answer3: 'waterpolo',
            wordOptions: ['voetbal', 'tennis', 'waterpolo', 'hockey', 'basketbal', 'volleybal', 'badminton', 'rugby', 'cricket']
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
                'Het Rijksmuseum staat hier'
            ],
            factOptions: [
                'Het is de hoofdstad van Nederland',
                'Het heeft meer dan 100 kilometers aan grachten',
                'De stad heeft meer fietsen dan inwoners',
                'Het Anne Frank Huis is hier gevestigd',
                'Het Rijksmuseum staat hier',
                'Het ligt in België',
                'Het is de grootste stad van Europa',
                'Er wonen 10 miljoen mensen',
                'Het heeft geen grachten',
                'Het is gebouwd in 2000'
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
                'Het wordt gebakken in een hete oven'
            ],
            factOptions: [
                'Het komt oorspronkelijk uit Italië',
                'De basis is een plat brooddeeg',
                'Margherita is een klassieke variant',
                'Het wordt vaak belegd met kaas',
                'Het wordt gebakken in een hete oven',
                'Het komt uit China',
                'Het wordt altijd rauw gegeten',
                'Het is een soort soep',
                'Het bevat nooit kaas',
                'Het wordt gekookt in water'
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
                'Het bestaat hoofdzakelijk uit waterstof'
            ],
            factOptions: [
                'Het is een ster',
                'Het is het middelpunt van ons zonnestelsel',
                'Het geeft licht en warmte',
                'De aarde draait eromheen',
                'Het bestaat hoofdzakelijk uit waterstof',
                'Het is een planeet',
                'Het draait om de aarde',
                'Het bestaat uit steen',
                'Het geeft geen warmte',
                'Het is de kleinste ster'
            ]
        },
        {
            type: 'wat-weet-u',
            subject: 'Voetbal',
            facts: [
                'Het is de populairste sport ter wereld',
                'Een team heeft 11 spelers',
                'Het WK wordt om de 4 jaar gehouden',
                'Je mag de bal niet met je handen aanraken',
                'Een wedstrijd duurt 90 minuten'
            ],
            factOptions: [
                'Het is de populairste sport ter wereld',
                'Een team heeft 11 spelers',
                'Het WK wordt om de 4 jaar gehouden',
                'Je mag de bal niet met je handen aanraken',
                'Een wedstrijd duurt 90 minuten',
                'Een team heeft 5 spelers',
                'Het WK is elk jaar',
                'Je moet de bal met je handen spelen',
                'Een wedstrijd duurt 2 uur',
                'Het is alleen in Nederland populair'
            ]
        },
        {
            type: 'wat-weet-u',
            subject: 'Water',
            facts: [
                'Het is essentieel voor leven',
                'Het bestaat uit H2O moleculen',
                'Het bevriest bij 0 graden Celsius',
                'Het kookt bij 100 graden Celsius',
                '70% van de aarde is bedekt met water'
            ],
            factOptions: [
                'Het is essentieel voor leven',
                'Het bestaat uit H2O moleculen',
                'Het bevriest bij 0 graden Celsius',
                'Het kookt bij 100 graden Celsius',
                '70% van de aarde is bedekt met water',
                'Het is giftig voor mensen',
                'Het bestaat uit CO2',
                'Het bevriest bij 50 graden',
                'Het kookt bij 10 graden',
                'De aarde heeft geen water'
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
                'Het is milieuvriendelijk vervoer'
            ],
            factOptions: [
                'Het heeft twee wielen',
                'Je moet trappen om vooruit te komen',
                'Het heeft een stuur en zadel',
                'Nederlanders gebruiken het veel',
                'Het is milieuvriendelijk vervoer',
                'Het heeft vier wielen',
                'Het rijdt op benzine',
                'Het heeft geen stuur',
                'Niemand gebruikt een fiets',
                'Het vervuilt de lucht'
            ]
        },

        // COLLECTIEF GEHEUGEN (9 categorieën - enough for 90min mode)
        {
            type: 'collectief-geheugen',
            category: 'Nederlandse steden',
            answers: [
                'Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven',
                'Groningen', 'Tilburg', 'Almere', 'Breda', 'Nijmegen'
            ],
            itemOptions: [
                'Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven',
                'Groningen', 'Tilburg', 'Almere', 'Breda', 'Nijmegen',
                'Parijs', 'Berlijn', 'Londen', 'Brussel', 'Antwerpen'
            ]
        },
        {
            type: 'collectief-geheugen',
            category: 'Kleuren van de regenboog',
            answers: [
                'Rood', 'Oranje', 'Geel', 'Groen', 'Blauw', 'Indigo', 'Violet'
            ],
            itemOptions: [
                'Rood', 'Oranje', 'Geel', 'Groen', 'Blauw', 'Indigo', 'Violet',
                'Wit', 'Zwart', 'Roze', 'Bruin', 'Grijs'
            ]
        },
        {
            type: 'collectief-geheugen',
            category: 'Maanden van het jaar',
            answers: [
                'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
                'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
            ],
            itemOptions: [
                'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
                'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December',
                'Maandag', 'Dinsdag', 'Woensdag'
            ]
        },
        {
            type: 'collectief-geheugen',
            category: 'Europese landen',
            answers: [
                'Nederland', 'België', 'Duitsland', 'Frankrijk', 'Spanje',
                'Italië', 'Griekenland', 'Portugal', 'Zweden', 'Noorwegen'
            ],
            itemOptions: [
                'Nederland', 'België', 'Duitsland', 'Frankrijk', 'Spanje',
                'Italië', 'Griekenland', 'Portugal', 'Zweden', 'Noorwegen',
                'Amerika', 'China', 'Japan', 'Australië', 'Canada'
            ]
        },
        {
            type: 'collectief-geheugen',
            category: 'Disney films',
            answers: [
                'De Leeuwenkoning', 'Frozen', 'Aladdin', 'Mulan', 'Pocahontas',
                'Assepoester', 'Sneeuwwitje', 'Bambi', 'Dumbo', 'Pinokkio'
            ],
            itemOptions: [
                'De Leeuwenkoning', 'Frozen', 'Aladdin', 'Mulan', 'Pocahontas',
                'Assepoester', 'Sneeuwwitje', 'Bambi', 'Dumbo', 'Pinokkio',
                'Harry Potter', 'Star Wars', 'Lord of the Rings', 'Titanic', 'Avatar'
            ]
        },
        {
            type: 'collectief-geheugen',
            category: 'Dieren met vier poten',
            answers: [
                'Hond', 'Kat', 'Paard', 'Koe', 'Varken', 'Schaap', 'Geit',
                'Leeuw', 'Tijger', 'Olifant'
            ],
            itemOptions: [
                'Hond', 'Kat', 'Paard', 'Koe', 'Varken', 'Schaap', 'Geit',
                'Leeuw', 'Tijger', 'Olifant',
                'Slang', 'Vogel', 'Vis', 'Octopus', 'Spin'
            ]
        },
        {
            type: 'collectief-geheugen',
            category: 'Groenten',
            answers: [
                'Wortel', 'Tomaat', 'Komkommer', 'Paprika', 'Sla', 'Ui',
                'Aardappel', 'Broccoli', 'Bloemkool', 'Prei'
            ],
            itemOptions: [
                'Wortel', 'Tomaat', 'Komkommer', 'Paprika', 'Sla', 'Ui',
                'Aardappel', 'Broccoli', 'Bloemkool', 'Prei',
                'Appel', 'Banaan', 'Kip', 'Vis', 'Brood'
            ]
        },
        {
            type: 'collectief-geheugen',
            category: 'Muziekinstrumenten',
            answers: [
                'Piano', 'Gitaar', 'Viool', 'Drums', 'Fluit', 'Trompet',
                'Saxofoon', 'Trombone', 'Klarinet', 'Harp'
            ],
            itemOptions: [
                'Piano', 'Gitaar', 'Viool', 'Drums', 'Fluit', 'Trompet',
                'Saxofoon', 'Trombone', 'Klarinet', 'Harp',
                'Tafel', 'Stoel', 'Auto', 'Telefoon', 'Computer'
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
