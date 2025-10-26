// Main Application Logic - Using Firebase Realtime Database
import { db } from './firebase-config.js';
import { 
    ref,
    set,
    get,
    update,
    remove,
    push,
    onValue,
    query,
    orderByChild,
    child
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Expose Firebase modules to window for console scripts
window.db = db;
window.firebaseModules = { ref, set, push, get, update, remove, onValue };

// Helper function for flexible answer matching
function normalizeText(text) {
    if (!text) return '';
    
    return text
        .toLowerCase()
        .trim()
        // Remove all punctuation and special characters
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?]/g, '')
        // Normalize special characters (accents, umlauts, etc.)
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ñ]/g, 'n')
        .replace(/[ç]/g, 'c')
        .replace(/[ý]/g, 'y')
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        .trim();
}

// Calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

// Check if answers match with tolerance for typos
function answersMatch(userAnswer, correctAnswer, allowTypos = true) {
    const normalized1 = normalizeText(userAnswer);
    const normalized2 = normalizeText(correctAnswer);
    
    // Exact match after normalization
    if (normalized1 === normalized2) {
        return true;
    }
    
    // If typos are allowed, use Levenshtein distance
    if (allowTypos && normalized2.length > 3) {
        const distance = levenshteinDistance(normalized1, normalized2);
        // Allow 1 typo for words up to 8 chars, 2 typos for longer words
        const maxDistance = normalized2.length <= 8 ? 1 : 2;
        return distance <= maxDistance;
    }
    
    return false;
}

// Global State
let currentTeam = null;
let currentRound = null;
let currentQuestionIndex = 0;
let currentQuestions = [];
let teamSeconds = 60;
let completedRounds = [];
let hintTimeouts = []; // Track active hint timeouts
let scoreboardListener = null; // Track scoreboard listener for cleanup
let previousLeader = null; // Track previous leader for change detection
let gameMode = null; // Track selected game mode
let gameModeListener = null; // Track game mode listener
let readyTeamsListener = null; // Track ready teams listener
let roundStartTime = null; // Track when round started for time-based scoring
let isAdminLoggedIn = false; // Track admin login status
let familyName = ''; // Track family name
let roundTimeoutId = null; // Track round timeout for cleanup
let roundTimeLeft = 0; // Track remaining time for current round

// Game mode configurations
const GAME_MODES = {
    test: {
        name: 'Test Modus',
        duration: '~5 minuten',
        icon: '⚡',
        roundTimeLimit: 180, // 3 minutes per round
        questionsPerRound: {
            'open-deur': 2,
            'puzzel': 1,
            'woordzoeker': 2,
            'wat-weet-u': 1,
            'collectief-geheugen': 1
        }
    },
    short: {
        name: 'Kort Spel',
        duration: '~30 minuten',
        icon: '⏱️',
        roundTimeLimit: 360, // 6 minutes per round
        questionsPerRound: {
            'open-deur': 5,
            'puzzel': 2,
            'woordzoeker': 5,
            'wat-weet-u': 2,
            'collectief-geheugen': 3
        }
    },
    normal: {
        name: 'Normaal Spel',
        duration: '~60 minuten',
        icon: '🎯',
        roundTimeLimit: 600, // 10 minutes per round
        questionsPerRound: {
            'open-deur': 8,
            'puzzel': 4,
            'woordzoeker': 8,
            'wat-weet-u': 4,
            'collectief-geheugen': 6
        }
    },
    long: {
        name: 'Lang Spel',
        duration: '~90 minuten',
        icon: '🏆',
        roundTimeLimit: 900, // 15 minutes per round
        questionsPerRound: {
            'open-deur': 12,
            'puzzel': 6,
            'woordzoeker': 12,
            'wat-weet-u': 6,
            'collectief-geheugen': 9
        }
    }
};

// Initialize default admin password
async function initializeDefaultPassword() {
    try {
        const passwordSnapshot = await get(ref(db, 'gameState/adminPassword'));
        if (!passwordSnapshot.exists()) {
            // Don't set a default password - let admin set it on first login
            console.log('No admin password found - first time setup required');
            return false; // Indicates first time setup
        }
        return true; // Password exists
    } catch (error) {
        console.error('Error checking admin password:', error);
        return false;
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    // Show loading indicator
    showLoadingMessage();
    
    // Initialize default password first (just check, don't set)
    await initializeDefaultPassword();
    
    initializeNavigation();
    initializeAdminLogin();
    initializeAdminPanel();
    initializeTeamForm();
    initializeRoundSelection();
    loadScoreboard();
    initializeDefaultQuestions();
    listenToGameMode();
    
    // Check if settings are configured
    await checkIfConfigured();
    
    // Check if admin is logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        isAdminLoggedIn = true;
    }
    
    // Check if team data exists in sessionStorage
    const savedTeam = sessionStorage.getItem('currentTeam');
    if (savedTeam) {
        currentTeam = JSON.parse(savedTeam);
        await updateTeamDisplay();
    }
    
    // Hide loading after 2 seconds
    setTimeout(hideLoadingMessage, 2000);
});

function showLoadingMessage() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingMessage';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 78, 137, 0.95);
        color: white;
        padding: 30px 50px;
        border-radius: 15px;
        font-size: 1.2rem;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    `;
    loadingDiv.innerHTML = `
        <div style="font-size: 2rem; margin-bottom: 15px;">🔥</div>
        <div>Laden...</div>
        <div style="font-size: 0.9rem; margin-top: 10px; opacity: 0.8;">Verbinden met database</div>
    `;
    document.body.appendChild(loadingDiv);
}

function hideLoadingMessage() {
    const loadingDiv = document.getElementById('loadingMessage');
    if (loadingDiv) {
        loadingDiv.style.transition = 'opacity 0.5s ease';
        loadingDiv.style.opacity = '0';
        setTimeout(() => loadingDiv.remove(), 500);
    }
}

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
    // Block access to admin view if not logged in
    if (viewId === 'adminView') {
        const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
        if (!adminLoggedIn) {
            showNotification('❌ Je moet eerst inloggen als admin!', 'error');
            showView('adminLoginView');
            return;
        }
    }
    
    // Update admin login UI when showing admin login view
    if (viewId === 'adminLoginView') {
        updateAdminLoginUI();
    }
    
    // Block access to scoreboard view if not logged in as admin
    if (viewId === 'scoreboardView') {
        const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
        if (!adminLoggedIn) {
            showNotification('❌ Je moet eerst inloggen als admin om het scorebord te bekijken!', 'error');
            showView('adminLoginView');
            return;
        }
    }
    
    // Block access to game view if game hasn't started or no team is logged in
    if (viewId === 'gameView') {
        if (!currentTeam || !currentTeam.id) {
            showNotification('❌ Je moet eerst inloggen als team!', 'error');
            showView('loginView');
            return;
        }
        
        // Check if game has been started by admin
        get(ref(db, 'gameState/gameStarted')).then(snapshot => {
            if (!snapshot.exists() || !snapshot.val()) {
                showNotification('❌ Het spel is nog niet gestart door de admin!', 'error');
                showView('lobbyView');
                return;
            }
        });
    }
    
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
    
    if (viewId === 'scoreboardView') {
        loadScoreboard();
        initializeScoreboardMusic();
    } else {
        // Stop music when leaving scoreboard
        stopScoreboardMusic();
    }
}

// Admin Login
function initializeAdminLogin() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    
    if (!adminLoginForm) return;
    
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = document.getElementById('adminLoginPassword').value.trim();
        const confirmPassword = document.getElementById('adminConfirmPassword').value.trim();
        
        try {
            // Check if this is first time setup
            const passwordSnapshot = await get(ref(db, 'gameState/adminPassword'));
            const isFirstTime = !passwordSnapshot.exists();
            
            if (isFirstTime) {
                // First time setup - create new password
                if (!confirmPassword) {
                    showNotification('❌ Bevestig je wachtwoord!', 'error');
                    return;
                }
                
                if (password !== confirmPassword) {
                    showNotification('❌ Wachtwoorden komen niet overeen!', 'error');
                    return;
                }
                
                if (password.length < 4) {
                    showNotification('❌ Wachtwoord moet minimaal 4 tekens zijn!', 'error');
                    return;
                }
                
                // Save new password
                await set(ref(db, 'gameState/adminPassword'), password);
                isAdminLoggedIn = true;
                sessionStorage.setItem('adminLoggedIn', 'true');
                showNotification('✅ Admin wachtwoord ingesteld! Je bent ingelogd.', 'success');
                showView('adminView');
                loadAdminSettings();
            } else {
                // Normal login - verify password
                const storedPassword = passwordSnapshot.val();
                
                if (password === storedPassword) {
                    isAdminLoggedIn = true;
                    sessionStorage.setItem('adminLoggedIn', 'true');
                    showNotification('✅ Admin login geslaagd!', 'success');
                    showView('adminView');
                    loadAdminSettings();
                } else {
                    showNotification('❌ Verkeerd wachtwoord!', 'error');
                }
            }
        } catch (error) {
            console.error('Error during admin login:', error);
            showNotification('❌ Login fout. Probeer opnieuw.', 'error');
        }
    });
}

// Update admin login UI based on first time setup
async function updateAdminLoginUI() {
    try {
        const passwordSnapshot = await get(ref(db, 'gameState/adminPassword'));
        const isFirstTime = !passwordSnapshot.exists();
        
        const title = document.getElementById('adminLoginTitle');
        const subtitle = document.getElementById('adminLoginSubtitle');
        const confirmGroup = document.getElementById('adminConfirmPasswordGroup');
        const confirmInput = document.getElementById('adminConfirmPassword');
        const loginBtn = document.getElementById('adminLoginBtn');
        
        if (isFirstTime) {
            // First time setup mode
            if (title) title.textContent = '🔐 Admin Wachtwoord Instellen';
            if (subtitle) subtitle.textContent = 'Stel je admin wachtwoord in (minimaal 4 tekens)';
            if (confirmGroup) confirmGroup.classList.remove('hidden');
            if (confirmInput) confirmInput.required = true;
            if (loginBtn) loginBtn.textContent = 'Wachtwoord Instellen';
        } else {
            // Normal login mode
            if (title) title.textContent = '🔐 Admin Login';
            if (subtitle) subtitle.textContent = 'Vul het admin wachtwoord in';
            if (confirmGroup) confirmGroup.classList.add('hidden');
            if (confirmInput) confirmInput.required = false;
            if (loginBtn) loginBtn.textContent = 'Inloggen';
        }
    } catch (error) {
        console.error('Error updating admin login UI:', error);
    }
}

// Check if game is configured
async function checkIfConfigured() {
    try {
        const familyNameSnapshot = await get(ref(db, 'gameState/familyName'));
        const modeSnapshot = await get(ref(db, 'gameState/mode'));
        
        if (familyNameSnapshot.exists() && modeSnapshot.exists()) {
            // Game is configured, show login view
            familyName = familyNameSnapshot.val();
            gameMode = modeSnapshot.val();
            updateFamilyNameInUI();
            displayGameModeInfo();
            showView('loginView');
        } else {
            // Not configured, show message
            const loginView = document.getElementById('loginView');
            if (loginView) {
                loginView.innerHTML = `
                    <div class="container">
                        <div class="logo-container">
                            <h1 class="main-title">DE SLIMSTE<br><span class="highlight">...</span></h1>
                        </div>
                        <div class="login-box">
                            <h2>⚙️ Configuratie Vereist</h2>
                            <p style="font-size: 1.2rem; margin: 20px 0;">
                                De admin moet eerst het spel configureren voordat teams zich kunnen aanmelden.
                            </p>
                            <p style="opacity: 0.8;">
                                Ga naar het Admin menu om de familienaam en spelmodus in te stellen.
                            </p>
                        </div>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error checking configuration:', error);
    }
}

