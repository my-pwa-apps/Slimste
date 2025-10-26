// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyBrTWcFUs6c4MyzzEIzh-KcwYmWY_dqQV8",
    authDomain: "de-slimste-meijers.firebaseapp.com",
    projectId: "de-slimste-meijers",
    storageBucket: "de-slimste-meijers.firebasestorage.app",
    messagingSenderId: "969622551853",
    appId: "1:969622551853:web:d4ca22b4958f32282d67a4",
    measurementId: "G-J56PV5M5DZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
