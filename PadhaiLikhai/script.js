/* * Designed & Developed by Sagar Raj
 * Version 47: Definitive Blue Nebula Hub Script
 */

// --- Firebase Imports ---
// These are necessary for user authentication and data tracking. The actual initialization
// is handled by firebase-init.js, and this script waits for its signal.
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Ad System Resources ---
// A centralized object for all new ad codes and links for easy management and future updates.
const ads = {
    directLink: 'https://medievalkin.com/z3cci824?key=3ad08b148f03cc313b5357f5e120feaf',
    popunderScript: '//medievalkin.com/5d/2c/15/5d2c15bb87424bfe641144d764893adc.js',
    bottomBar: {
        options: { key: '7f09cc75a479e1c1557ae48261980b12', format: 'iframe', height: 50, width: 320, params: {} },
        invoke: '//www.highperformanceformat.com/7f09cc75a479e1c1557ae48261980b12/invoke.js'
    },
    bigBar: {
        options: { key: 'de366f663355ebaa73712755e3876ab8', format: 'iframe', height: 250, width: 300, params: {} },
        invoke: '//www.highperformanceformat.com/de366f663355ebaa73712755e3876ab8/invoke.js'
    },
    nativeBanner: {
        invoke: '//pl27121901.profitableratecpm.com/5a3a56f258731c59b0ae000546a15e25/invoke.js',
        containerId: 'container-5a3a56f258731c59b0ae000546a15e25'
    }
};

// --- DOM Element Cache ---
// Caching all necessary DOM elements on startup for faster access and better performance.
const allDOMElements = {
    loaderOverlay: document.getElementById('loader-overlay'),
    loaderStatus: document.getElementById('loader-status'),
    mainView: document.getElementById('main-view'),
    appView: document.getElementById('app-view'),
    supportView: document.getElementById('support-view'),
    loginButtonArea: document.getElementById('login-button-area'),
    interstitialAdModal: document.getElementById('interstitial-ad-modal'),
    interstitialAdContainer: document.getElementById('interstitial-ad-container'),
    skipAdButton: document.getElementById('skip-ad-button'),
    closeAdModalBtn: document.getElementById('close-ad-modal-btn'),
    userInfoModal: document.getElementById('user-info-modal'),
    userInfoForm: document.getElementById('user-info-form'),
    telegramModal: document.getElementById('telegram-modal'),
    closeTelegramModal: document.getElementById('close-telegram-modal'),
    websiteFrame: document.getElementById('website-frame'),
    iframeLoader: document.getElementById('iframe-loader'),
    focusOverlay: document.getElementById('focus-overlay'),
    notesWidget: document.getElementById('mini-notes'),
    notesHeader: document.getElementById('notes-header'),
    notesTextarea: document.getElementById('notes-textarea'),
    calculator: document.getElementById('calculator'),
    calcHeader: document.getElementById('calc-header'),
    calcDisplay: document.getElementById('calc-display'),
    calcButtons: document.getElementById('calc-buttons'),
    commandCenterBtn: document.getElementById('command-center-btn'),
    sidePanel: document.getElementById('side-panel'),
    sidePanelNav: document.getElementById('side-panel-nav'),
    supportUsBtn: document.getElementById('support-us-btn'),
    backToMainBtn: document.getElementById('back-to-main-btn'),
    persistentAdBanner: document.getElementById('persistent-ad-banner'),
    adGrid: document.getElementById('ad-grid'),
    searchBar: document.getElementById('search-bar'),
    categoryFilter: document.querySelector('.category-filter'),
    dashboardGrid: document.getElementById('dashboard-grid'),
    noResultsMessage: document.getElementById('no-results-message'),
    playGameBtn: document.getElementById('play-game-btn'),
    popunderContainer: document.getElementById('popunder-container'),
    notificationContainer: document.getElementById('notification-container'),
};

// --- App State ---
const appState = {
    iframeHistory: [],
    currentUrl: '',
    db: null,
    auth: null,
    userId: null,
    popunderTriggered: false,
};

// --- Core Functions ---

/**
 * Displays a temporary notification on the screen.
 * @param {string} message The message to display.
 * @param {string} type 'info', 'success', or 'error'.
 */
const showNotification = (message, type = 'info') => {
    const n = document.createElement('div');
    n.className = `notification ${type}`;
    let iconClass = 'fas fa-info-circle';
    if (type === 'success') iconClass = 'fas fa-check-circle';
    if (type === 'error') iconClass = 'fas fa-times-circle';
    n.innerHTML = `<i class="${iconClass}"></i><span>${message}</span>`;
    allDOMElements.notificationContainer.appendChild(n);
    setTimeout(() => n.remove(), 5000);
};

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

// --- Ad System ---

/**
 * Dynamically injects a standard ad script into a container.
 * @param {HTMLElement} container The container to inject the ad into.
 * @param {object} adConfig The ad configuration from the `ads` object.
 */