// Load admin settings into the admin panel
async function loadAdminSettings() {
    try {
        const familyNameSnapshot = await get(ref(db, 'gameState/familyName'));
        const modeSnapshot = await get(ref(db, 'gameState/mode'));
        const pinCodeSnapshot = await get(ref(db, 'gameState/pinCode'));
        
        const familyNameInput = document.getElementById('adminFamilyNameInput');
        if (familyNameSnapshot.exists() && familyNameInput) {
            familyNameInput.value = familyNameSnapshot.val();
        }
        
        if (modeSnapshot.exists()) {
            const mode = modeSnapshot.val();
            const modeButtons = document.querySelectorAll('#settingsTab .game-mode-btn');
            modeButtons.forEach(btn => {
                if (btn.getAttribute('data-mode') === mode) {
                    btn.classList.add('selected');
                }
            });
        }
        
        // Show PIN code if it exists, or generate one if it doesn't
        let pinCode;
        if (pinCodeSnapshot.exists()) {
            pinCode = pinCodeSnapshot.val();
        } else if (familyNameSnapshot.exists() && modeSnapshot.exists()) {
            // Game is configured but no PIN code exists - generate one
            pinCode = Math.floor(1000 + Math.random() * 9000).toString();
            await set(ref(db, 'gameState/pinCode'), pinCode);
            console.log('Generated missing PIN code:', pinCode);
        }
        
        if (pinCode) {
            const pinCodeDisplay = document.getElementById('pinCodeDisplay');
            const pinCodeValue = document.getElementById('pinCodeValue');
            if (pinCodeDisplay && pinCodeValue) {
                pinCodeValue.textContent = pinCode;
                pinCodeDisplay.classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error loading admin settings:', error);
    }
}

// Load PIN code in lobby
async function loadPinCodeInLobby() {
    try {
        const pinCodeSnapshot = await get(ref(db, 'gameState/pinCode'));
        if (pinCodeSnapshot.exists()) {
            const pinCode = pinCodeSnapshot.val();
            console.log('Loading PIN code in lobby:', pinCode);
            const lobbyPinCodeValue = document.getElementById('lobbyPinCodeValue');
            if (lobbyPinCodeValue) {
                lobbyPinCodeValue.textContent = pinCode;
                console.log('PIN code set successfully in lobby');
            } else {
                console.warn('lobbyPinCodeValue element not found');
            }
        } else {
            console.warn('No PIN code found in database');
        }
    } catch (error) {
        console.error('Error loading PIN code in lobby:', error);
    }
}

// Save admin settings
function initializeAdminSettings() {
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const familyNameInput = document.getElementById('adminFamilyNameInput');
    const modeButtons = document.querySelectorAll('#settingsTab .game-mode-btn');
    let selectedMode = null;
    
    if (!saveSettingsBtn) return;
    
    // Mode selection
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modeButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            selectedMode = button.getAttribute('data-mode');
        });
    });
    
    // Save settings
    saveSettingsBtn.addEventListener('click', async () => {
        const familyNameValue = familyNameInput.value.trim();
        
        if (!familyNameValue) {
            showNotification('⚠️ Familienaam is verplicht!', 'error');
            return;
        }
        
        if (!selectedMode) {
            // Check if mode already exists
            const modeSnapshot = await get(ref(db, 'gameState/mode'));
            if (modeSnapshot.exists()) {
                selectedMode = modeSnapshot.val();
            } else {
                showNotification('⚠️ Selecteer een spelmodus!', 'error');
                return;
            }
        }
        
        try {
            // Generate random 4-digit PIN code
            const pinCode = Math.floor(1000 + Math.random() * 9000).toString();
            
            await set(ref(db, 'gameState/familyName'), familyNameValue);
            await set(ref(db, 'gameState/mode'), selectedMode);
            await set(ref(db, 'gameState/pinCode'), pinCode);
            await set(ref(db, 'gameState/gameStarted'), false);
            
            familyName = familyNameValue;
            gameMode = selectedMode;
            
            // Update PIN code display
            const pinCodeDisplay = document.getElementById('pinCodeDisplay');
            const pinCodeValue = document.getElementById('pinCodeValue');
            if (pinCodeDisplay && pinCodeValue) {
                pinCodeValue.textContent = pinCode;
                pinCodeDisplay.classList.remove('hidden');
            }
            
            updateFamilyNameInUI();
            await checkIfConfigured();
            
            showNotification(`✅ Instellingen opgeslagen! PIN Code: ${pinCode}`, 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            showNotification('❌ Fout bij opslaan. Probeer opnieuw.', 'error');
        }
    });
}

// Change admin password
function initializePasswordChange() {
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    
    if (!changePasswordBtn) return;
    
    changePasswordBtn.addEventListener('click', async () => {
        const currentPassword = document.getElementById('currentPassword').value.trim();
        const newPassword = document.getElementById('newPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification('⚠️ Vul alle velden in!', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showNotification('⚠️ Nieuwe wachtwoorden komen niet overeen!', 'error');
            return;
        }
        
        if (newPassword.length < 4) {
            showNotification('⚠️ Wachtwoord moet minimaal 4 tekens zijn!', 'error');
            return;
        }
        
        try {
            const passwordSnapshot = await get(ref(db, 'gameState/adminPassword'));
            const storedPassword = passwordSnapshot.exists() ? passwordSnapshot.val() : '0000';
            
            if (currentPassword !== storedPassword) {
                showNotification('❌ Huidig wachtwoord is onjuist!', 'error');
                return;
            }
            
            await set(ref(db, 'gameState/adminPassword'), newPassword);
            
            // Clear fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
            showNotification('✅ Wachtwoord succesvol gewijzigd!', 'success');
        } catch (error) {
            console.error('Error changing password:', error);
            showNotification('❌ Fout bij wijzigen wachtwoord.', 'error');
        }
    });
}

// Start game manually from admin
function initializeGameStart() {
    const startGameBtn = document.getElementById('startGameBtn');
    const startGameFromScoreboardBtn = document.getElementById('startGameFromScoreboard');
    
    if (startGameBtn) {
        startGameBtn.addEventListener('click', async () => {
            try {
                await set(ref(db, 'gameState/gameStarted'), true);
                showNotification('🚀 Het spel is gestart voor alle teams!', 'success');
                
                // Notify all teams
                setTimeout(() => {
                    showView('scoreboardView');
                }, 2000);
            } catch (error) {
                console.error('Error starting game:', error);
                showNotification('❌ Fout bij starten van het spel.', 'error');
            }
        });
    }
    
    if (startGameFromScoreboardBtn) {
        startGameFromScoreboardBtn.addEventListener('click', async () => {
            try {
                // Generate and store shared questions for all rounds
                await generateSharedQuestions();
                
                // Start the game
                await set(ref(db, 'gameState/gameStarted'), true);
                showNotification('🚀 Het spel is gestart voor alle teams!', 'success');
            } catch (error) {
                console.error('Error starting game:', error);
                showNotification('❌ Fout bij starten van het spel.', 'error');
            }
        });
    }
}

// Generate shared questions for all teams when game starts
async function generateSharedQuestions() {
    try {
        // Check if shared questions already exist
        const existingQuestionsRef = ref(db, 'gameState/roundQuestions');
        const existingSnapshot = await get(existingQuestionsRef);
        
        if (existingSnapshot.exists()) {
            console.log('Shared questions already exist, skipping generation');
            return;
        }
        
        console.log('Generating shared questions for all rounds...');
        
        // Load all questions from database
        const questionsRef = ref(db, 'questions');
        const snapshot = await get(questionsRef);
        
        if (!snapshot.exists()) {
            console.warn('No questions in database');
            return;
        }
        
        const questionsData = snapshot.val();
        const roundTypes = ['open-deur', 'puzzel', 'woordzoeker', 'wat-weet-u', 'collectief-geheugen'];
        
        for (const roundType of roundTypes) {
            // Collect all questions for this round type
            const roundQuestions = [];
            Object.keys(questionsData).forEach(key => {
                const question = questionsData[key];
                if (question.type === roundType) {
                    // Validate question format before adding
                    if (isValidQuestion(question, roundType)) {
                        roundQuestions.push({ id: key, ...question });
                    } else {
                        console.warn(`Skipping invalid ${roundType} question:`, key);
                    }
                }
            });
            
            // Shuffle questions
            const shuffled = shuffleArray(roundQuestions);
            
            // Limit questions based on game mode
            let limitedQuestions = shuffled;
            if (gameMode && GAME_MODES[gameMode]) {
                const maxQuestions = GAME_MODES[gameMode].questionsPerRound[roundType];
                if (maxQuestions && shuffled.length > maxQuestions) {
                    limitedQuestions = shuffled.slice(0, maxQuestions);
                }
            }
            
            // Store in gameState/roundQuestions
            if (limitedQuestions.length > 0) {
                await set(ref(db, `gameState/roundQuestions/${roundType}`), limitedQuestions);
                console.log(`Stored ${limitedQuestions.length} questions for ${roundType}`);
            } else {
                console.warn(`No valid questions found for ${roundType}`);
            }
        }
        
        console.log('✅ Shared questions generated and stored');
    } catch (error) {
        console.error('Error generating shared questions:', error);
        throw error;
    }
}

// Validate question format based on round type
function isValidQuestion(question, roundType) {
    switch (roundType) {
        case 'open-deur':
            return question.hints && Array.isArray(question.hints) && question.answer;
        case 'puzzel':
            return question.clues1 && Array.isArray(question.clues1) && 
                   question.clues2 && Array.isArray(question.clues2) && 
                   question.clues3 && Array.isArray(question.clues3) &&
                   question.answer1 && question.answer2 && question.answer3;
        case 'woordzoeker':
            return question.question && question.answer;
        case 'wat-weet-u':
            return question.subject && question.facts && Array.isArray(question.facts);
        case 'collectief-geheugen':
            return question.category && question.answers && Array.isArray(question.answers);
        default:
            return true;
    }
}

// Update family name in all UI elements
function updateFamilyNameInUI() {
    const displayName = familyName.toUpperCase() || '...';
    
    // Update all title elements
    const titleElements = [
        'loginFamilyTitle',
        'lobbyFamilyTitle',
        'scoreboardFamilyTitle'
    ];
    
    titleElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = displayName;
        }
    });
    
    // Update page title
    document.title = `De Slimste ${familyName || '...'}`;
}

// Display game mode info in login view
function displayGameModeInfo() {
    const gameModeDisplay = document.getElementById('gameModeDisplay');
    if (gameMode && GAME_MODES[gameMode] && gameModeDisplay) {
        const mode = GAME_MODES[gameMode];
        gameModeDisplay.innerHTML = `
            <span style="font-size: 1.5rem;">${mode.icon}</span>
            <div><strong>${mode.name}</strong></div>
            <div style="font-size: 0.9rem; opacity: 0.9;">${mode.duration}</div>
        `;
        gameModeDisplay.style.display = 'block';
    }
}

// Listen to game mode changes
function listenToGameMode() {
    if (gameModeListener) {
        gameModeListener();
    }
    
    gameModeListener = onValue(ref(db, 'gameState/mode'), (snapshot) => {
        if (snapshot.exists()) {
            gameMode = snapshot.val();
            displayGameModeInfo();
        }
    });
    
    // Listen to family name changes
    onValue(ref(db, 'gameState/familyName'), (snapshot) => {
        if (snapshot.exists()) {
            familyName = snapshot.val();
            updateFamilyNameInUI();
        }
    });
    
    // Also listen to game started status
    onValue(ref(db, 'gameState/gameStarted'), (snapshot) => {
        const activeView = document.querySelector('.view.active');
        
        if (snapshot.exists()) {
            const gameStarted = snapshot.val();
            
            if (gameStarted === true) {
                // Game has started, redirect to game view if in lobby
                if (activeView && activeView.id === 'lobbyView') {
                    showView('gameView');
                    showNotification('🎮 Het spel is begonnen! Veel succes!', 'success');
                }
            } else if (gameStarted === false) {
                // Game has been reset, redirect to lobby if in game view
                if (activeView && activeView.id === 'gameView') {
                    showView('lobbyView');
                    showNotification('🔄 Het spel is gereset door de admin. Terug naar de lobby!', 'warning');
                    
                    // Clear current team's round progress
                    currentRound = null;
                    currentQuestionIndex = 0;
                    currentQuestions = [];
                    completedRounds = [];
                }
            }
        }
    });
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
        
        const pinCodeInput = document.getElementById('pinCodeInput').value.trim();
        const teamName = document.getElementById('teamName').value.trim();
        
        if (!pinCodeInput || pinCodeInput.length !== 4) {
            showNotification('⚠️ Vul een geldige 4-cijferige PIN code in!', 'error');
            return;
        }
        
        if (!teamName) {
            showNotification('⚠️ Teamnaam is verplicht!', 'error');
            return;
        }
        
        // Validate PIN code
        try {
            const pinCodeSnapshot = await get(ref(db, 'gameState/pinCode'));
            if (!pinCodeSnapshot.exists()) {
                showNotification('❌ Spel is nog niet geconfigureerd. Vraag de admin om het spel in te stellen.', 'error');
                return;
            }
            
            const correctPinCode = pinCodeSnapshot.val();
            if (pinCodeInput !== correctPinCode) {
                showNotification('❌ Onjuiste PIN code! Vraag de juiste code aan de spelleider.', 'error');
                return;
            }
        } catch (error) {
            console.error('Error validating PIN code:', error);
            showNotification('❌ Fout bij valideren van PIN code.', 'error');
            return;
        }
        
        const playerInputsList = playerInputs.querySelectorAll('.player-input');
        const players = Array.from(playerInputsList)
            .map(input => input.value.trim())
            .filter(name => name.length > 0);
        
        // Players are now optional - team can exist without players
        
        // Create team object
        currentTeam = {
            name: teamName,
            players: players, // Can be empty array
            seconds: 60,
            completedRounds: [],
            timestamp: Date.now(),
            ready: false
        };
        
        // Save to Realtime Database
        try {
            const teamsRef = ref(db, 'teams');
            const newTeamRef = push(teamsRef);
            await set(newTeamRef, currentTeam);
            
            currentTeam.id = newTeamRef.key;
            sessionStorage.setItem('currentTeam', JSON.stringify(currentTeam));
            
            await updateTeamDisplay();
            
            // Go to lobby instead of game view
            showView('lobbyView');
            initializeLobby();
            loadPinCodeInLobby();
        } catch (error) {
            console.error('Error adding team:', error);
            showDatabaseError(error);
        }
    });
}

async function updateTeamDisplay() {
    if (!currentTeam) return;
    
    document.getElementById('currentTeamName').textContent = currentTeam.name;
    document.getElementById('teamSeconds').textContent = currentTeam.seconds || 60;
    
    // Handle empty players array
    const playersListElement = document.getElementById('playersList');
    if (currentTeam.players && currentTeam.players.length > 0) {
        playersListElement.textContent = currentTeam.players.join(', ');
    } else {
        playersListElement.textContent = '';
    }
    
    teamSeconds = currentTeam.seconds || 60;
    completedRounds = currentTeam.completedRounds || [];
    
    // Update completed rounds in UI
    await updateCompletedRoundsUI();
}

