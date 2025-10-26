// Main Application Logic
import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc,
    query,
    orderBy,
    onSnapshot,
    setDoc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Global State
let currentTeam = null;
let currentRound = null;
let currentQuestionIndex = 0;
let currentQuestions = [];
let teamSeconds = 60;
let completedRounds = [];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeTeamForm();
    initializeRoundSelection();
    initializeAdminPanel();
    loadScoreboard();
    initializeDefaultQuestions();
    
    // Check if team data exists in sessionStorage
    const savedTeam = sessionStorage.getItem('currentTeam');
    if (savedTeam) {
        currentTeam = JSON.parse(savedTeam);
        updateTeamDisplay();
    }
});

// Navigation
function initializeNavigation() {
    const navButtons = document.querySelectorAll('#mainNav button');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const viewId = button.getAttribute('data-view');
            showView(viewId);
        });
    });
}

function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
    
    if (viewId === 'scoreboardView') {
        loadScoreboard();
    }
}

// Team Registration
function initializeTeamForm() {
    const form = document.getElementById('teamForm');
    const addPlayerBtn = document.getElementById('addPlayerBtn');
    const playerInputs = document.getElementById('playerInputs');
    
    addPlayerBtn.addEventListener('click', () => {
        const currentInputs = playerInputs.querySelectorAll('.player-input');
        if (currentInputs.length < 4) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'player-input';
            input.placeholder = `Speler ${currentInputs.length + 1}`;
            playerInputs.appendChild(input);
        }
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const teamName = document.getElementById('teamName').value;
        const playerInputsList = playerInputs.querySelectorAll('.player-input');
        const players = Array.from(playerInputsList)
            .map(input => input.value.trim())
            .filter(name => name.length > 0);
        
        if (players.length === 0) {
            alert('Voeg minimaal 1 speler toe!');
            return;
        }
        
        // Create team object
        currentTeam = {
            name: teamName,
            players: players,
            seconds: 60,
            completedRounds: [],
            timestamp: new Date()
        };
        
        // Save to Firebase
        try {
            const docRef = await addDoc(collection(db, 'teams'), currentTeam);
            currentTeam.id = docRef.id;
            sessionStorage.setItem('currentTeam', JSON.stringify(currentTeam));
            
            updateTeamDisplay();
            showView('gameView');
        } catch (error) {
            console.error('Error adding team:', error);
            alert('Er ging iets mis bij het aanmelden. Probeer opnieuw.');
        }
    });
}

function updateTeamDisplay() {
    if (!currentTeam) return;
    
    document.getElementById('currentTeamName').textContent = currentTeam.name;
    document.getElementById('teamSeconds').textContent = currentTeam.seconds || 60;
    document.getElementById('playersList').textContent = currentTeam.players.join(', ');
    teamSeconds = currentTeam.seconds || 60;
    completedRounds = currentTeam.completedRounds || [];
    
    // Update completed rounds in UI
    updateCompletedRoundsUI();
}

function updateCompletedRoundsUI() {
    const roundButtons = document.querySelectorAll('.round-btn');
    roundButtons.forEach(btn => {
        const roundType = btn.getAttribute('data-round');
        if (completedRounds.includes(roundType)) {
            btn.classList.add('completed');
        }
    });
}

// Round Selection
function initializeRoundSelection() {
    const roundButtons = document.querySelectorAll('.round-btn');
    
    roundButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const roundType = button.getAttribute('data-round');
            await startRound(roundType);
        });
    });
    
    // Back buttons
    const backButtons = document.querySelectorAll('.btn-back');
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            returnToRoundSelection();
        });
    });
}

