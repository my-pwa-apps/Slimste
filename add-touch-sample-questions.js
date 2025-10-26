// Touch-Friendly Sample Questions for De Slimste Quiz Game
// Copy and paste this entire file into the browser console when logged in as admin

async function addTouchSampleQuestions() {
    console.log('Starting to add touch-friendly sample questions...');
    
    const sampleQuestions = [
        // OPEN DEUR (with 4 multiple choice options)
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
            options: ['hond', 'kat', 'paard', 'konijn']
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
            options: ['fiets', 'auto', 'motor', 'step']
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
            options: ['zomer', 'winter', 'herfst', 'lente']
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

        // PUZZEL (3 op een rij - with 9 word options including 3 correct + 6 wrong)
        {
            type: 'puzzel',
            answer1: 'Nederland',
            answer2: 'België',
            answer3: 'Frankrijk',
            wordOptions: ['Nederland', 'België', 'Frankrijk', 'Duitsland', 'Italië', 'Spanje', 'Amerika', 'Engeland', 'Portugal']
        },
        {
            type: 'puzzel',
            answer1: 'Fiets',
            answer2: 'Auto',
            answer3: 'Trein',
            wordOptions: ['Fiets', 'Auto', 'Trein', 'Vliegtuig', 'Boot', 'Paard', 'Skateboard', 'Helicopter', 'Scooter']
        },
        {
            type: 'puzzel',
            answer1: 'Zomer',
            answer2: 'Herfst',
            answer3: 'Winter',
            wordOptions: ['Zomer', 'Herfst', 'Winter', 'Lente', 'Maandag', 'Januari', 'Pasen', 'Kerstmis', 'Vakantie']
        },
        {
            type: 'puzzel',
            answer1: 'Hond',
            answer2: 'Kat',
            answer3: 'Konijn',
            wordOptions: ['Hond', 'Kat', 'Konijn', 'Paard', 'Koe', 'Schaap', 'Leeuw', 'Tijger', 'Olifant']
        },

        // WOORDZOEKER (unchanged - already touch-friendly)
        {
            type: 'woordzoeker',
            question: 'De hoofdstad van Nederland',
            answer: 'AMSTERDAM'
        },
        {
            type: 'woordzoeker',
            question: 'Het grootste dier ter wereld',
            answer: 'WALVIS'
        },
        {
            type: 'woordzoeker',
            question: 'De kleur van de zon',
            answer: 'GEEL'
        },
        {
            type: 'woordzoeker',
            question: 'Het tegenovergestelde van dag',
            answer: 'NACHT'
        },
        {
            type: 'woordzoeker',
            question: 'Een populaire sport met een bal',
            answer: 'VOETBAL'
        },

        // WAT WEET U OVER (with factOptions - correct facts + wrong facts)
        {
            type: 'wat-weet-u',
            subject: 'De Fiets',
            facts: [
                'Heeft twee wielen',
                'Heeft een stuur',
                'Heeft een zadel',
                'Je trapt de pedalen',
                'Heeft een bel'
            ],
            factOptions: [
                'Heeft twee wielen',
                'Heeft een stuur',
                'Heeft een zadel',
                'Je trapt de pedalen',
                'Heeft een bel',
                'Heeft een motor',
                'Vliegt door de lucht',
                'Heeft vier wielen',
                'Vaart op water',
                'Heeft een dak'
            ]
        },
        {
            type: 'wat-weet-u',
            subject: 'De Zon',
            facts: [
                'Is een ster',
                'Geeft licht',
                'Geeft warmte',
                'Staat in het centrum van ons zonnestelsel',
                'Is geel/oranje van kleur'
            ],
            factOptions: [
                'Is een ster',
                'Geeft licht',
                'Geeft warmte',
                'Staat in het centrum van ons zonnestelsel',
                'Is geel/oranje van kleur',
                'Is een planeet',
                'Is koud',
                'Geeft regen',
                'Staat op aarde',
                'Is blauw'
            ]
        },
        {
            type: 'wat-weet-u',
            subject: 'Nederland',
            facts: [
                'Hoofdstad is Amsterdam',
                'Ligt in Europa',
                'Heeft windmolens',
                'Beroemd om tulpen',
                'Heeft koning Willem-Alexander'
            ],
            factOptions: [
                'Hoofdstad is Amsterdam',
                'Ligt in Europa',
                'Heeft windmolens',
                'Beroemd om tulpen',
                'Heeft koning Willem-Alexander',
                'Ligt in Afrika',
                'Hoofdstad is Parijs',
                'Heeft een woestijn',
                'Is heel groot',
                'Ligt aan de evenaar'
            ]
        },

        // COLLECTIEF GEHEUGEN (with itemOptions - correct items + wrong items)
        {
            type: 'collectief-geheugen',
            category: 'Kleuren van de Regenboog',
            answers: ['rood', 'oranje', 'geel', 'groen', 'blauw', 'indigo', 'violet'],
            itemOptions: ['rood', 'oranje', 'geel', 'groen', 'blauw', 'indigo', 'violet', 'wit', 'zwart', 'bruin', 'roze', 'grijs']
        },
        {
            type: 'collectief-geheugen',
            category: 'Dagen van de Week',
            answers: ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'],
            itemOptions: ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag', 'januari', 'februari', 'weekend', 'werkdag', 'feestdag']
        },
        {
            type: 'collectief-geheugen',
            category: 'Seizoenen',
            answers: ['lente', 'zomer', 'herfst', 'winter'],
            itemOptions: ['lente', 'zomer', 'herfst', 'winter', 'maandag', 'januari', 'vakantie', 'pasen', 'kerst', 'sinterklaas']
        }
    ];

    const { getDatabase, ref, push, set } = window.firebaseModules;
    const database = getDatabase();
    
    let addedCount = 0;
    let errorCount = 0;
    
    for (const question of sampleQuestions) {
        try {
            const questionsRef = ref(database, 'questions');
            const newQuestionRef = push(questionsRef);
            await set(newQuestionRef, question);
            addedCount++;
            console.log(`✓ Added ${question.type} question`);
        } catch (error) {
            errorCount++;
            console.error(`✗ Failed to add ${question.type} question:`, error);
        }
    }
    
    console.log(`\n✅ Finished! Added ${addedCount} questions, ${errorCount} errors`);
    console.log('Reload the page to see the new questions!');
}

// Auto-run the function
addTouchSampleQuestions();
