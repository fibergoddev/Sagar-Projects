/* * Designed & Developed by Sagar Raj
 * Version 48: Modular & Refactored Core Logic
 */

// --- Firebase Imports ---
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Module Imports ---
import { allDOMElements, showNotification, showView, setupLoginButton, filterDashboard } from './ui.js';
import { loadAds, showInterstitialAd } from './ads.js';

// --- App State ---
const appState = {
    iframeHistory: [],
    currentUrl: '',
    db: null,
    auth: null,
    userId: null,
};

// --- Core Functions ---

/**
 * Tracks user data and saves it to Firestore. Includes device type and location.
 */
const trackUserData = async () => {
    if (!appState.db || !appState.userId) return;
    try {
        const storedUserInfo = JSON.parse(localStorage.getItem('sagarRajUserInfo') || '{}');
        const getDeviceType = () => {
            const ua = navigator.userAgent;
            if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
            if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile";
            return "Desktop";
        };
        const device = { type: getDeviceType(), os: navigator.platform };
        let locationInfo = { city: "Lucknow", region: "Uttar Pradesh", country: "India" }; // Default location
        try {
            const locResponse = await fetch('https://ipapi.co/json/');
            if (locResponse.ok) {
                const locData = await locResponse.json();
                locationInfo = { ip: locData.ip, city: locData.city, region: locData.region, country: locData.country_name };
            }
        } catch (e) {
            console.warn("Could not fetch location data, using default.");
        }
        const userDocRef = doc(appState.db, "users", appState.userId);
        await setDoc(userDocRef, {
            id: appState.userId,
            ...storedUserInfo,
            device,
            location: locationInfo,
            lastVisited: serverTimestamp(),
        }, { merge: true });
    } catch (error) {
        console.error("Failed to track user data:", error);
    }
};

/**
 * Loads a URL into the iFrame for the embedded course/login view.
 * @param {string} url The URL to load.
 * @param {boolean} setLoginTimestamp Whether to set the 36-hour login timestamp.
 */
const launchSite = (url, setLoginTimestamp) => {
    if (setLoginTimestamp) localStorage.setItem('sagarRajLoginTimestamp', Date.now().toString());
    appState.currentUrl = url;
    allDOMElements.websiteFrame.src = 'about:blank';
    setTimeout(() => {
        allDOMElements.websiteFrame.src = url;
        showView('app-view');
        allDOMElements.iframeLoader.style.display = 'block';
    }, 50);
};

// --- App Initialization Sequence ---

/**
 * The main function that runs after Firebase is successfully initialized.
 */
function initializeMainApp() {
    trackUserData();
    loadAds();
    setupLoginButton();
    filterDashboard();

    // Attach all primary event listeners
    allDOMElements.supportUsBtn.addEventListener('click', () => showView('support-view'));
    allDOMElements.backToMainBtn.addEventListener('click', () => showView('main-view'));
    allDOMElements.playGameBtn.addEventListener('click', () => showInterstitialAd('game.html'));
    allDOMElements.websiteFrame.addEventListener('load', () => allDOMElements.iframeLoader.style.display = 'none');
    allDOMElements.searchBar.addEventListener('input', filterDashboard);
    allDOMElements.categoryFilter.addEventListener('click', (e) => {
        if (e.target.matches('.category-btn')) {
            allDOMElements.categoryFilter.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            filterDashboard();
        }
    });

    // Attach login button listeners
    document.getElementById('login-button-area').addEventListener('click', (e) => {
        if (e.target.id === 'continue-study-btn') {
            launchSite('https://www.rolexcoderz.xyz/Course', false);
        } else if (e.target.id === 'login-btn') {
            launchSite('https://rolexcoderz.live/36xsuccess/', true);
        }
    });


    // Hide loader and show initial modal
    setTimeout(() => {
        allDOMElements.loaderOverlay.style.display = 'none';
        // The Telegram/User Info modals are removed as they are not part of the new design.
        // The app will now show the main view directly.
    }, 500);
}

// --- Main Execution Block ---

// This listens for the custom event from firebase-init.js
document.addEventListener('firebaseReady', (e) => {
    console.log("Firebase is ready. Initializing main application.");
    const { auth, db, userId } = e.detail;
    appState.auth = auth;
    appState.db = db;
    appState.userId = userId;
    initializeMainApp();
});

document.addEventListener('firebaseFailed', (e) => {
    console.error("Firebase failed to initialize. Hub cannot start.", e.detail.error);
    allDOMElements.loaderStatus.textContent = "Connection Failed. Please Refresh.";
});