async function startRound(roundType) {
    currentRound = roundType;
    currentQuestionIndex = 0;
    
    // Hide round selection
    document.getElementById('roundSelection').classList.remove('active');
    
    // Load questions for this round
    await loadQuestionsForRound(roundType);
    
    // Show round content
    const roundContentMap = {
        'open-deur': 'openDeurRound',
        'puzzel': 'puzzelRound',
        'galerij': 'galerijnRound',
        'collectief-geheugen': 'collectiefRound'
    };
    
    const contentId = roundContentMap[roundType];
    if (contentId) {
        document.querySelectorAll('.round-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(contentId).classList.add('active');
        
        // Initialize round-specific logic
        initializeRoundLogic(roundType);
    }
}

function returnToRoundSelection() {
    document.querySelectorAll('.round-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('roundSelection').classList.add('active');
}

async function loadQuestionsForRound(roundType) {
    try {
        const q = query(collection(db, 'questions'), orderBy('timestamp', 'asc'));
        const querySnapshot = await getDocs(q);
        
        currentQuestions = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.type === roundType) {
                currentQuestions.push({ id: doc.id, ...data });
            }
        });
        
        if (currentQuestions.length === 0) {
            console.warn(`No questions found for round: ${roundType}`);
        }
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// Round-specific Logic
function initializeRoundLogic(roundType) {
    switch(roundType) {
        case 'open-deur':
            initializeOpenDeur();
            break;
        case 'puzzel':
            initializePuzzel();
            break;
        case 'galerij':
            initializeGalerij();
            break;
        case 'collectief-geheugen':
            initializeCollectiefGeheugen();
            break;
    }
}

// Open Deur Round
function initializeOpenDeur() {
    if (currentQuestions.length === 0) {
        document.getElementById('openDeurHints').innerHTML = '<p style="color: white;">Geen vragen beschikbaar voor deze ronde.</p>';
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    const hintsContainer = document.getElementById('openDeurHints');
    hintsContainer.innerHTML = '';
    
    // Show hints one by one
    let hintIndex = 0;
    const showNextHint = () => {
        if (hintIndex < question.hints.length) {
            const hintDiv = document.createElement('div');
            hintDiv.className = 'hint-item';
            hintDiv.textContent = question.hints[hintIndex];
            hintsContainer.appendChild(hintDiv);
            hintIndex++;
            
            if (hintIndex < question.hints.length) {
                setTimeout(showNextHint, 3000);
            }
        }
    };
    
    showNextHint();
    
    // Answer submission
    const submitBtn = document.getElementById('openDeurSubmit');
    const input = document.getElementById('openDeurInput');
    
    submitBtn.onclick = () => {
        const answer = input.value.trim().toLowerCase();
        const correctAnswer = question.answer.toLowerCase();
        
        if (answer === correctAnswer) {
            handleCorrectAnswer(15);
            input.value = '';
            currentQuestionIndex++;
            
            if (currentQuestionIndex < currentQuestions.length) {
                initializeOpenDeur();
            } else {
                completeRound();
            }
        } else {
            handleIncorrectAnswer();
            input.value = '';
        }
    };
    
    // Enter key support
    input.onkeypress = (e) => {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    };
}

// Puzzel Round
function initializePuzzel() {
    if (currentQuestions.length === 0) {
        document.getElementById('puzzelQuestion').innerHTML = '<p>Geen vragen beschikbaar voor deze ronde.</p>';
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    const questionDiv = document.getElementById('puzzelQuestion');
    const lettersDiv = document.getElementById('puzzelLetters');
    const answerDiv = document.getElementById('puzzelAnswer');
    
    questionDiv.textContent = question.question;
    
    // Scramble letters
    const letters = question.answer.toUpperCase().split('');
    const scrambled = [...letters].sort(() => Math.random() - 0.5);
    
    lettersDiv.innerHTML = '';
    let selectedLetters = [];
    
    scrambled.forEach((letter, index) => {
        const tile = document.createElement('div');
        tile.className = 'letter-tile';
        tile.textContent = letter;
        tile.dataset.index = index;
        tile.dataset.letter = letter;
        
        tile.addEventListener('click', () => {
            if (tile.classList.contains('selected')) {
                tile.classList.remove('selected');
                selectedLetters = selectedLetters.filter(l => l.index !== index);
            } else {
                tile.classList.add('selected');
                selectedLetters.push({ letter, index });
            }
            
            answerDiv.textContent = selectedLetters.map(l => l.letter).join('');
            
            // Check if answer is correct
            if (selectedLetters.length === letters.length) {
                const answer = selectedLetters.map(l => l.letter).join('');
                if (answer === question.answer.toUpperCase()) {
                    handleCorrectAnswer(20);
                    
                    setTimeout(() => {
                        currentQuestionIndex++;
                        if (currentQuestionIndex < currentQuestions.length) {
                            initializePuzzel();
                        } else {
                            completeRound();
                        }
                    }, 1000);
                } else {
                    handleIncorrectAnswer();
                    setTimeout(() => {
                        selectedLetters = [];
                        answerDiv.textContent = '';
                        lettersDiv.querySelectorAll('.letter-tile').forEach(t => {
                            t.classList.remove('selected');
                        });
                    }, 500);
                }
            }
        });
        
        lettersDiv.appendChild(tile);
    });
    
    answerDiv.textContent = '';
}

// Galerij Round
function initializeGalerij() {
    if (currentQuestions.length === 0) {
        document.getElementById('galerijnQuestion').innerHTML = '<p>Geen vragen beschikbaar voor deze ronde.</p>';
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    const imagesDiv = document.getElementById('galerijnImages');
    const questionDiv = document.getElementById('galerijnQuestion');
    const input = document.getElementById('galerijnInput');
    const submitBtn = document.getElementById('galerijnSubmit');
    
    // Display images (placeholder colors for now)
    imagesDiv.innerHTML = '';
    const colors = ['#FF6B35', '#004E89', '#FFD23F', '#00D084'];
    for (let i = 0; i < 4; i++) {
        const imgDiv = document.createElement('div');
        imgDiv.style.background = colors[i];
        imgDiv.style.width = '100%';
        imgDiv.style.aspectRatio = '1';
        imgDiv.style.borderRadius = '10px';
        imgDiv.style.display = 'flex';
        imgDiv.style.alignItems = 'center';
        imgDiv.style.justifyContent = 'center';
        imgDiv.style.color = 'white';
        imgDiv.style.fontWeight = 'bold';
        imgDiv.textContent = `Afbeelding ${i + 1}`;
        imagesDiv.appendChild(imgDiv);
    }
    
    questionDiv.textContent = question.question;
    
    submitBtn.onclick = () => {
        const answer = input.value.trim().toLowerCase();
        const correctAnswer = question.answer.toLowerCase();
        
        if (answer === correctAnswer) {
            handleCorrectAnswer(25);
            input.value = '';
            currentQuestionIndex++;
            
            if (currentQuestionIndex < currentQuestions.length) {
                initializeGalerij();
            } else {
                completeRound();
            }
        } else {
            handleIncorrectAnswer();
            input.value = '';
        }
    };
    
    input.onkeypress = (e) => {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    };
}

// Collectief Geheugen Round
function initializeCollectiefGeheugen() {
    if (currentQuestions.length === 0) {
        document.getElementById('collectiefCategory').innerHTML = '<p>Geen vragen beschikbaar voor deze ronde.</p>';
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    const categoryDiv = document.getElementById('collectiefCategory');
    const itemsDiv = document.getElementById('collectiefItems');
    const input = document.getElementById('collectiefInput');
    const submitBtn = document.getElementById('collectiefSubmit');
    
    categoryDiv.textContent = question.category;
    itemsDiv.innerHTML = '';
    
    let foundItems = [];
    let incorrectAttempts = 0;
    const maxIncorrect = 3;
    
    submitBtn.onclick = () => {
        const answer = input.value.trim().toLowerCase();
        const correctAnswers = question.answers.map(a => a.toLowerCase());
        
        if (foundItems.includes(answer)) {
            alert('Dit item is al gevonden!');
            input.value = '';
            return;
        }
        
        if (correctAnswers.includes(answer)) {
            foundItems.push(answer);
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'memory-item';
            itemDiv.textContent = input.value.trim();
            itemsDiv.appendChild(itemDiv);
            
            input.value = '';
            
            if (foundItems.length === correctAnswers.length) {
                handleCorrectAnswer(30);
                
                setTimeout(() => {
                    currentQuestionIndex++;
                    if (currentQuestionIndex < currentQuestions.length) {
                        initializeCollectiefGeheugen();
                    } else {
                        completeRound();
                    }
                }, 1000);
            } else {
                // Add seconds for each correct item
                updateTeamSeconds(3);
            }
        } else {
            incorrectAttempts++;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'memory-item incorrect';
            itemDiv.textContent = input.value.trim();
            itemsDiv.appendChild(itemDiv);
            
            setTimeout(() => itemDiv.remove(), 1000);
            
            input.value = '';
            
            if (incorrectAttempts >= maxIncorrect) {
                handleIncorrectAnswer();
                setTimeout(() => {
                    currentQuestionIndex++;
                    if (currentQuestionIndex < currentQuestions.length) {
                        initializeCollectiefGeheugen();
                    } else {
                        completeRound();
                    }
                }, 2000);
            }
        }
    };
    
    input.onkeypress = (e) => {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    };
}

// Answer Handling
function handleCorrectAnswer(secondsToAdd) {
    updateTeamSeconds(secondsToAdd);
    
    // Visual feedback
    const feedback = document.createElement('div');
    feedback.style.position = 'fixed';
    feedback.style.top = '50%';
    feedback.style.left = '50%';
    feedback.style.transform = 'translate(-50%, -50%)';
    feedback.style.background = '#00D084';
    feedback.style.color = 'white';
    feedback.style.padding = '30px 60px';
    feedback.style.borderRadius = '15px';
    feedback.style.fontSize = '2rem';
    feedback.style.fontWeight = 'bold';
    feedback.style.zIndex = '9999';
    feedback.textContent = `+${secondsToAdd} seconden!`;
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 1500);
}

function handleIncorrectAnswer() {
    updateTeamSeconds(-5);
    
    // Visual feedback
    const feedback = document.createElement('div');
    feedback.style.position = 'fixed';
    feedback.style.top = '50%';
    feedback.style.left = '50%';
    feedback.style.transform = 'translate(-50%, -50%)';
    feedback.style.background = '#FF4757';
    feedback.style.color = 'white';
    feedback.style.padding = '30px 60px';
    feedback.style.borderRadius = '15px';
    feedback.style.fontSize = '2rem';
    feedback.style.fontWeight = 'bold';
    feedback.style.zIndex = '9999';
    feedback.textContent = '-5 seconden!';
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 1500);
}

async function updateTeamSeconds(delta) {
    teamSeconds += delta;
    if (teamSeconds < 0) teamSeconds = 0;
    
    document.getElementById('teamSeconds').textContent = teamSeconds;
    
    if (currentTeam && currentTeam.id) {
        try {
            const teamRef = doc(db, 'teams', currentTeam.id);
            await updateDoc(teamRef, { seconds: teamSeconds });
            currentTeam.seconds = teamSeconds;
            sessionStorage.setItem('currentTeam', JSON.stringify(currentTeam));
        } catch (error) {
            console.error('Error updating team seconds:', error);
        }
    }
}

async function completeRound() {
    if (!completedRounds.includes(currentRound)) {
        completedRounds.push(currentRound);
        
        if (currentTeam && currentTeam.id) {
            try {
                const teamRef = doc(db, 'teams', currentTeam.id);
                await updateDoc(teamRef, { completedRounds: completedRounds });
                currentTeam.completedRounds = completedRounds;
                sessionStorage.setItem('currentTeam', JSON.stringify(currentTeam));
            } catch (error) {
                console.error('Error updating completed rounds:', error);
            }
        }
    }
    
    alert(`Ronde voltooid! Je hebt nu ${teamSeconds} seconden.`);
    returnToRoundSelection();
    updateCompletedRoundsUI();
}

// Scoreboard
async function loadScoreboard() {
    try {
        const querySnapshot = await getDocs(collection(db, 'teams'));
        const teams = [];
        
        querySnapshot.forEach(doc => {
            teams.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by seconds (descending)
        teams.sort((a, b) => (b.seconds || 0) - (a.seconds || 0));
        
        const scoreboardContent = document.getElementById('scoreboardContent');
        scoreboardContent.innerHTML = '';
        
        teams.forEach((team, index) => {
            const teamCard = document.createElement('div');
            teamCard.className = 'team-card';
            if (index === 0) teamCard.classList.add('winner');
            
            teamCard.innerHTML = `
                <h3>${team.name}</h3>
                <div class="score">${team.seconds || 60}</div>
                <div class="players">${team.players ? team.players.join(', ') : ''}</div>
                <div style="margin-top: 10px; opacity: 0.7;">
                    Rondes: ${team.completedRounds ? team.completedRounds.length : 0}/4
                </div>
            `;
            
            scoreboardContent.appendChild(teamCard);
        });
        
        if (teams.length === 0) {
            scoreboardContent.innerHTML = '<p style="text-align: center; font-size: 1.5rem;">Nog geen teams aangemeld!</p>';
        }
    } catch (error) {
        console.error('Error loading scoreboard:', error);
    }
}

// Admin Panel
function initializeAdminPanel() {
    // Tab switching
    const adminTabs = document.querySelectorAll('.admin-tab');
    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            adminTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.admin-content').forEach(content => {
                content.classList.remove('active');
            });
            
            if (tabName === 'questions') {
                document.getElementById('questionsTab').classList.add('active');
                loadQuestionsList();
            } else if (tabName === 'game') {
                document.getElementById('gameTab').classList.add('active');
                loadActiveTeams();
            }
        });
    });
    
    // Question type selection
    const questionType = document.getElementById('questionType');
    questionType.addEventListener('change', () => {
        renderQuestionFields(questionType.value);
    });
    
    // Initial render
    renderQuestionFields('open-deur');
    
    // Add question form
    const addQuestionForm = document.getElementById('addQuestionForm');
    addQuestionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await addQuestion();
    });
    
    // Reset game
    const resetGameBtn = document.getElementById('resetGameBtn');
    resetGameBtn.addEventListener('click', async () => {
        if (confirm('Weet je zeker dat je alle scores wilt resetten?')) {
            await resetGame();
        }
    });
}