async function updateCompletedRoundsUI() {
    const roundButtons = document.querySelectorAll('.round-btn');
    const roundOrder = ['open-deur', 'puzzel', 'woordzoeker', 'wat-weet-u', 'collectief-geheugen'];
    
    // Check if all teams exist and completed previous rounds
    for (const btn of roundButtons) {
        const roundType = btn.getAttribute('data-round');
        const roundIndex = roundOrder.indexOf(roundType);
        
        // Check if round is completed by current team
        if (completedRounds.includes(roundType)) {
            btn.classList.add('completed');
            btn.disabled = false;
            btn.classList.remove('locked', 'next-round');
            btn.removeAttribute('title');
        } 
        // Check if this is the next round to play
        else if (roundIndex === completedRounds.length) {
            // Check if all teams completed the previous round
            let canPlayNextRound = true;
            
            if (roundIndex > 0) {
                const previousRound = roundOrder[roundIndex - 1];
                canPlayNextRound = await checkAllTeamsCompletedRound(previousRound);
            }
            
            if (canPlayNextRound) {
                btn.classList.remove('completed', 'locked');
                btn.classList.add('next-round');
                btn.disabled = false;
                btn.removeAttribute('title');
            } else {
                btn.classList.remove('completed', 'next-round');
                btn.classList.add('locked');
                btn.disabled = true;
                btn.title = 'Wacht tot alle teams de vorige ronde hebben afgerond';
            }
        }
        // Lock rounds that come later
        else if (roundIndex > completedRounds.length) {
            btn.classList.remove('completed', 'next-round');
            btn.classList.add('locked');
            btn.disabled = true;
            btn.title = 'Voltooi eerst de vorige rondes';
        }
        // Previous rounds that aren't completed (shouldn't happen, but handle it)
        else {
            btn.classList.remove('completed', 'locked', 'next-round');
            btn.disabled = false;
            btn.removeAttribute('title');
        }
    }
}

// Check if all teams completed the current round
async function checkAllTeamsCompletedRound(roundType) {
    try {
        const teamsSnapshot = await get(ref(db, 'teams'));
        if (!teamsSnapshot.exists()) {
            return true; // No teams, so "all done"
        }
        
        const teamsData = teamsSnapshot.val();
        const teamsList = Object.values(teamsData);
        
        // If only 1 team, always return true (test mode)
        if (teamsList.length === 1) {
            return true;
        }
        
        // Check if all teams completed this round
        const allCompleted = teamsList.every(team => {
            const teamCompletedRounds = team.completedRounds || [];
            return teamCompletedRounds.includes(roundType);
        });
        
        return allCompleted;
    } catch (error) {
        console.error('Error checking team completion:', error);
        return false;
    }
}

// Lobby functionality
function initializeLobby() {
    const readyBtn = document.getElementById('readyBtn');
    
    // Load PIN code in lobby initially
    loadPinCodeInLobby();
    
    // Add real-time listener for PIN code updates
    onValue(ref(db, 'gameState/pinCode'), (snapshot) => {
        if (snapshot.exists()) {
            const pinCode = snapshot.val();
            const lobbyPinCodeValue = document.getElementById('lobbyPinCodeValue');
            if (lobbyPinCodeValue) {
                lobbyPinCodeValue.textContent = pinCode;
                console.log('PIN code updated in lobby via listener:', pinCode);
            }
        }
    });
    
    // Listen to all teams
    listenToTeams();
    
    // Ready button click
    readyBtn.addEventListener('click', async () => {
        if (!currentTeam) return;
        
        try {
            // Toggle ready status
            const newReadyStatus = !currentTeam.ready;
            await update(ref(db, `teams/${currentTeam.id}`), { ready: newReadyStatus });
            currentTeam.ready = newReadyStatus;
            
            // Update button
            if (newReadyStatus) {
                readyBtn.classList.add('ready-active');
                readyBtn.textContent = '⏳ Wachten...';
                readyBtn.disabled = true;
            } else {
                readyBtn.classList.remove('ready-active');
                readyBtn.textContent = '✓ Ik ben Klaar!';
                readyBtn.disabled = false;
            }
            
            sessionStorage.setItem('currentTeam', JSON.stringify(currentTeam));
        } catch (error) {
            console.error('Error updating ready status:', error);
        }
    });
}

function listenToTeams() {
    if (readyTeamsListener) {
        readyTeamsListener();
    }
    
    readyTeamsListener = onValue(ref(db, 'teams'), (snapshot) => {
        if (!snapshot.exists()) return;
        
        const teams = [];
        snapshot.forEach((childSnapshot) => {
            teams.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        displayTeamsList(teams);
        checkAllTeamsReady(teams);
    });
}

function displayTeamsList(teams) {
    const teamsList = document.getElementById('teamsList');
    
    if (teams.length === 0) {
        teamsList.innerHTML = '<div style="text-align: center; color: #999;">Nog geen teams aangemeld</div>';
        return;
    }
    
    teamsList.innerHTML = teams.map(team => {
        const isReady = team.ready || false;
        const isCurrentTeam = currentTeam && team.id === currentTeam.id;
        
        return `
            <div class="team-item ${isCurrentTeam ? 'current-team' : ''}">
                <span class="team-name">${team.name} ${isCurrentTeam ? '(jij)' : ''}</span>
                <span class="team-status ${isReady ? 'ready' : 'waiting'}">
                    ${isReady ? '✓ Klaar' : '⏳ Wachten'}
                </span>
            </div>
        `;
    }).join('');
}

function checkAllTeamsReady(teams) {
    const waitingMessage = document.getElementById('waitingMessage');
    
    if (teams.length === 0) {
        waitingMessage.textContent = 'Wachten op andere teams...';
        waitingMessage.classList.remove('all-ready');
        return;
    }
    
    const readyCount = teams.filter(t => t.ready).length;
    const allReady = teams.every(team => team.ready);
    
    if (allReady && teams.length > 0) {
        waitingMessage.textContent = '🎉 Alle teams zijn klaar! Wacht op de admin om het spel te starten...';
        waitingMessage.classList.add('all-ready');
    } else {
        waitingMessage.textContent = `Wachten op andere teams... (${readyCount}/${teams.length} klaar)`;
        waitingMessage.classList.remove('all-ready');
    }
}

// Listen to game started status
onValue(ref(db, 'gameState/gameStarted'), (snapshot) => {
    if (snapshot.exists() && snapshot.val() === true) {
        // Game has been started by admin
        if (currentTeam && document.getElementById('lobbyView').classList.contains('active')) {
            showView('gameView');
            showNotification('🎮 Het spel is begonnen! Veel succes!', 'success');
        }
    }
});

async function startGame() {
    // This function is now only called by admin from initializeGameStart()
    try {
        // Mark game as started
        await set(ref(db, 'gameState/gameStarted'), true);
        
        showNotification('🎮 Het spel is begonnen! Veel succes!', 'success');
    } catch (error) {
        console.error('Error starting game:', error);
    }
}

// Round Selection
function initializeRoundSelection() {
    const roundButtons = document.querySelectorAll('.round-btn');
    
    roundButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const roundType = button.getAttribute('data-round');
            
            // Check if round is locked
            if (button.classList.contains('locked')) {
                showNotification('🔒 Je moet eerst de vorige rondes voltooien!', 'error');
                return;
            }
            
            await startRound(roundType);
        });
    });
    
    // Back buttons
    const backButtons = document.querySelectorAll('.btn-back');
    backButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                await returnToRoundSelection();
            } catch (error) {
                console.error('Error returning to round selection:', error);
            }
        });
    });
    
    // Listen to other teams' progress to update available rounds
    onValue(ref(db, 'teams'), async () => {
        // Only update if we're on the round selection screen
        if (document.getElementById('roundSelection').classList.contains('active')) {
            try {
                await updateCompletedRoundsUI();
            } catch (error) {
                console.error('Error updating rounds UI from listener:', error);
            }
        }
    });
}

async function startRound(roundType) {
    // Check if team is logged in
    if (!currentTeam || !currentTeam.id) {
        showNotification('❌ Je moet eerst inloggen als team!', 'error');
        showView('loginView');
        return;
    }
    
    // Check if game has started
    try {
        const gameStartedSnapshot = await get(ref(db, 'gameState/gameStarted'));
        if (!gameStartedSnapshot.exists() || !gameStartedSnapshot.val()) {
            showNotification('❌ Het spel is nog niet gestart door de admin!', 'error');
            showView('lobbyView');
            return;
        }
    } catch (error) {
        console.error('Error checking game started:', error);
        showNotification('❌ Fout bij controleren van spelstatus', 'error');
        return;
    }
    
    currentRound = roundType;
    currentQuestionIndex = 0;
    roundStartTime = Date.now(); // Start timer for this round
    
    // Hide round selection
    document.getElementById('roundSelection').classList.remove('active');
    
    // Load questions for this round
    await loadQuestionsForRound(roundType);
    
    // Show round content
    const roundContentMap = {
        'open-deur': 'openDeurRound',
        'puzzel': 'puzzelRound',
        'woordzoeker': 'woordzoekerRound',
        'wat-weet-u': 'watWeetURound',
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
        
        // Start round timer
        startRoundTimer();
    }
}

function startRoundTimer() {
    // Clear any existing timer
    if (roundTimeoutId) {
        clearInterval(roundTimeoutId);
    }
    
    // Use mode-specific round time limit with fallback
    const modeConfig = currentGameState?.gameMode ? GAME_MODES[currentGameState.gameMode] : null;
    roundTimeLeft = modeConfig?.roundTimeLimit || 600; // Default to 10 minutes if not set
    updateRoundTimerDisplay();
    
    // Show timer in UI
    const timerDisplay = document.getElementById('roundTimerDisplay');
    if (timerDisplay) {
        timerDisplay.classList.remove('hidden');
    }
    
    // Update timer every second
    roundTimeoutId = setInterval(() => {
        roundTimeLeft--;
        updateRoundTimerDisplay();
        
        // Warning at 1 minute
        if (roundTimeLeft === 60) {
            showNotification('⏰ Nog 1 minuut voor deze ronde!', 'warning', 3000);
        }
        
        // Warning at 30 seconds
        if (roundTimeLeft === 30) {
            showNotification('⏰ Nog 30 seconden!', 'warning', 3000);
        }
        
        // Time's up
        if (roundTimeLeft <= 0) {
            clearInterval(roundTimeoutId);
            handleRoundTimeout();
        }
    }, 1000);
}

function updateRoundTimerDisplay() {
    const timerDisplay = document.getElementById('roundTimerValue');
    if (timerDisplay) {
        const minutes = Math.floor(roundTimeLeft / 60);
        const seconds = roundTimeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Add warning class when time is running low
        const container = document.getElementById('roundTimerDisplay');
        if (container) {
            if (roundTimeLeft <= 60) {
                container.classList.add('warning');
            } else {
                container.classList.remove('warning');
            }
        }
    }
}

function stopRoundTimer() {
    if (roundTimeoutId) {
        clearInterval(roundTimeoutId);
        roundTimeoutId = null;
    }
    
    const timerDisplay = document.getElementById('roundTimerDisplay');
    if (timerDisplay) {
        timerDisplay.classList.add('hidden');
    }
}

async function handleRoundTimeout() {
    console.log('Round time expired!');
    showNotification('⏱️ Tijd voor deze ronde is voorbij! Je gaat terug naar ronde selectie.', 'warning', 4000);
    
    // Wait a bit for the notification
    setTimeout(async () => {
        // Mark round as completed even if not finished
        if (currentRound && !completedRounds.includes(currentRound)) {
            completedRounds.push(currentRound);
            
            // Save to database
            if (currentTeam && currentTeam.id) {
                try {
                    const teamRef = ref(db, `teams/${currentTeam.id}`);
                    await update(teamRef, { 
                        completedRounds: completedRounds 
                    });
                } catch (error) {
                    console.error('Error updating completed rounds:', error);
                }
            }
        }
        
        // Return to round selection
        await returnToRoundSelection();
    }, 2000);
}

