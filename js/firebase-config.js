// Firebase Configuration - Using Realtime Database (Free Tier)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const firebaseConfig = {
    apiKey: "AIzaSyBrTWcFUs6c4MyzzEIzh-KcwYmWY_dqQV8",
    authDomain: "de-slimste-meijers.firebaseapp.com",
    databaseURL: "https://de-slimste-meijers-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "de-slimste-meijers",
    storageBucket: "de-slimste-meijers.firebasestorage.app",
    messagingSenderId: "969622551853",
    appId: "1:969622551853:web:d4ca22b4958f32282d67a4",
    measurementId: "G-J56PV5M5DZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { app, db };