function renderQuestionFields(type) {
    const fieldsContainer = document.getElementById('questionFields');
    fieldsContainer.innerHTML = '';
    
    switch(type) {
        case 'open-deur':
            fieldsContainer.innerHTML = `
                <div class="form-group">
                    <label>Hints (1 per regel)</label>
                    <textarea id="questionHints" rows="5" required placeholder="Hint 1&#10;Hint 2&#10;Hint 3"></textarea>
                </div>
                <div class="form-group">
                    <label>Antwoord</label>
                    <input type="text" id="questionAnswer" required>
                </div>
            `;
            break;
        case 'puzzel':
            fieldsContainer.innerHTML = `
                <div class="form-group">
                    <label>Vraag/Hint</label>
                    <input type="text" id="questionText" required>
                </div>
                <div class="form-group">
                    <label>Antwoord (woord om te puzzelen)</label>
                    <input type="text" id="questionAnswer" required>
                </div>
            `;
            break;
        case 'galerij':
            fieldsContainer.innerHTML = `
                <div class="form-group">
                    <label>Vraag</label>
                    <input type="text" id="questionText" required>
                </div>
                <div class="form-group">
                    <label>Antwoord</label>
                    <input type="text" id="questionAnswer" required>
                </div>
                <div class="form-group">
                    <label>Afbeeldingen (URLs, 1 per regel)</label>
                    <textarea id="questionImages" rows="4" placeholder="http://example.com/image1.jpg&#10;http://example.com/image2.jpg"></textarea>
                </div>
            `;
            break;
        case 'collectief-geheugen':
            fieldsContainer.innerHTML = `
                <div class="form-group">
                    <label>Categorie</label>
                    <input type="text" id="questionCategory" required placeholder="bijv. Nederlandse Provincies">
                </div>
                <div class="form-group">
                    <label>Antwoorden (1 per regel)</label>
                    <textarea id="questionAnswers" rows="8" required placeholder="Antwoord 1&#10;Antwoord 2&#10;Antwoord 3"></textarea>
                </div>
            `;
            break;
    }
}