async function returnToRoundSelection() {
    // Stop round timer
    stopRoundTimer();
    
    document.querySelectorAll('.round-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('roundSelection').classList.add('active');
    
    // Update UI to reflect completed rounds
    await updateCompletedRoundsUI();
}

async function loadQuestionsForRound(roundType) {
    try {
        // First, try to load shared questions from gameState
        const sharedQuestionsRef = ref(db, `gameState/roundQuestions/${roundType}`);
        const sharedSnapshot = await get(sharedQuestionsRef);
        
        if (sharedSnapshot.exists()) {
            // Use the shared questions that were set when the game started
            currentQuestions = sharedSnapshot.val();
            console.log(`Loaded ${currentQuestions.length} shared questions for ${roundType}`);
            return;
        }
        
        // Fallback: If no shared questions exist, load and shuffle locally
        // This shouldn't happen in normal gameplay, but provides backwards compatibility
        console.warn(`No shared questions found for ${roundType}, loading locally`);
        
        const questionsRef = ref(db, 'questions');
        const snapshot = await get(questionsRef);
        
        currentQuestions = [];
        if (snapshot.exists()) {
            const questionsData = snapshot.val();
            Object.keys(questionsData).forEach(key => {
                const question = questionsData[key];
                if (question.type === roundType) {
                    // Validate question format before adding
                    if (isValidQuestion(question, roundType)) {
                        currentQuestions.push({ id: key, ...question });
                    } else {
                        console.warn(`Skipping invalid ${roundType} question:`, key);
                    }
                }
            });
        }
        
        // Shuffle questions
        currentQuestions = shuffleArray(currentQuestions);
        
        // Limit questions based on game mode
        if (gameMode && GAME_MODES[gameMode]) {
            const maxQuestions = GAME_MODES[gameMode].questionsPerRound[roundType];
            if (maxQuestions && currentQuestions.length > maxQuestions) {
                currentQuestions = currentQuestions.slice(0, maxQuestions);
            }
        }
        
        if (currentQuestions.length === 0) {
            console.warn(`No questions found for round: ${roundType}`);
        }
        
        console.log(`Loaded ${currentQuestions.length} local questions for ${roundType}`);
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// Shuffle array helper function
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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
        case 'woordzoeker':
            initializeWoordzoeker();
            break;
        case 'wat-weet-u':
            initializeWatWeetU();
            break;
        case 'collectief-geheugen':
            initializeCollectiefGeheugen();
            break;
    }
}

// Open Deur Round
function initializeOpenDeur() {
    // Clear any existing hint timeouts from previous questions
    clearHintTimeouts();
    
    if (currentQuestions.length === 0) {
        document.getElementById('openDeurHints').innerHTML = '<p style="color: white;">Geen vragen beschikbaar voor deze ronde.</p>';
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    const hintsContainer = document.getElementById('openDeurHints');
    const optionsContainer = document.getElementById('openDeurOptions');
    hintsContainer.innerHTML = '';
    optionsContainer.innerHTML = '';
    
    let answered = false;
    
    // Show hints one by one (8 seconds between hints)
    let hintIndex = 0;
    const showNextHint = () => {
        if (hintIndex < question.hints.length && !answered) {
            const hintDiv = document.createElement('div');
            hintDiv.className = 'hint-item';
            hintDiv.textContent = question.hints[hintIndex];
            hintsContainer.appendChild(hintDiv);
            hintIndex++;
            
            // Show options after 2 hints
            if (hintIndex === 2 && optionsContainer.children.length === 0) {
                showOptions();
            }
            
            if (hintIndex < question.hints.length) {
                const timeoutId = setTimeout(showNextHint, 8000);
                hintTimeouts.push(timeoutId);
            }
        }
    };
    
    const showOptions = () => {
        // Create array with correct answer and wrong options
        const options = question.options ? [...question.options] : [];
        
        // If no options provided, generate generic ones
        if (options.length === 0) {
            console.warn('No options provided for question, using answer only');
            options.push(question.answer);
        }
        
        // Shuffle options
        const shuffled = options.sort(() => Math.random() - 0.5);
        
        shuffled.forEach(option => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = option;
            
            button.onclick = () => {
                if (answered) return;
                
                answered = true;
                clearHintTimeouts();
                
                // Disable all buttons
                optionsContainer.querySelectorAll('.choice-button').forEach(btn => btn.disabled = true);
                
                if (answersMatch(option, question.answer)) {
                    button.classList.add('correct');
                    handleCorrectAnswer(15);
                    
                    setTimeout(() => {
                        currentQuestionIndex++;
                        if (currentQuestionIndex < currentQuestions.length) {
                            initializeOpenDeur();
                        } else {
                            completeRound();
                        }
                    }, 1500);
                } else {
                    button.classList.add('incorrect');
                    handleIncorrectAnswer();
                    
                    // Show correct answer
                    setTimeout(() => {
                        optionsContainer.querySelectorAll('.choice-button').forEach(btn => {
                            if (answersMatch(btn.textContent, question.answer)) {
                                btn.classList.add('correct');
                            }
                        });
                    }, 500);
                    
                    setTimeout(() => {
                        currentQuestionIndex++;
                        if (currentQuestionIndex < currentQuestions.length) {
                            initializeOpenDeur();
                        } else {
                            completeRound();
                        }
                    }, 3000);
                }
            };
            
            optionsContainer.appendChild(button);
        });
    };
    
    showNextHint();
}

// Helper function to clear all active hint timeouts
function clearHintTimeouts() {
    hintTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    hintTimeouts = [];
}

// Puzzel Round (3 op een rij) - Touch-friendly word selection
function initializePuzzel() {
    if (currentQuestions.length === 0) {
        document.getElementById('puzzelInstruction').innerHTML = '<p>Geen vragen beschikbaar voor deze ronde.</p>';
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    const wordOptionsDiv = document.getElementById('puzzelWordOptions');
    const selectedWordsDiv = document.getElementById('puzzelSelectedWords');
    
    // Clear containers
    wordOptionsDiv.innerHTML = '';
    selectedWordsDiv.innerHTML = '';
    
    let selectedWords = [];
    
    // Check if question has word options
    if (!question.wordOptions || !Array.isArray(question.wordOptions) || question.wordOptions.length === 0) {
        console.error('Missing wordOptions in question:', question);
        document.getElementById('puzzelInstruction').innerHTML = '<p style="color: red;">Fout: Deze puzzel heeft geen woordopties! Voeg ze toe in het admin panel.</p>';
        return;
    }
    
    // Create word option buttons
    const shuffledOptions = [...question.wordOptions].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach((word, index) => {
        const button = document.createElement('button');
        button.className = 'word-option-button';
        button.textContent = word;
        button.dataset.word = word;
        
        button.onclick = () => {
            if (button.classList.contains('selected')) {
                // Deselect
                button.classList.remove('selected');
                selectedWords = selectedWords.filter(w => w !== word);
            } else {
                // Select (max 3)
                if (selectedWords.length < 3) {
                    button.classList.add('selected');
                    selectedWords.push(word);
                }
            }
            
            updateSelectedWordsDisplay();
            
            // Check answer when 3 words selected
            if (selectedWords.length === 3) {
                setTimeout(checkPuzzelAnswer, 300);
            }
        };
        
        wordOptionsDiv.appendChild(button);
    });
    
    const updateSelectedWordsDisplay = () => {
        selectedWordsDiv.innerHTML = '';
        selectedWords.forEach(word => {
            const chip = document.createElement('div');
            chip.className = 'selected-word-chip';
            chip.textContent = word;
            selectedWordsDiv.appendChild(chip);
        });
    };
    
    const checkPuzzelAnswer = () => {
        const correctAnswers = [question.answer1, question.answer2, question.answer3];
        
        // Check if all selected words are correct
        const allCorrect = selectedWords.every(word => 
            correctAnswers.some(answer => answersMatch(word, answer))
        ) && selectedWords.length === 3;
        
        // Disable all buttons
        wordOptionsDiv.querySelectorAll('.word-option-button').forEach(btn => btn.disabled = true);
        
        if (allCorrect) {
            handleCorrectAnswer(25);
            
            setTimeout(() => {
                currentQuestionIndex++;
                if (currentQuestionIndex < currentQuestions.length) {
                    initializePuzzel();
                } else {
                    completeRound();
                }
            }, 1500);
        } else {
            handleIncorrectAnswer();
            
            // Show correct answers after delay
            setTimeout(() => {
                showNotification(`De correcte antwoorden waren: ${correctAnswers.join(', ')}`, 'error', 4000);
                
                setTimeout(() => {
                    currentQuestionIndex++;
                    if (currentQuestionIndex < currentQuestions.length) {
                        initializePuzzel();
                    } else {
                        completeRound();
                    }
                }, 3000);
            }, 1000);
        }
    };
}

// Woordzoeker Round (oude Puzzel)
function initializeWoordzoeker() {
    if (currentQuestions.length === 0) {
        document.getElementById('woordzoekerQuestion').innerHTML = '<p>Geen vragen beschikbaar voor deze ronde.</p>';
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    const questionDiv = document.getElementById('woordzoekerQuestion');
    const lettersDiv = document.getElementById('woordzoekerLetters');
    const answerDiv = document.getElementById('woordzoekerAnswer');
    
    questionDiv.textContent = question.question;
    
    // Scramble letters
    const letters = question.answer.toUpperCase().split('');
    const scrambled = [...letters].sort(() => Math.random() - 0.5);
    
    lettersDiv.innerHTML = '';
    let selectedLetters = [];
    let usedTileIndices = []; // Track which tiles have been used
    
    scrambled.forEach((letter, index) => {
        const tile = document.createElement('div');
        tile.className = 'letter-tile';
        tile.textContent = letter;
        tile.dataset.index = index;
        tile.dataset.letter = letter;
        
        tile.addEventListener('click', () => {
            if (usedTileIndices.includes(index)) {
                // Deselect: remove from used tiles and selected letters
                tile.classList.remove('selected');
                usedTileIndices = usedTileIndices.filter(i => i !== index);
                const letterIndex = selectedLetters.findIndex(l => l.index === index);
                if (letterIndex !== -1) {
                    selectedLetters.splice(letterIndex, 1);
                }
            } else {
                // Select: add to used tiles and selected letters
                tile.classList.add('selected');
                usedTileIndices.push(index);
                selectedLetters.push({ letter, index });
            }
            
            answerDiv.textContent = selectedLetters.map(l => l.letter).join('');
            
            // Check if answer is correct when all letters are selected
            if (selectedLetters.length === letters.length) {
                const answer = selectedLetters.map(l => l.letter).join('');
                if (answersMatch(answer, question.answer)) {
                    handleCorrectAnswer(15);
                    
                    setTimeout(() => {
                        currentQuestionIndex++;
                        if (currentQuestionIndex < currentQuestions.length) {
                            initializeWoordzoeker();
                        } else {
                            completeRound();
                        }
                    }, 1000);
                } else {
                    handleIncorrectAnswer();
                    setTimeout(() => {
                        selectedLetters = [];
                        usedTileIndices = [];
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

// Wat Weet U Over Round - Touch-friendly button selection
function initializeWatWeetU() {
    if (currentQuestions.length === 0) {
        document.getElementById('watWeetUSubject').innerHTML = '<p>Geen vragen beschikbaar voor deze ronde.</p>';
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    const subjectDiv = document.getElementById('watWeetUSubject');
    const timerDiv = document.getElementById('watWeetUTimer');
    const optionsDiv = document.getElementById('watWeetUOptions');
    const answersDiv = document.getElementById('watWeetUAnswers');
    const scoreDiv = document.getElementById('watWeetUScore');
    
    subjectDiv.textContent = `Wat Weet U Over: ${question.subject}`;
    optionsDiv.innerHTML = '';
    answersDiv.innerHTML = '';
    timerDiv.classList.remove('warning');
    
    let foundFacts = [];
    let correctCount = 0;
    let timeLeft = 60;
    let gameActive = true;
    
    // Update score display
    const updateScore = () => {
        scoreDiv.textContent = `Score: ${correctCount} / ${question.facts.length}`;
    };
    updateScore();
    
    // Check if question has factOptions
    if (!question.factOptions || !Array.isArray(question.factOptions) || question.factOptions.length === 0) {
        console.error('Missing factOptions in question:', question);
        subjectDiv.innerHTML = '<p style="color: red;">Fout: Deze vraag heeft geen antwoordopties! Voeg ze toe in het admin panel.</p>';
        return;
    }
    
    // Create fact option buttons
    const shuffledOptions = [...question.factOptions].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach(factOption => {
        const button = document.createElement('button');
        button.className = 'fact-option-button';
        button.textContent = factOption;
        
        button.onclick = () => {
            if (!gameActive) return;
            
            // Check if this is a correct fact
            const isCorrect = question.facts.some(fact => answersMatch(factOption, fact));
            
            if (isCorrect) {
                // Check if already found
                const alreadyFound = foundFacts.some(f => answersMatch(factOption, f));
                
                if (alreadyFound) {
                    showNotification('⚠️ Dit feit is al gevonden!', 'warning', 2000);
                    return;
                }
                
                button.classList.add('correct');
                button.disabled = true;
                
                // Find matching fact
                const matchedFact = question.facts.find(fact => answersMatch(factOption, fact));
                foundFacts.push(matchedFact);
                correctCount++;
                updateScore();
                
                // Add to answers display
                const answerDiv = document.createElement('div');
                answerDiv.className = 'wwu-answer-item correct';
                answerDiv.textContent = matchedFact;
                answersDiv.appendChild(answerDiv);
                
                // Award points
                updateTeamSeconds(3);
                
                // Check if all facts found
                if (correctCount === question.facts.length) {
                    clearInterval(timer);
                    gameActive = false;
                    optionsDiv.querySelectorAll('.fact-option-button').forEach(btn => btn.disabled = true);
                    
                    setTimeout(() => {
                        showNotification(`🎉 Perfect! Alle ${correctCount} feiten gevonden!`, 'success');
                        const bonusPoints = 10; // Bonus for completing
                        updateTeamSeconds(bonusPoints);
                        
                        setTimeout(() => {
                            currentQuestionIndex++;
                            if (currentQuestionIndex < currentQuestions.length) {
                                initializeWatWeetU();
                            } else {
                                completeRound();
                            }
                        }, 2000);
                    }, 1000);
                }
            } else {
                button.classList.add('incorrect');
                button.disabled = true;
            }
        };
        
        optionsDiv.appendChild(button);
    });
    
    // Timer countdown
    timerDiv.textContent = timeLeft;
    const timer = setInterval(() => {
        timeLeft--;
        timerDiv.textContent = timeLeft;
        
        if (timeLeft <= 10) {
            timerDiv.classList.add('warning');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            endWatWeetU();
        }
    }, 1000);
    
    const endWatWeetU = () => {
        gameActive = false;
        optionsDiv.querySelectorAll('.fact-option-button').forEach(btn => btn.disabled = true);
        
        // Award points based on correct answers
        const points = correctCount * 3;
        if (correctCount > 0) {
            setTimeout(() => {
                showNotification(`⏱️ Tijd om! Je hebt ${correctCount} feiten gevonden en ${points} seconden verdiend!`, 'success');
                setTimeout(() => {
                    currentQuestionIndex++;
                    
                    if (currentQuestionIndex < currentQuestions.length) {
                        initializeWatWeetU();
                    } else {
                        completeRound();
                    }
                }, 2000);
            }, 500);
        } else {
            setTimeout(() => {
                showNotification('⏱️ Tijd om! Geen feiten gevonden.', 'error');
                setTimeout(() => {
                    currentQuestionIndex++;
                    
                    if (currentQuestionIndex < currentQuestions.length) {
                        initializeWatWeetU();
                    } else {
                        completeRound();
                    }
                }, 2000);
            }, 500);
        }
    };
}

// Collectief Geheugen Round - Touch-friendly button selection
function initializeCollectiefGeheugen() {
    if (currentQuestions.length === 0) {
        document.getElementById('collectiefCategory').innerHTML = '<p>Geen vragen beschikbaar voor deze ronde.</p>';
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    const categoryDiv = document.getElementById('collectiefCategory');
    const scoreDiv = document.getElementById('collectiefScore');
    const optionsDiv = document.getElementById('collectiefOptions');
    const itemsDiv = document.getElementById('collectiefItems');
    
    categoryDiv.textContent = question.category;
    optionsDiv.innerHTML = '';
    itemsDiv.innerHTML = '';
    
    let foundItems = [];
    let incorrectAttempts = 0;
    const maxIncorrect = 3;
    let gameActive = true;
    
    // Update score display
    const updateScore = () => {
        scoreDiv.textContent = `Gevonden: ${foundItems.length} / ${question.answers.length} | Fouten: ${incorrectAttempts} / ${maxIncorrect}`;
    };
    updateScore();
    
    // Check if question has itemOptions
    if (!question.itemOptions || !Array.isArray(question.itemOptions) || question.itemOptions.length === 0) {
        console.error('Missing itemOptions in question:', question);
        categoryDiv.innerHTML = '<p style="color: red;">Fout: Deze vraag heeft geen item opties! Voeg ze toe in het admin panel.</p>';
        return;
    }
    
    // Create item option buttons
    const shuffledOptions = [...question.itemOptions].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach(itemOption => {
        const button = document.createElement('button');
        button.className = 'memory-option-button';
        button.textContent = itemOption;
        
        button.onclick = () => {
            if (!gameActive) return;
            
            // Check if this is a correct item
            const isCorrect = question.answers.some(answer => answersMatch(itemOption, answer));
            
            if (isCorrect) {
                // Check if already found
                const alreadyFound = foundItems.some(item => answersMatch(itemOption, item));
                
                if (alreadyFound) {
                    showNotification('⚠️ Dit item is al gevonden!', 'warning', 2000);
                    return;
                }
                
                button.classList.add('correct');
                button.disabled = true;
                
                // Find matching answer
                const matchedAnswer = question.answers.find(answer => answersMatch(itemOption, answer));
                foundItems.push(matchedAnswer);
                
                // Add to items display
                const itemDiv = document.createElement('div');
                itemDiv.className = 'memory-item';
                itemDiv.textContent = matchedAnswer;
                itemsDiv.appendChild(itemDiv);
                
                // Award points
                updateTeamSeconds(3);
                updateScore();
                
                // Check if all items found
                if (foundItems.length === question.answers.length) {
                    gameActive = false;
                    optionsDiv.querySelectorAll('.memory-option-button').forEach(btn => btn.disabled = true);
                    
                    handleCorrectAnswer(30);
                    
                    setTimeout(() => {
                        currentQuestionIndex++;
                        if (currentQuestionIndex < currentQuestions.length) {
                            initializeCollectiefGeheugen();
                        } else {
                            completeRound();
                        }
                    }, 1500);
                }
            } else {
                button.classList.add('incorrect');
                button.disabled = true;
                incorrectAttempts++;
                updateScore();
                
                // Add incorrect feedback to items
                const itemDiv = document.createElement('div');
                itemDiv.className = 'memory-item incorrect';
                itemDiv.textContent = itemOption;
                itemsDiv.appendChild(itemDiv);
                
                setTimeout(() => itemDiv.remove(), 1500);
                
                // Check if max incorrect reached
                if (incorrectAttempts >= maxIncorrect) {
                    gameActive = false;
                    optionsDiv.querySelectorAll('.memory-option-button').forEach(btn => btn.disabled = true);
                    
                    handleIncorrectAnswer();
                    
                    // Show remaining correct answers
                    setTimeout(() => {
                        question.answers.forEach(answer => {
                            if (!foundItems.some(item => answersMatch(answer, item))) {
                                const itemDiv = document.createElement('div');
                                itemDiv.className = 'memory-item';
                                itemDiv.style.opacity = '0.5';
                                itemDiv.style.backgroundColor = '#FF6B6B';
                                itemDiv.textContent = answer;
                                itemsDiv.appendChild(itemDiv);
                            }
                        });
                    }, 500);
                    
                    setTimeout(() => {
                        currentQuestionIndex++;
                        if (currentQuestionIndex < currentQuestions.length) {
                            initializeCollectiefGeheugen();
                        } else {
                            completeRound();
                        }
                    }, 3000);
                }
            }
        };
        
        optionsDiv.appendChild(button);
    });
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
    const previousSeconds = teamSeconds;
    teamSeconds += delta;
    
    if (teamSeconds <= 0) {
        teamSeconds = 0;
        
        // If we just hit 0 seconds, automatically show answer and end round
        if (previousSeconds > 0 && currentRound) {
            handleTimeExpired();
        }
    }
    
    document.getElementById('teamSeconds').textContent = teamSeconds;
    
    if (currentTeam && currentTeam.id) {
        try {
            const teamRef = ref(db, `teams/${currentTeam.id}`);
            await update(teamRef, { seconds: teamSeconds });
            currentTeam.seconds = teamSeconds;
            sessionStorage.setItem('currentTeam', JSON.stringify(currentTeam));
        } catch (error) {
            console.error('Error updating team seconds:', error);
        }
    }
}

function handleTimeExpired() {
    console.log('Time expired! Showing correct answer and ending round...');
    
    // Get current question and show correct answer based on round type
    const question = currentQuestions[currentQuestionIndex];
    
    if (!question) {
        completeRound();
        return;
    }
    
    let correctAnswerText = '';
    
    switch (currentRound) {
        case 'open-deur':
            correctAnswerText = question.answer || 'Geen antwoord beschikbaar';
            break;
        case 'puzzel':
            correctAnswerText = `${question.answer1 || '?'}, ${question.answer2 || '?'}, ${question.answer3 || '?'}`;
            break;
        case 'woordzoeker':
            correctAnswerText = question.answer || 'Geen antwoord beschikbaar';
            break;
        case 'wat-weet-u':
            correctAnswerText = `Onderwerp: ${question.subject || 'Onbekend'}`;
            break;
        case 'collectief-geheugen':
            correctAnswerText = `Categorie: ${question.category || 'Onbekend'}`;
            break;
        default:
            correctAnswerText = 'Geen antwoord beschikbaar';
    }
    
    // Show notification with correct answer
    showNotification(`⏰ Tijd verlopen! Het juiste antwoord was: ${correctAnswerText}`, 'warning', 5000);
    
    // Show the correct answer visually based on round type
    setTimeout(() => {
        if (currentRound === 'open-deur') {
            showCorrectAnswerForOpenDeur(question);
        } else if (currentRound === 'puzzel') {
            showCorrectAnswerForPuzzel(question);
        } else if (currentRound === 'woordzoeker') {
            showCorrectAnswerForWoordzoeker(question);
        } else if (currentRound === 'wat-weet-u') {
            showCorrectAnswerForWatWeetU(question);
        } else if (currentRound === 'collectief-geheugen') {
            showCorrectAnswerForCollectiefGeheugen(question);
        }
        
        // End the round after showing answer
        setTimeout(() => {
            completeRound();
        }, 3000);
    }, 500);
}

function showCorrectAnswerForOpenDeur(question) {
    const answerElement = document.getElementById('openDeurAnswer');
    if (answerElement) {
        answerElement.textContent = question.answer.toUpperCase();
        answerElement.style.color = '#4CAF50';
        answerElement.style.fontSize = '3rem';
        answerElement.style.fontWeight = 'bold';
    }
}

function showCorrectAnswerForPuzzel(question) {
    const input1 = document.getElementById('puzzelInput1');
    const input2 = document.getElementById('puzzelInput2');
    const input3 = document.getElementById('puzzelInput3');
    
    if (input1) {
        input1.value = question.answer1;
        input1.style.background = 'rgba(76, 175, 80, 0.3)';
        input1.disabled = true;
    }
    if (input2) {
        input2.value = question.answer2;
        input2.style.background = 'rgba(76, 175, 80, 0.3)';
        input2.disabled = true;
    }
    if (input3) {
        input3.value = question.answer3;
        input3.style.background = 'rgba(76, 175, 80, 0.3)';
        input3.disabled = true;
    }
}

function showCorrectAnswerForWoordzoeker(question) {
    const answerInput = document.getElementById('woordzoekerAnswer');
    if (answerInput) {
        answerInput.value = question.answer;
        answerInput.style.background = 'rgba(76, 175, 80, 0.3)';
        answerInput.disabled = true;
    }
}

function showCorrectAnswerForWatWeetU(question) {
    const answersDiv = document.getElementById('watWeetUAnswers');
    if (answersDiv && question.facts) {
        answersDiv.innerHTML = '';
        question.facts.forEach(fact => {
            const answerDiv = document.createElement('div');
            answerDiv.className = 'wwu-answer-item';
            answerDiv.style.background = 'rgba(76, 175, 80, 0.3)';
            answerDiv.textContent = fact;
            answersDiv.appendChild(answerDiv);
        });
    }
    
    const input = document.getElementById('watWeetUInput');
    const submitBtn = document.getElementById('watWeetUSubmit');
    if (input) input.disabled = true;
    if (submitBtn) submitBtn.disabled = true;
}

function showCorrectAnswerForCollectiefGeheugen(question) {
    const answersDiv = document.getElementById('collectiefGeheugenAnswers');
    if (answersDiv && question.answers) {
        answersDiv.innerHTML = '';
        question.answers.forEach(answer => {
            const answerDiv = document.createElement('div');
            answerDiv.className = 'cg-answer-item';
            answerDiv.style.background = 'rgba(76, 175, 80, 0.3)';
            answerDiv.textContent = answer;
            answersDiv.appendChild(answerDiv);
        });
    }
    
    const input = document.getElementById('collectiefGeheugenInput');
    const submitBtn = document.getElementById('collectiefGeheugenSubmit');
    if (input) input.disabled = true;
    if (submitBtn) submitBtn.disabled = true;
}

async function completeRound() {
    // Stop round timer
    stopRoundTimer();
    
    // Calculate time bonus for fast completion
    let timeBonus = 0;
    if (roundStartTime) {
        const elapsedSeconds = Math.floor((Date.now() - roundStartTime) / 1000);
        
        // Award bonus seconds based on speed
        // Under 60 seconds: 10 bonus seconds
        // 60-120 seconds: 5 bonus seconds
        // 120-180 seconds: 3 bonus seconds
        // Over 180 seconds: 0 bonus
        if (elapsedSeconds < 60) {
            timeBonus = 10;
        } else if (elapsedSeconds < 120) {
            timeBonus = 5;
        } else if (elapsedSeconds < 180) {
            timeBonus = 3;
        }
        
        if (timeBonus > 0) {
            teamSeconds += timeBonus;
            showNotification(`⚡ Snelheidsbonus: +${timeBonus} seconden! (${elapsedSeconds}s)`, 'success');
        }
        
        roundStartTime = null; // Reset timer
    }
    
    if (!completedRounds.includes(currentRound)) {
        completedRounds.push(currentRound);
        
        if (currentTeam && currentTeam.id) {
            try {
                const teamRef = ref(db, `teams/${currentTeam.id}`);
                await update(teamRef, { 
                    completedRounds: completedRounds,
                    seconds: teamSeconds
                });
                currentTeam.completedRounds = completedRounds;
                currentTeam.seconds = teamSeconds;
                sessionStorage.setItem('currentTeam', JSON.stringify(currentTeam));
            } catch (error) {
                console.error('Error updating completed rounds:', error);
            }
        }
    }
    
    // Ensure local UI reflects latest team data
    await updateTeamDisplay();
    
    // Check if all teams completed this round
    const allTeamsCompleted = await checkAllTeamsCompletedRound(currentRound);
    
    if (allTeamsCompleted) {
        showNotification(`✅ Ronde voltooid! Je hebt nu ${teamSeconds} seconden. Volgende ronde is beschikbaar!`, 'success');
    } else {
        showNotification(`✅ Ronde voltooid! Je hebt nu ${teamSeconds} seconden. Wacht tot andere teams klaar zijn...`, 'success');
    }
    
    // Return to round selection
    await returnToRoundSelection();
    
    // Trigger scoreboard refresh
    loadScoreboard();
}

// Scoreboard with live updates
function loadScoreboard() {
    try {
        const gameStateRef = ref(db, 'gameState');
        
        // Remove old listener if exists
        if (scoreboardListener) {
            scoreboardListener();
        }
        
        // Listen to game state to determine which view to show
        scoreboardListener = onValue(gameStateRef, (gameStateSnapshot) => {
            const gameState = gameStateSnapshot.val() || {};
            const gameStarted = gameState.gameStarted || false;
            const pinCode = gameState.pinCode || '----';
            const familyNameValue = gameState.familyName || familyName || '...';
            
            console.log('Scoreboard update - PIN code:', pinCode, 'Game started:', gameStarted);
            
            // Update family name in scoreboard title
            const scoreboardFamilyTitle = document.getElementById('scoreboardFamilyTitle');
            if (scoreboardFamilyTitle) {
                scoreboardFamilyTitle.textContent = familyNameValue.toUpperCase();
            }
            
            // Update PIN code display (always visible at top)
            const scoreboardPinCodeElem = document.getElementById('scoreboardPinCode');
            const scoreboardPinDisplay = document.getElementById('scoreboardPinDisplay');
            
            if (scoreboardPinCodeElem) {
                scoreboardPinCodeElem.textContent = pinCode;
                console.log('PIN code set in scoreboard:', pinCode);
            } else {
                console.warn('scoreboardPinCode element not found!');
            }
            
            // Show/hide PIN based on game state
            if (scoreboardPinDisplay) {
                if (gameStarted) {
                    // Hide PIN when game has started
                    scoreboardPinDisplay.classList.add('hidden');
                    console.log('PIN hidden - game started');
                } else {
                    // Show PIN during lobby phase (before game starts)
                    scoreboardPinDisplay.classList.remove('hidden');
                    console.log('PIN visible - lobby phase');
                }
            }
            
            const lobbySection = document.getElementById('lobbySection');
            const scoreboardSection = document.getElementById('scoreboardSection');
            const startGameSection = document.getElementById('startGameSection');
            
            if (gameStarted) {
                // Show scoreboard, hide lobby and start button
                if (lobbySection) lobbySection.classList.add('hidden');
                if (scoreboardSection) scoreboardSection.classList.remove('hidden');
                if (startGameSection) startGameSection.classList.add('hidden');
                
                // Load actual scoreboard
                loadActualScoreboard();
            } else {
                // Show lobby and start button, hide scoreboard
                if (lobbySection) lobbySection.classList.remove('hidden');
                if (scoreboardSection) scoreboardSection.classList.add('hidden');
                if (startGameSection) startGameSection.classList.remove('hidden');
                
                // Load lobby teams list
                loadLobbyTeams();
            }
        }, (error) => {
            console.error('Error loading game state:', error);
        });
    } catch (error) {
        console.error('Error setting up scoreboard listener:', error);
    }
}

// Load lobby teams with ready status
function loadLobbyTeams() {
    const teamsRef = ref(db, 'teams');
    
    onValue(teamsRef, (snapshot) => {
        const lobbyTeamsList = document.getElementById('lobbyTeamsList');
        if (!lobbyTeamsList) return;
        
        lobbyTeamsList.innerHTML = '';
        
        if (snapshot.exists()) {
            const teamsData = snapshot.val();
            const teams = Object.keys(teamsData).map(key => ({ id: key, ...teamsData[key] }));
            
            if (teams.length === 0) {
                lobbyTeamsList.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; background: rgba(255, 255, 255, 0.05); border-radius: 15px; margin-top: 20px;">
                        <div style="font-size: 3rem; margin-bottom: 20px;">👥</div>
                        <p style="font-size: 1.2rem; margin: 10px 0; opacity: 0.9;">Nog geen teams aangemeld</p>
                        <p style="opacity: 0.7; margin-top: 10px;">Teams kunnen zich aanmelden met de bovenstaande PIN code</p>
                    </div>
                `;
                return;
            }
            
            teams.forEach(team => {
                const teamCard = document.createElement('div');
                teamCard.className = 'lobby-team-card';
                teamCard.style.cssText = `
                    background: rgba(255, 255, 255, 0.1);
                    padding: 20px;
                    border-radius: 15px;
                    margin-bottom: 15px;
                    border: 2px solid ${team.ready ? 'var(--accent-yellow)' : 'rgba(255, 255, 255, 0.2)'};
                    transition: all 0.3s ease;
                `;
                
                const playersDisplay = team.players && team.players.length > 0 
                    ? `<div style="margin-top: 10px; opacity: 0.8; font-size: 0.9rem;">${team.players.join(', ')}</div>` 
                    : '';
                
                const readyBadge = team.ready 
                    ? '<span style="background: var(--accent-yellow); color: var(--primary-blue); padding: 5px 15px; border-radius: 20px; font-weight: 600; margin-left: 10px;">✓ Klaar</span>'
                    : '<span style="background: rgba(255, 255, 255, 0.1); padding: 5px 15px; border-radius: 20px; opacity: 0.6; margin-left: 10px;">Wacht...</span>';
                
                teamCard.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <h3 style="margin: 0; font-size: 1.5rem;">${team.name}</h3>
                        ${readyBadge}
                    </div>
                    ${playersDisplay}
                `;
                
                lobbyTeamsList.appendChild(teamCard);
            });
        } else {
            lobbyTeamsList.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; background: rgba(255, 255, 255, 0.05); border-radius: 15px; margin-top: 20px;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">👥</div>
                    <p style="font-size: 1.2rem; margin: 10px 0; opacity: 0.9;">Nog geen teams aangemeld</p>
                    <p style="opacity: 0.7; margin-top: 10px;">Teams kunnen zich aanmelden met de bovenstaande PIN code</p>
                </div>
            `;
        }
    });
}

// Load actual scoreboard (existing implementation)
function loadActualScoreboard() {
    const teamsRef = ref(db, 'teams');
    
    onValue(teamsRef, async (snapshot) => {
        const teams = [];
        
        if (snapshot.exists()) {
            const teamsData = snapshot.val();
            Object.keys(teamsData).forEach(key => {
                teams.push({ id: key, ...teamsData[key] });
            });
        }
        
        // Sort by seconds (descending) - highest score first
        teams.sort((a, b) => (b.seconds || 60) - (a.seconds || 60));
        
        // Check if leader changed
        const currentLeader = teams.length > 0 ? teams[0].id : null;
        const leaderChanged = previousLeader && currentLeader && previousLeader !== currentLeader;
        
        if (leaderChanged && teams.length > 1) {
            // Show leader change notification with team info
            const newLeaderTeam = teams[0];
            showLeaderChangeNotification(newLeaderTeam.name, newLeaderTeam.players || []);
        }
        
        previousLeader = currentLeader;
        
        const scoreboardContent = document.getElementById('scoreboardContent');
        
        // Only update if scoreboard view is active or visible
        if (!scoreboardContent) return;
        
        // Always show end game button when scoreboard is visible
        const endGameSection = document.getElementById('endGameSection');
        if (endGameSection) {
            endGameSection.classList.remove('hidden');
        }
        
        // Smooth transition: fade out
        scoreboardContent.style.opacity = '0.5';
        scoreboardContent.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            scoreboardContent.innerHTML = '';
            
            teams.forEach((team, index) => {
                const teamCard = document.createElement('div');
                teamCard.className = 'team-card';
                teamCard.style.animation = 'slideInLeft 0.5s ease forwards';
                teamCard.style.animationDelay = `${index * 0.1}s`;
                teamCard.style.opacity = '0';
                
                // Add winner class for first place
                if (index === 0 && teams.length > 1) {
                    teamCard.classList.add('winner');
                }
                
                // Add position number
                const position = index + 1;
                let medal = '';
                if (position === 1) medal = '🥇';
                else if (position === 2) medal = '🥈';
                else if (position === 3) medal = '🥉';
                
                // Format players list with emphasis for winner
                const playersArray = team.players && team.players.length > 0 ? team.players : [];
                const playersDisplay = playersArray.join(', ');
                
                // Only show players section if there are players
                let playersHtml = '';
                if (playersArray.length > 0) {
                    if (position === 1 && teams.length > 1) {
                        playersHtml = `<div class="players winner-players" style="margin-top: 10px; font-size: 1.2rem; font-weight: 600; color: var(--accent-yellow);">🎉 ${playersDisplay} 🎉</div>`;
                    } else {
                        playersHtml = `<div class="players" style="margin-top: 10px;">${playersDisplay}</div>`;
                    }
                }
                
                teamCard.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                        <h3 style="margin: 0;">#${position} ${medal} ${team.name}</h3>
                    </div>
                    <div class="score" style="font-size: 3rem; font-weight: 900; color: var(--accent-yellow);">
                        ${team.seconds || 60}
                    </div>
                    ${playersHtml}
                    <div style="margin-top: 10px; opacity: 0.7; font-size: 0.9rem;">
                        Rondes voltooid: ${team.completedRounds ? team.completedRounds.length : 0}/5
                    </div>
                `;
                
                scoreboardContent.appendChild(teamCard);
            });
            
            if (teams.length === 0) {
                scoreboardContent.innerHTML = '<p style="text-align: center; font-size: 1.5rem; color: white;">Nog geen teams aangemeld!</p>';
            }
            
            // Fade back in
            scoreboardContent.style.opacity = '1';
        }, 300);
    }, (error) => {
        console.error('Error loading scoreboard:', error);
    });
}

// Show leader change notification
function showLeaderChangeNotification(newLeaderName, players = []) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.5);
        background: linear-gradient(135deg, var(--accent-yellow), gold);
        color: var(--dark-gray);
        padding: 40px 60px;
        border-radius: 20px;
        font-size: 2.5rem;
        font-weight: 900;
        z-index: 10000;
        text-align: center;
        box-shadow: 0 20px 60px rgba(255, 210, 63, 0.6);
        animation: popIn 0.6s ease forwards;
        border: 5px solid white;
    `;
    
    const playersText = players.length > 0 
        ? `<div style="font-size: 1.3rem; margin-top: 10px; font-weight: 600;">${players.join(', ')}</div>`
        : '';
    
    notification.innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 10px;">👑</div>
        <div>NIEUWE LEIDER!</div>
        <div style="font-size: 2rem; margin-top: 15px; color: var(--primary-orange);">${newLeaderName}</div>
        ${playersText}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transition = 'all 0.5s ease';
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => notification.remove(), 500);
    }, 3500);
}

// Scoreboard Background Music
function initializeScoreboardMusic() {
    const music = document.getElementById('backgroundMusic');
    const toggleBtn = document.getElementById('toggleMusic');
    
    if (!music || !toggleBtn) return;
    
    // Set volume
    music.volume = 0.3;
    
    // Ensure music starts paused
    music.pause();
    toggleBtn.classList.remove('playing');
    
    // Toggle music on button click
    toggleBtn.addEventListener('click', () => {
        if (music.paused) {
            music.play().catch(err => {
                console.log('Autoplay prevented:', err);
                showNotification('🎵 Klik nogmaals om de muziek te starten', 'info');
            });
            toggleBtn.classList.add('playing');
            toggleBtn.querySelector('.music-text').textContent = 'Pauzeer';
        } else {
            music.pause();
            toggleBtn.classList.remove('playing');
            toggleBtn.querySelector('.music-text').textContent = 'Muziek';
        }
    });
}

function stopScoreboardMusic() {
    const music = document.getElementById('backgroundMusic');
    const toggleBtn = document.getElementById('toggleMusic');
    
    if (music) {
        music.pause();
        music.currentTime = 0;
    }
    
    if (toggleBtn) {
        toggleBtn.classList.remove('playing');
        if (toggleBtn.querySelector('.music-text')) {
            toggleBtn.querySelector('.music-text').textContent = 'Muziek';
        }
    }
}

// Admin Panel
function initializeAdminPanel() {
    // Initialize all admin functions
    initializeAdminSettings();
    initializePasswordChange();
    initializeGameStart();
    
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
            
            if (tabName === 'settings') {
                document.getElementById('settingsTab').classList.add('active');
                loadAdminSettings();
            } else if (tabName === 'questions') {
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
    if (questionType) {
        questionType.addEventListener('change', () => {
            renderQuestionFields(questionType.value);
        });
        
        // Initial render
        renderQuestionFields('open-deur');
    }
    
    // Add question form
    const addQuestionForm = document.getElementById('addQuestionForm');
    if (addQuestionForm) {
        addQuestionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await addQuestion();
        });
    }
    
    // Reset game
    const resetGameBtn = document.getElementById('resetGameBtn');
    if (resetGameBtn) {
        resetGameBtn.addEventListener('click', async () => {
            if (confirm('Weet je zeker dat je het spel wilt resetten? Teams blijven behouden maar scores worden op 60 seconden gezet en gameStarted wordt false.')) {
                await resetGame();
            }
        });
    }
    
    const fullResetBtn = document.getElementById('fullResetBtn');
    if (fullResetBtn) {
        fullResetBtn.addEventListener('click', async () => {
            if (confirm('⚠️ WAARSCHUWING: Dit verwijdert ALLE teams en reset het volledige spel! Weet je het zeker?')) {
                if (confirm('Laatste bevestiging: ALLE data wordt verwijderd. Doorgaan?')) {
                    await fullResetGame();
                }
            }
        });
    }
    
    // End Game button from scoreboard view
    const endGameBtn = document.getElementById('endGameBtn');
    if (endGameBtn) {
        endGameBtn.addEventListener('click', async () => {
            if (confirm('🏆 Spel beëindigen en terug naar lobby? Teams blijven behouden maar het spel wordt gereset.')) {
                await resetGame();
            }
        });
    }
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
                    <label>Hints Groep 1 (4 hints, 1 per regel)</label>
                    <textarea id="questionClues1" rows="4" required placeholder="Hint 1&#10;Hint 2&#10;Hint 3&#10;Hint 4"></textarea>
                </div>
                <div class="form-group">
                    <label>Antwoord 1</label>
                    <input type="text" id="questionAnswer1" required placeholder="bijv. Hond">
                </div>
                <div class="form-group">
                    <label>Hints Groep 2 (4 hints, 1 per regel)</label>
                    <textarea id="questionClues2" rows="4" required placeholder="Hint 1&#10;Hint 2&#10;Hint 3&#10;Hint 4"></textarea>
                </div>
                <div class="form-group">
                    <label>Antwoord 2</label>
                    <input type="text" id="questionAnswer2" required placeholder="bijv. Kat">
                </div>
                <div class="form-group">
                    <label>Hints Groep 3 (4 hints, 1 per regel)</label>
                    <textarea id="questionClues3" rows="4" required placeholder="Hint 1&#10;Hint 2&#10;Hint 3&#10;Hint 4"></textarea>
                </div>
                <div class="form-group">
                    <label>Antwoord 3</label>
                    <input type="text" id="questionAnswer3" required placeholder="bijv. Vogel">
                </div>
            `;
            break;
        case 'woordzoeker':
            fieldsContainer.innerHTML = `
                <div class="form-group">
                    <label>Vraag/Hint</label>
                    <input type="text" id="questionText" required>
                </div>
                <div class="form-group">
                    <label>Antwoord (woord om te zoeken)</label>
                    <input type="text" id="questionAnswer" required>
                </div>
            `;
            break;
        case 'wat-weet-u':
            fieldsContainer.innerHTML = `
                <div class="form-group">
                    <label>Onderwerp</label>
                    <input type="text" id="questionSubject" required placeholder="bijv. Amsterdam">
                </div>
                <div class="form-group">
                    <label>Feiten/Kenmerken (1 per regel)</label>
                    <textarea id="questionFacts" rows="10" required placeholder="Feit 1&#10;Feit 2&#10;Feit 3"></textarea>
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
    let questionData = { type, timestamp: Date.now() };
    
    try {
        switch(type) {
            case 'open-deur':
                const hints = document.getElementById('questionHints').value.split('\n').filter(h => h.trim());
                questionData.hints = hints;
                questionData.answer = document.getElementById('questionAnswer').value.trim();
                break;
            case 'puzzel':
                const clues1 = document.getElementById('questionClues1').value.split('\n').filter(c => c.trim());
                const clues2 = document.getElementById('questionClues2').value.split('\n').filter(c => c.trim());
                const clues3 = document.getElementById('questionClues3').value.split('\n').filter(c => c.trim());
                
                if (clues1.length !== 4 || clues2.length !== 4 || clues3.length !== 4) {
                    showNotification('⚠️ Elke groep moet precies 4 hints hebben!', 'error');
                    return;
                }
                
                questionData.clues1 = clues1;
                questionData.answer1 = document.getElementById('questionAnswer1').value.trim();
                questionData.clues2 = clues2;
                questionData.answer2 = document.getElementById('questionAnswer2').value.trim();
                questionData.clues3 = clues3;
                questionData.answer3 = document.getElementById('questionAnswer3').value.trim();
                break;
            case 'woordzoeker':
                questionData.question = document.getElementById('questionText').value.trim();
                questionData.answer = document.getElementById('questionAnswer').value.trim();
                break;
            case 'wat-weet-u':
                questionData.subject = document.getElementById('questionSubject').value.trim();
                const facts = document.getElementById('questionFacts').value.split('\n').filter(f => f.trim());
                questionData.facts = facts;
                break;
            case 'collectief-geheugen':
                questionData.category = document.getElementById('questionCategory').value.trim();
                const answers = document.getElementById('questionAnswers').value.split('\n').filter(a => a.trim());
                questionData.answers = answers;
                break;
        }
        
        const questionsRef = ref(db, 'questions');
        const newQuestionRef = push(questionsRef);
        await set(newQuestionRef, questionData);
        
        showNotification('✅ Vraag toegevoegd!', 'success');
        document.getElementById('addQuestionForm').reset();
        renderQuestionFields(type);
        loadQuestionsList();
    } catch (error) {
        console.error('Error adding question:', error);
        showNotification('❌ Er ging iets mis bij het toevoegen van de vraag.', 'error');
    }
}

async function loadQuestionsList() {
    try {
        const questionsRef = ref(db, 'questions');
        const snapshot = await get(questionsRef);
        const questionsList = document.getElementById('questionsList');
        questionsList.innerHTML = '<h3>Alle Vragen</h3>';
        
        if (!snapshot.exists()) {
            questionsList.innerHTML += '<p>Nog geen vragen toegevoegd.</p>';
            return;
        }
        
        const questionsData = snapshot.val();
        Object.keys(questionsData).forEach(key => {
            const data = questionsData[key];
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            
            let content = '';
            switch(data.type) {
                case 'open-deur':
                    content = `Hints: ${data.hints ? data.hints.join(', ') : 'N/A'}<br>Antwoord: ${data.answer}`;
                    break;
                case 'puzzel':
                    content = `Groep 1: ${data.clues1 ? data.clues1.join(', ') : 'N/A'} → ${data.answer1}<br>
                               Groep 2: ${data.clues2 ? data.clues2.join(', ') : 'N/A'} → ${data.answer2}<br>
                               Groep 3: ${data.clues3 ? data.clues3.join(', ') : 'N/A'} → ${data.answer3}`;
                    break;
                case 'woordzoeker':
                    content = `Vraag: ${data.question}<br>Antwoord: ${data.answer}`;
                    break;
                case 'wat-weet-u':
                    content = `Onderwerp: ${data.subject}<br>Feiten: ${data.facts ? data.facts.join(', ') : 'N/A'}`;
                    break;
                case 'collectief-geheugen':
                    content = `Categorie: ${data.category}<br>Antwoorden: ${data.answers ? data.answers.join(', ') : 'N/A'}`;
                    break;
            }
            
            questionDiv.innerHTML = `
                <div class="question-type">${data.type}</div>
                <div class="question-content">${content}</div>
                <button class="btn-danger" onclick="deleteQuestion('${key}')">Verwijderen</button>
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
            const questionRef = ref(db, `questions/${questionId}`);
            await remove(questionRef);
            loadQuestionsList();
            showNotification('✅ Vraag verwijderd', 'success');
        } catch (error) {
            console.error('Error deleting question:', error);
            showNotification('❌ Er ging iets mis bij het verwijderen.', 'error');
        }
    }
};

async function loadActiveTeams() {
    try {
        const teamsRef = ref(db, 'teams');
        const snapshot = await get(teamsRef);
        const activeTeamsDiv = document.getElementById('activeTeams');
        activeTeamsDiv.innerHTML = '';
        
        if (!snapshot.exists()) {
            activeTeamsDiv.innerHTML = '<p>Nog geen actieve teams.</p>';
            return;
        }
        
        const teamsData = snapshot.val();
        Object.keys(teamsData).forEach(key => {
            const data = teamsData[key];
            const teamDiv = document.createElement('div');
            teamDiv.className = 'question-item';
            teamDiv.innerHTML = `
                <div class="question-type">${data.name}</div>
                <div class="question-content">
                    Spelers: ${data.players ? data.players.join(', ') : 'N/A'}<br>
                    Seconden: ${data.seconds || 60}<br>
                    Rondes voltooid: ${data.completedRounds ? data.completedRounds.length : 0}/4
                </div>
                <button class="btn-danger" onclick="deleteTeam('${key}')">Verwijderen</button>
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
            const teamRef = ref(db, `teams/${teamId}`);
            await remove(teamRef);
            loadActiveTeams();
            loadScoreboard();
            showNotification('✅ Team verwijderd', 'success');
        } catch (error) {
            console.error('Error deleting team:', error);
            showNotification('❌ Er ging iets mis bij het verwijderen.', 'error');
        }
    }
};

async function resetGame() {
    try {
        // Reset game state (keep teams, reset scores and game started status)
        await set(ref(db, 'gameState/gameStarted'), false);
        
        // Clear shared questions so they get regenerated on next game start
        await remove(ref(db, 'gameState/roundQuestions'));
        
        // Reset all team scores and completed rounds
        const teamsSnapshot = await get(ref(db, 'teams'));
        if (teamsSnapshot.exists()) {
            const teams = teamsSnapshot.val();
            const updates = {};
            
            Object.keys(teams).forEach(teamId => {
                updates[`teams/${teamId}/seconds`] = 60;
                updates[`teams/${teamId}/completedRounds`] = [];
                updates[`teams/${teamId}/ready`] = false;
            });
            
            await update(ref(db), updates);
        }
        
        showNotification('✅ Spel gereset! Teams blijven behouden, scores zijn teruggezet.', 'success');
        loadActiveTeams();
        loadScoreboard();
    } catch (error) {
        console.error('Error resetting game:', error);
        showNotification('❌ Er ging iets mis bij het resetten.', 'error');
    }
}

async function fullResetGame() {
    try {
        // Remove all teams
        const teamsRef = ref(db, 'teams');
        await remove(teamsRef);
        
        // Reset game state
        await set(ref(db, 'gameState/gameStarted'), false);
        
        // Clear shared questions
        await remove(ref(db, 'gameState/roundQuestions'));
        
        // Clear session storage
        sessionStorage.removeItem('currentTeam');
        currentTeam = null;
        
        showNotification('✅ Volledige reset! Alle teams zijn verwijderd en het spel is gereset.', 'success');
        loadActiveTeams();
        loadScoreboard();
        showView('loginView');
    } catch (error) {
        console.error('Error doing full reset:', error);
        showNotification('❌ Er ging iets mis bij de volledige reset.', 'error');
    }
}

// Initialize default questions if database is empty
async function initializeDefaultQuestions() {
    try {
        console.log('Checking for existing questions...');
        const questionsRef = ref(db, 'questions');
        const snapshot = await get(questionsRef);
        
        if (!snapshot.exists()) {
            console.log('Initializing default questions...');
            await addDefaultQuestions();
        } else {
            console.log('Questions already exist');
        }
    } catch (error) {
        console.error('Error checking questions:', error);
        
        // Show user-friendly error message
        if (error.code === 'PERMISSION_DENIED' || error.message.includes('permission')) {
            showDatabaseError(error);
        }
    }
}

function showDatabaseError(error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #FF4757;
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        font-size: 1rem;
        text-align: center;
        z-index: 10001;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        max-width: 90%;
        animation: slideDown 0.5s ease-out;
    `;
    errorDiv.innerHTML = `
        <div style="font-size: 2rem; margin-bottom: 10px;">⚠️</div>
        <div style="font-weight: bold; margin-bottom: 10px;">Firebase Realtime Database Niet Geactiveerd!</div>
        <div style="font-size: 0.9rem; margin-bottom: 15px;">
            Ga naar Firebase Console en activeer Realtime Database.<br>
            <strong>Zie REALTIME-DATABASE-SETUP.md voor instructies.</strong>
        </div>
        <button onclick="this.parentElement.remove()" style="
            background: white;
            color: #FF4757;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        ">Sluiten</button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-hide after 30 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.style.transition = 'opacity 0.5s ease';
            errorDiv.style.opacity = '0';
            setTimeout(() => errorDiv.remove(), 500);
        }
    }, 30000);
}

function showNotification(message, type = 'info', duration = 2500) {
    // Remove any existing notifications first
    const existingNotifications = document.querySelectorAll('.app-notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notificationDiv = document.createElement('div');
    notificationDiv.className = 'app-notification';
    
    // Use authentic Slimste Mens colors
    let bgColor, borderColor;
    if (type === 'success') {
        bgColor = 'linear-gradient(135deg, #00D084 0%, #00A86B 100%)';
        borderColor = '#00D084';
    } else if (type === 'error') {
        bgColor = 'linear-gradient(135deg, #FF4757 0%, #FF3838 100%)';
        borderColor = '#FF4757';
    } else {
        bgColor = 'linear-gradient(135deg, #FF6600 0%, #FF8C00 100%)';
        borderColor = '#FF6600';
    }
    
    notificationDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 24px;
        border-radius: 10px;
        font-size: 0.95rem;
        font-weight: 600;
        text-align: center;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        max-width: 320px;
        animation: slideInRight 0.3s ease-out;
        pointer-events: none;
    `;
    notificationDiv.textContent = message;
    document.body.appendChild(notificationDiv);
    
    // Auto remove after specified duration
    setTimeout(() => {
        notificationDiv.style.transition = 'all 0.3s ease-in';
        notificationDiv.style.opacity = '0';
        notificationDiv.style.transform = 'translateX(20px)';
        setTimeout(() => notificationDiv.remove(), 300);
    }, duration);
}

async function addDefaultQuestions() {
    const defaultQuestions = [
        // Open Deur vragen - Mix voor alle leeftijden
        
        // Voor jongeren (TikTok, gaming, moderne cultuur)
        {
            type: 'open-deur',
            hints: [
                'Dit is een online platform',
                'Je maakt er korte video\'s op',
                'Het is vooral populair bij jongeren',
                'De logo is zwart met muzieknoot'
            ],
            answer: 'TikTok',
            timestamp: Date.now()
        },
        {
            type: 'open-deur',
            hints: [
                'Dit is een populair spel',
                'Je bouwt en vecht in dit spel',
                'Het heeft een Battle Royale modus',
                'Epic Games heeft het gemaakt'
            ],
            answer: 'Fortnite',
            timestamp: Date.now()
        },
        
        // Voor ouders (jaren 90/2000, klassiekers)
        {
            type: 'open-deur',
            hints: [
                'Dit is een Nederlandse band',
                'Ze hadden een hit in 2007',
                'De naam is een Engels woord',
                'Hun bekendste nummer is "Ik wil dansen"'
            ],
            answer: 'Hieperdepiep',
            timestamp: Date.now()
        },
        {
            type: 'open-deur',
            hints: [
                'Dit is een film franchise',
                'Het gaat over tovenaars',
                'De hoofdpersoon heeft een litteken',
                'Zweinstein is de school'
            ],
            answer: 'Harry Potter',
            timestamp: Date.now()
        },
        
        // Voor opa en oma (klassieke kennis, geschiedenis)
        {
            type: 'open-deur',
            hints: [
                'Dit was een Nederlands koningin',
                'Ze regeerde 58 jaar',
                'Ze droeg altijd hoedjes',
                'Ze overleed in 2004'
            ],
            answer: 'Juliana',
            timestamp: Date.now()
        },
        {
            type: 'open-deur',
            hints: [
                'Dit is een Nederlandse zanger',
                'Hij zong over een tuintje in zijn hart',
                'Hij heette eigenlijk Simon',
                'Hij leefde van 1924 tot 2011'
            ],
            answer: 'Willy Alberti',
            timestamp: Date.now()
        },
        
        // Voor iedereen (algemene kennis)
        {
            type: 'open-deur',
            hints: [
                'Dit is een Nederlandse stad',
                'Er is een Dom',
                'Het is de vierde stad van Nederland',
                'Er zijn veel grachten'
            ],
            answer: 'Utrecht',
            timestamp: Date.now()
        },
        {
            type: 'open-deur',
            hints: [
                'Dit is een seizoen',
                'Het komt na de winter',
                'De bloemen gaan bloeien',
                'De bomen krijgen blaadjes'
            ],
            answer: 'Lente',
            timestamp: Date.now()
        },
        
        // Puzzel vragen (3 op een rij) - Mix voor alle leeftijden
        
        // Voor jongeren
        {
            type: 'puzzel',
            clues1: ['App', 'Berichten', 'Chatten', 'Groen logo'],
            answer1: 'WhatsApp',
            clues2: ['Video', 'Kort', 'Dans', 'Trends'],
            answer2: 'TikTok',
            clues3: ['Game', 'Blokjes', 'Bouwen', 'Creeper'],
            answer3: 'Minecraft',
            timestamp: Date.now()
        },
        {
            type: 'puzzel',
            clues1: ['Muziek', 'Groene app', 'Stream', 'Playlist'],
            answer1: 'Spotify',
            clues2: ['Foto', 'Filter', 'Story', 'Like'],
            answer2: 'Instagram',
            clues3: ['Video', 'Abonneren', 'Vloggen', 'Rood logo'],
            answer3: 'YouTube',
            timestamp: Date.now()
        },
        
        // Voor ouders
        {
            type: 'puzzel',
            clues1: ['Zanger', 'Dromen', 'Alkmaar', 'Leontine'],
            answer1: 'Borsato',
            clues2: ['Sitcom', 'Vrienden', 'New York', 'Central Perk'],
            answer2: 'Friends',
            clues3: ['Potter', 'Tovenaar', 'Zweinstein', 'Litteken'],
            answer3: 'Harry',
            timestamp: Date.now()
        },
        {
            type: 'puzzel',
            clues1: ['Streaming', 'Series', 'Rood logo', 'Kijken'],
            answer1: 'Netflix',
            clues2: ['Talentenjacht', 'Stoelen', 'Coaches', 'Blind'],
            answer2: 'TheVoice',
            clues3: ['Zangeres', 'Nobody\'s Wife', 'Rock', 'Nederlands'],
            answer3: 'Anouk',
            timestamp: Date.now()
        },
        
        // Voor opa en oma
        {
            type: 'puzzel',
            clues1: ['Koningin', 'Beatrix', 'Moeder', 'Hoedje'],
            answer1: 'Juliana',
            clues2: ['Munt', 'Voor Euro', 'Cent', 'fl'],
            answer2: 'Gulden',
            clues3: ['Zanger', 'Willy', 'Tuintje', 'Ramses'],
            answer3: 'Alberti',
            timestamp: Date.now()
        },
        {
            type: 'puzzel',
            clues1: ['Bevrijd', '5 mei', 'WO2', 'Feest'],
            answer1: 'Bevrijdingsdag',
            clues2: ['Koninginnedag', 'Willem', 'Oranje', '27 april'],
            answer2: 'Koningsdag',
            clues3: ['Sint', 'December', 'Schoentje', 'Pepernoten'],
            answer3: 'Sinterklaas',
            timestamp: Date.now()
        },
        
        // Voor iedereen
        {
            type: 'puzzel',
            clues1: ['Hoofdstad', 'Grachten', 'Dam', 'Nederland'],
            answer1: 'Amsterdam',
            clues2: ['Dom', 'Centraal', 'Provinc ie', 'Nederland'],
            answer2: 'Utrecht',
            clues3: ['Haven', 'Erasmusbrug', 'Feyenoord', 'Zuid-Holland'],
            answer3: 'Rotterdam',
            timestamp: Date.now()
        },
        {
            type: 'puzzel',
            clues1: ['Dier', 'Blaft', 'Huisdier', 'Trouw'],
            answer1: 'Hond',
            clues2: ['Dier', 'Miauwt', 'Huisdier', 'Onafhankelijk'],
            answer2: 'Kat',
            clues3: ['Dier', 'Piept', 'Vliegt', 'Veren'],
            answer3: 'Vogel',
            timestamp: Date.now()
        },
        
        // Woordzoeker vragen - Mix voor alle leeftijden
        
        // Voor jongeren
        {
            type: 'woordzoeker',
            question: 'Populaire streamer op Twitch en YouTube',
            answer: 'INFLUENCER',
            timestamp: Date.now()
        },
        {
            type: 'woordzoeker',
            question: 'Virtuele munteenheid zoals Bitcoin',
            answer: 'CRYPTO',
            timestamp: Date.now()
        },
        
        // Voor ouders
        {
            type: 'woordzoeker',
            question: 'Nederlandse TV-show met stoelen die draaien',
            answer: 'THEVOICE',
            timestamp: Date.now()
        },
        {
            type: 'woordzoeker',
            question: 'App om te chatten met groen logo',
            answer: 'WHATSAPP',
            timestamp: Date.now()
        },
        
        // Voor opa en oma
        {
            type: 'woordzoeker',
            question: 'Oude Nederlandse munteenheid voor de euro',
            answer: 'GULDEN',
            timestamp: Date.now()
        },
        {
            type: 'woordzoeker',
            question: 'Traditioneel Nederlands ontbijt op brood',
            answer: 'HAGELSLAG',
            timestamp: Date.now()
        },
        
        // Voor iedereen
        {
            type: 'woordzoeker',
            question: 'Grootste stad van Nederland',
            answer: 'AMSTERDAM',
            timestamp: Date.now()
        },
        {
            type: 'woordzoeker',
            question: 'Dier dat kaas graag eet volgens verhalen',
            answer: 'MUIS',
            timestamp: Date.now()
        },
        {
            type: 'woordzoeker',
            question: 'Oranje groente die goed is voor de ogen',
            answer: 'WORTEL',
            timestamp: Date.now()
        },
        
        // Wat Weet U Over vragen - Mix voor alle leeftijden
        
        // Voor jongeren
        {
            type: 'wat-weet-u',
            subject: 'Minecraft',
            facts: ['Een blokjesspel', 'Je kunt bouwen', 'Er zijn Creepers', 'Gemaakt door Mojang', 'Steve is de hoofdpersoon', 'Er is een Nether dimensie', 'Redstone voor elektronica', 'Ender Dragon is de endboss'],
            timestamp: Date.now()
        },
        {
            type: 'wat-weet-u',
            subject: 'Instagram',
            facts: ['Een social media platform', 'Je deelt foto\'s en video\'s', 'Stories na 24 uur weg', 'Eigendom van Meta', 'Je kunt Reels maken', 'Likes en comments', 'Filters en effecten', 'Direct Messages voor chatten'],
            timestamp: Date.now()
        },
        
        // Voor ouders
        {
            type: 'wat-weet-u',
            subject: 'Friends (TV-serie)',
            facts: ['Amerikaanse sitcom', '6 hoofdpersonen', 'Speelt in New York', 'Central Perk koffiehuis', 'Ross en Rachel', 'Monica en Chandler', 'Phoebe zingt Smelly Cat', '10 seizoenen'],
            timestamp: Date.now()
        },
        {
            type: 'wat-weet-u',
            subject: 'Marco Borsato',
            facts: ['Nederlandse zanger', 'Geboren in Alkmaar', 'Dromen zijn bedrog', 'Margherita is een hit', 'Getrouwd met Leontine', 'Coach bij The Voice', 'Vele nummers in het Nederlands', 'Veel concerten in Ahoy'],
            timestamp: Date.now()
        },
        
        // Voor opa en oma
        {
            type: 'wat-weet-u',
            subject: 'Koningin Juliana',
            facts: ['Nederlandse koningin', 'Regeerde van 1948-1980', 'Dochter van Wilhelmina', 'Moeder van Beatrix', 'Droeg vaak hoedjes', 'Hield van eenvoud', 'Volkskoningin genoemd', 'Overleed in 2004'],
            timestamp: Date.now()
        },
        {
            type: 'wat-weet-u',
            subject: 'De Gulden',
            facts: ['Oude Nederlandse munt', 'Voor de Euro', '100 cent was 1 gulden', 'Afkorting fl of ƒ', 'Munten en bankbiljetten', 'Werd Euro in 2002', 'Rijksdaalder was 2,50', 'Dubbeltje was 10 cent'],
            timestamp: Date.now()
        },
        
        // Voor iedereen
        {
            type: 'wat-weet-u',
            subject: 'Amsterdam',
            facts: ['Hoofdstad van Nederland', 'Veel grachten', 'Het Rijksmuseum', 'Anne Frank Huis', 'Dam en Koninklijk Paleis', 'Fietsen overal', 'Grachtengordel is UNESCO', 'Schiphol vliegveld'],
            timestamp: Date.now()
        },
        {
            type: 'wat-weet-u',
            subject: 'Sinterklaas',
            facts: ['5 december', 'Komt uit Spanje', 'Zwarte Pieten helpers', 'Rijdt op een paard', 'Heet Amerigo', 'Pepernoten en chocolade', 'Schoentje zetten', 'Surprises maken'],
            timestamp: Date.now()
        },
        
        // Collectief Geheugen vragen - Mix voor alle leeftijden
        
        // Voor jongeren (moderne kennis)
        {
            type: 'collectief-geheugen',
            category: 'Populaire Social Media Platformen',
            answers: ['Instagram', 'TikTok', 'Snapchat', 'YouTube', 'Twitter', 'Facebook', 'WhatsApp', 'Discord', 'Reddit', 'Pinterest'],
            timestamp: Date.now()
        },
        {
            type: 'collectief-geheugen',
            category: 'Netflix Series voor Jongeren',
            answers: ['Stranger Things', 'Wednesday', 'The Umbrella Academy', 'Squid Game', 'Bridgerton', 'The Crown', 'Money Heist', 'You'],
            timestamp: Date.now()
        },
        
        // Voor ouders (jaren 90/2000)
        {
            type: 'collectief-geheugen',
            category: 'Nederlandse Artiesten uit de jaren 2000',
            answers: ['Marco Borsato', 'Anouk', 'Kane', 'Volumia', 'Di-rect', 'Racoon', 'Guus Meeuwis', 'Nick & Simon', 'Lange Frans'],
            timestamp: Date.now()
        },
        {
            type: 'collectief-geheugen',
            category: 'Klassieke Disney Films',
            answers: ['De Leeuwenkoning', 'Aladdin', 'Doornroosje', 'Sneeuwwitje', 'Assepoester', 'Peter Pan', 'Bambi', 'Pinocchio'],
            timestamp: Date.now()
        },
        
        // Voor opa en oma (klassieke kennis)
        {
            type: 'collectief-geheugen',
            category: 'Nederlandse Koningen en Koninginnen',
            answers: ['Willem-Alexander', 'Beatrix', 'Juliana', 'Wilhelmina', 'Willem III', 'Willem II', 'Willem I'],
            timestamp: Date.now()
        },
        {
            type: 'collectief-geheugen',
            category: 'Klassieke Nederlandse Zangers',
            answers: ['Willy Alberti', 'Willeke Alberti', 'André Hazes', 'Toon Hermans', 'Wim Sonneveld', 'Ramses Shaffy', 'Conny Vandenbos'],
            timestamp: Date.now()
        },
        
        // Voor iedereen (algemene kennis)
        {
            type: 'collectief-geheugen',
            category: 'Nederlandse Provincies',
            answers: ['Noord-Holland', 'Zuid-Holland', 'Utrecht', 'Gelderland', 'Overijssel', 'Flevoland', 'Friesland', 'Groningen', 'Drenthe', 'Zeeland', 'Noord-Brabant', 'Limburg'],
            timestamp: Date.now()
        },
        {
            type: 'collectief-geheugen',
            category: 'Maanden van het Jaar',
            answers: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
            timestamp: Date.now()
        },
        {
            type: 'collectief-geheugen',
            category: 'Kleuren van de Regenboog',
            answers: ['Rood', 'Oranje', 'Geel', 'Groen', 'Blauw', 'Indigo', 'Violet'],
            timestamp: Date.now()
        },
        {
            type: 'collectief-geheugen',
            category: 'Europese Hoofdsteden',
            answers: ['Amsterdam', 'Berlijn', 'Parijs', 'Londen', 'Rome', 'Madrid', 'Brussel', 'Wenen', 'Kopenhagen', 'Stockholm', 'Oslo', 'Lissabon'],
            timestamp: Date.now()
        }
    ];
    
    try {
        const questionsRef = ref(db, 'questions');
        for (const question of defaultQuestions) {
            const newQuestionRef = push(questionsRef);
            await set(newQuestionRef, question);
        }
        console.log('Default questions added successfully!');
    } catch (error) {
        console.error('Error adding default questions:', error);
    }
}