const injectAdScript = (container, adConfig) => {
    if (!container) return;
    container.innerHTML = '';
    const optionsScript = document.createElement('script');
    optionsScript.type = 'text/javascript';
    optionsScript.innerHTML = `atOptions = ${JSON.stringify(adConfig.options)};`;
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = adConfig.invoke;
    container.appendChild(optionsScript);
    container.appendChild(invokeScript);
};

/**
 * Loads all the main ads for the application.
 */
const loadAds = () => {
    injectAdScript(allDOMElements.persistentAdBanner, ads.bottomBar);
    const adSlot1 = document.createElement('div');
    const adSlot2 = document.createElement('div');
    allDOMElements.adGrid.innerHTML = '';
    allDOMElements.adGrid.appendChild(adSlot1);
    allDOMElements.adGrid.appendChild(adSlot2);
    injectAdScript(adSlot1, ads.bigBar);
};

/**
 * Sets up a one-time event listener to trigger the popunder ad on the first user interaction.
 */
const initializePopunder = () => {
    const triggerPopunder = () => {
        if (appState.popunderTriggered) return;
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = ads.popunderScript;
        allDOMElements.popunderContainer.appendChild(script);
        appState.popunderTriggered = true;
    };
    document.body.addEventListener('click', triggerPopunder, { once: true });
};

/**
 * Shows the interstitial ad modal before navigating to a new page.
 * @param {string} targetUrl The URL to navigate to after the ad.
 */
const showInterstitialAd = (targetUrl) => {
    const { interstitialAdModal, interstitialAdContainer, skipAdButton, closeAdModalBtn } = allDOMElements;
    injectAdScript(interstitialAdContainer, ads.bigBar);
    interstitialAdModal.classList.remove('hidden');
    let timeLeft = 4;
    skipAdButton.textContent = `Skip Ad in ${timeLeft}s`;
    skipAdButton.disabled = true;
    const timerInterval = setInterval(() => {
        timeLeft--;
        skipAdButton.textContent = `Skip Ad in ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            skipAdButton.disabled = false;
            skipAdButton.textContent = 'Skip Ad';
        }
    }, 1000);
    const closeFunction = (navigate = false) => {
        clearInterval(timerInterval);
        interstitialAdModal.classList.add('hidden');
        if (navigate && targetUrl) {
            window.location.href = targetUrl;
        }
    };
    skipAdButton.onclick = () => !skipAdButton.disabled && closeFunction(true);
    closeAdModalBtn.onclick = () => closeFunction(false);
};

// --- Main Hub Logic ---

/**
 * Toggles the visibility of different views within index.html.
 * @param {string} viewId The ID of the view to show ('main-view', 'app-view', 'support-view').
 */
const showView = (viewId) => {
    ['main-view', 'app-view', 'support-view'].forEach(id => {
        document.getElementById(id)?.classList.toggle('hidden', id !== viewId);
    });
    allDOMElements.commandCenterBtn?.classList.toggle('visible', viewId === 'app-view');
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

/**
 * Sets up the main login/continue button based on the stored timestamp.
 */
const setupLoginButton = () => {
    const isLoggedIn = (Date.now() - parseInt(localStorage.getItem('sagarRajLoginTimestamp') || '0', 10)) < (36 * 60 * 60 * 1000);
    allDOMElements.loginButtonArea.innerHTML = '';
    if (isLoggedIn) {
        allDOMElements.loginButtonArea.innerHTML = `<button class="styled-button" id="continue-study-btn">Continue Study</button>`;
    } else {
        allDOMElements.loginButtonArea.innerHTML = `<button class="styled-button" id="login-btn">Login for 36 Hours</button>`;
    }
    document.getElementById('continue-study-btn')?.addEventListener('click', () => launchSite('https://www.rolexcoderz.xyz/Course', false));
    document.getElementById('login-btn')?.addEventListener('click', () => launchSite('https://rolexcoderz.live/36xsuccess/', true));
};

/**
 * Filters the dashboard cards based on search term and category.
 */
const filterDashboard = () => {
    const searchTerm = allDOMElements.searchBar.value.toLowerCase().trim();
    const activeCategory = allDOMElements.categoryFilter.querySelector('.active').dataset.category;
    let resultsFound = false;
    document.querySelectorAll('#dashboard-grid .content-card, #dashboard-grid a.content-card').forEach(card => {
        const keywords = card.dataset.keywords.toLowerCase();
        const category = card.dataset.category;
        const categoryMatch = activeCategory === 'all' || category === activeCategory;
        const searchMatch = searchTerm === '' || keywords.includes(searchTerm);
        const isHidden = !(categoryMatch && searchMatch);
        card.classList.toggle('hidden', isHidden);
        if (!isHidden) resultsFound = true;
    });
    allDOMElements.noResultsMessage.classList.toggle('hidden', resultsFound);
};

// --- App Initialization Sequence ---

/**
 * The main function that runs after Firebase is successfully initialized.
 */
function initializeMainApp() {
    trackUserData();
    loadAds();
    initializePopunder();
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