async function addQuestion() {
    const type = document.getElementById('questionType').value;
    let questionData = { type, timestamp: new Date() };
    
    try {
        switch(type) {
            case 'open-deur':
                const hints = document.getElementById('questionHints').value.split('\n').filter(h => h.trim());
                questionData.hints = hints;
                questionData.answer = document.getElementById('questionAnswer').value.trim();
                break;
            case 'puzzel':
                questionData.question = document.getElementById('questionText').value.trim();
                questionData.answer = document.getElementById('questionAnswer').value.trim();
                break;
            case 'galerij':
                questionData.question = document.getElementById('questionText').value.trim();
                questionData.answer = document.getElementById('questionAnswer').value.trim();
                const images = document.getElementById('questionImages').value.split('\n').filter(i => i.trim());
                questionData.images = images;
                break;
            case 'collectief-geheugen':
                questionData.category = document.getElementById('questionCategory').value.trim();
                const answers = document.getElementById('questionAnswers').value.split('\n').filter(a => a.trim());
                questionData.answers = answers;
                break;
        }
        
        await addDoc(collection(db, 'questions'), questionData);
        alert('Vraag toegevoegd!');
        document.getElementById('addQuestionForm').reset();
        renderQuestionFields(type);
        loadQuestionsList();
    } catch (error) {
        console.error('Error adding question:', error);
        alert('Er ging iets mis bij het toevoegen van de vraag.');
    }
}

async function loadQuestionsList() {
    try {
        const querySnapshot = await getDocs(collection(db, 'questions'));
        const questionsList = document.getElementById('questionsList');
        questionsList.innerHTML = '<h3>Alle Vragen</h3>';
        
        if (querySnapshot.empty) {
            questionsList.innerHTML += '<p>Nog geen vragen toegevoegd.</p>';
            return;
        }
        
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            
            let content = '';
            switch(data.type) {
                case 'open-deur':
                    content = `Hints: ${data.hints ? data.hints.join(', ') : 'N/A'}<br>Antwoord: ${data.answer}`;
                    break;
                case 'puzzel':
                    content = `Vraag: ${data.question}<br>Antwoord: ${data.answer}`;
                    break;
                case 'galerij':
                    content = `Vraag: ${data.question}<br>Antwoord: ${data.answer}`;
                    break;
                case 'collectief-geheugen':
                    content = `Categorie: ${data.category}<br>Antwoorden: ${data.answers ? data.answers.join(', ') : 'N/A'}`;
                    break;
            }
            
            questionDiv.innerHTML = `
                <div class="question-type">${data.type}</div>
                <div class="question-content">${content}</div>
                <button class="btn-danger" onclick="deleteQuestion('${doc.id}')">Verwijderen</button>
            `;
            
            questionsList.appendChild(questionDiv);
        });
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

window.deleteQuestion = async function(questionId) {
    if (confirm('Weet je zeker dat je deze vraag wilt verwijderen?')) {
        try {
            await deleteDoc(doc(db, 'questions', questionId));
            loadQuestionsList();
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('Er ging iets mis bij het verwijderen.');
        }
    }
};

async function loadActiveTeams() {
    try {
        const querySnapshot = await getDocs(collection(db, 'teams'));
        const activeTeamsDiv = document.getElementById('activeTeams');
        activeTeamsDiv.innerHTML = '';
        
        if (querySnapshot.empty) {
            activeTeamsDiv.innerHTML = '<p>Nog geen actieve teams.</p>';
            return;
        }
        
        querySnapshot.forEach(doc => {
            const data = doc.data();
            const teamDiv = document.createElement('div');
            teamDiv.className = 'question-item';
            teamDiv.innerHTML = `
                <div class="question-type">${data.name}</div>
                <div class="question-content">
                    Spelers: ${data.players ? data.players.join(', ') : 'N/A'}<br>
                    Seconden: ${data.seconds || 60}<br>
                    Rondes voltooid: ${data.completedRounds ? data.completedRounds.length : 0}/4
                </div>
                <button class="btn-danger" onclick="deleteTeam('${doc.id}')">Verwijderen</button>
            `;
            activeTeamsDiv.appendChild(teamDiv);
        });
    } catch (error) {
        console.error('Error loading teams:', error);
    }
}

window.deleteTeam = async function(teamId) {
    if (confirm('Weet je zeker dat je dit team wilt verwijderen?')) {
        try {
            await deleteDoc(doc(db, 'teams', teamId));
            loadActiveTeams();
            loadScoreboard();
        } catch (error) {
            console.error('Error deleting team:', error);
            alert('Er ging iets mis bij het verwijderen.');
        }
    }
};

async function resetGame() {
    try {
        const querySnapshot = await getDocs(collection(db, 'teams'));
        const deletePromises = [];
        
        querySnapshot.forEach(doc => {
            deletePromises.push(deleteDoc(doc.ref));
        });
        
        await Promise.all(deletePromises);
        
        // Clear session storage
        sessionStorage.removeItem('currentTeam');
        currentTeam = null;
        
        alert('Alle teams en scores zijn gereset!');
        loadActiveTeams();
        loadScoreboard();
        showView('loginView');
    } catch (error) {
        console.error('Error resetting game:', error);
        alert('Er ging iets mis bij het resetten.');
    }
}

// Initialize default questions if database is empty
async function initializeDefaultQuestions() {
    try {
        const querySnapshot = await getDocs(collection(db, 'questions'));
        
        if (querySnapshot.empty) {
            console.log('Initializing default questions...');
            await addDefaultQuestions();
        }
    } catch (error) {
        console.error('Error checking questions:', error);
    }
}

async function addDefaultQuestions() {
    const defaultQuestions = [
        // Open Deur vragen
        {
            type: 'open-deur',
            hints: [
                'Dit land ligt in Europa',
                'Het staat bekend om zijn kaas en klompen',
                'De hoofdstad is Amsterdam',
                'Oranje is de nationale kleur'
            ],
            answer: 'Nederland',
            timestamp: new Date()
        },
        {
            type: 'open-deur',
            hints: [
                'Dit is een dier',
                'Het heeft zwart-witte strepen',
                'Het lijkt op een paard',
                'Het leeft in Afrika'
            ],
            answer: 'Zebra',
            timestamp: new Date()
        },
        {
            type: 'open-deur',
            hints: [
                'Dit is een vrucht',
                'Het groeit aan bomen',
                'Het is vaak rood of groen',
                'De dokter blijft ermee weg'
            ],
            answer: 'Appel',
            timestamp: new Date()
        },
        {
            type: 'open-deur',
            hints: [
                'Dit is een gebouw',
                'Het staat in Parijs',
                'Het is gemaakt van ijzer',
                'Het is 330 meter hoog'
            ],
            answer: 'Eiffeltoren',
            timestamp: new Date()
        },
        {
            type: 'open-deur',
            hints: [
                'Dit is een planeet',
                'Het is de grootste in ons zonnestelsel',
                'Het heeft een grote rode vlek',
                'Het is vernoemd naar een Romeinse god'
            ],
            answer: 'Jupiter',
            timestamp: new Date()
        },
        
        // Puzzel vragen
        {
            type: 'puzzel',
            question: 'Hoofdstad van Frankrijk',
            answer: 'PARIJS',
            timestamp: new Date()
        },
        {
            type: 'puzzel',
            question: 'Grootste oceaan ter wereld',
            answer: 'PACIFIC',
            timestamp: new Date()
        },
        {
            type: 'puzzel',
            question: 'Kleur van een banaan',
            answer: 'GEEL',
            timestamp: new Date()
        },
        {
            type: 'puzzel',
            question: 'Dier dat eieren legt en kan vliegen',
            answer: 'VOGEL',
            timestamp: new Date()
        },
        {
            type: 'puzzel',
            question: 'Seizoen na de herfst',
            answer: 'WINTER',
            timestamp: new Date()
        },
        {
            type: 'puzzel',
            question: 'Instrument met 88 toetsen',
            answer: 'PIANO',
            timestamp: new Date()
        },
        
        // Galerij vragen
        {
            type: 'galerij',
            question: 'Wat is de gemeenschappelijke link tussen deze afbeeldingen?',
            answer: 'Kleuren',
            images: [],
            timestamp: new Date()
        },
        {
            type: 'galerij',
            question: 'Welk thema verbindt deze beelden?',
            answer: 'Natuur',
            images: [],
            timestamp: new Date()
        },
        {
            type: 'galerij',
            question: 'Wat hebben deze afbeeldingen gemeen?',
            answer: 'Transport',
            images: [],
            timestamp: new Date()
        },
        {
            type: 'galerij',
            question: 'Welke categorie past bij deze afbeeldingen?',
            answer: 'Dieren',
            images: [],
            timestamp: new Date()
        },
        
        // Collectief Geheugen vragen
        {
            type: 'collectief-geheugen',
            category: 'Nederlandse Provincies',
            answers: ['Noord-Holland', 'Zuid-Holland', 'Utrecht', 'Gelderland', 'Overijssel', 'Flevoland', 'Friesland', 'Groningen', 'Drenthe', 'Zeeland', 'Noord-Brabant', 'Limburg'],
            timestamp: new Date()
        },
        {
            type: 'collectief-geheugen',
            category: 'Europese Hoofdsteden',
            answers: ['Amsterdam', 'Berlijn', 'Parijs', 'Londen', 'Rome', 'Madrid', 'Brussel', 'Wenen', 'Praag', 'Stockholm', 'Oslo', 'Kopenhagen'],
            timestamp: new Date()
        },
        {
            type: 'collectief-geheugen',
            category: 'Dagen van de Week',
            answers: ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'],
            timestamp: new Date()
        },
        {
            type: 'collectief-geheugen',
            category: 'Kleuren van de Regenboog',
            answers: ['Rood', 'Oranje', 'Geel', 'Groen', 'Blauw', 'Indigo', 'Violet'],
            timestamp: new Date()
        },
        {
            type: 'collectief-geheugen',
            category: 'Continenten',
            answers: ['Afrika', 'Antarctica', 'Azië', 'Europa', 'Noord-Amerika', 'Oceanië', 'Zuid-Amerika'],
            timestamp: new Date()
        },
        {
            type: 'collectief-geheugen',
            category: 'Planeten in ons Zonnestelsel',
            answers: ['Mercurius', 'Venus', 'Aarde', 'Mars', 'Jupiter', 'Saturnus', 'Uranus', 'Neptunus'],
            timestamp: new Date()
        }
    ];
    
    try {
        const addPromises = defaultQuestions.map(q => addDoc(collection(db, 'questions'), q));
        await Promise.all(addPromises);
        console.log('Default questions added successfully!');
    } catch (error) {
        console.error('Error adding default questions:', error);
    }
}
