/* * Designed & Developed by Sagar Raj
 * Version 49: Definitive Aether Blue Hub Script (Fully Restored & Stable)
 * This script orchestrates all functionality for the main application hub.
 */

// --- Firebase Imports ---
// This script relies on firebase-init.js to handle the actual connection and
// to fire an event when the connection is ready.
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Ad System Resources ---
// A centralized object for all ad codes and links for easy management and future updates.
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
    }
};

// --- DOM Element Cache ---
// Caching all DOM elements on startup for faster access and better performance.
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
    websiteFrame: document.getElementById('website-frame'),
    iframeLoader: document.getElementById('iframe-loader'),
    commandCenterBtn: document.getElementById('command-center-btn'),
    sidePanel: document.getElementById('side-panel'),
    sidePanelNav: document.getElementById('side-panel-nav'),
    calculator: document.getElementById('calculator'),
    calcHeader: document.getElementById('calc-header'),
    calcDisplay: document.getElementById('calc-display'),
    calcButtons: document.getElementById('calc-buttons'),
    notesWidget: document.getElementById('mini-notes'),
    notesHeader: document.getElementById('notes-header'),
    notesTextarea: document.getElementById('notes-textarea'),
    supportUsBtn: document.getElementById('support-us-btn'),
    backToMainBtn: document.getElementById('back-to-main-btn'),
    persistentAdBanner: document.getElementById('persistent-ad-banner'),
    adGrid: document.getElementById('ad-grid'),
    searchBar: document.getElementById('search-bar'),
    categoryFilter: document.querySelector('.category-filter'),
    noResultsMessage: document.getElementById('no-results-message'),
    playGameBtn: document.getElementById('play-game-btn'),
    popunderContainer: document.getElementById('popunder-container'),
    notificationContainer: document.getElementById('notification-container'),
};

// --- App State ---
// Centralized state management for the application.
const appState = {
    db: null,
    auth: null,
    userId: null,
    popunderTriggered: false,
    iframeHistory: [],
    currentUrl: '',
    inactivityTimer: null,
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
 * Tracks user data (device, last visit) and saves it to Firestore.
 */
const trackUserData = async () => {
    if (!appState.db || !appState.userId) return;
    try {
        const getDeviceType = () => {
            const ua = navigator.userAgent;
            if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
            if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile";
            return "Desktop";
        };
        const userDocRef = doc(appState.db, "users", appState.userId);
        await setDoc(userDocRef, {
            id: appState.userId,
            device: { type: getDeviceType(), os: navigator.platform },
            lastVisited: serverTimestamp(),
        }, { merge: true });
    } catch (error) {
        console.error("Failed to track user data:", error);
    }
};

// --- Ad System ---

/**
 * Dynamically injects an ad script into a container.
 * @param {HTMLElement} container The container element.
 * @param {object} adConfig The ad configuration.
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
 * Loads all primary ads for the application.
 */
const loadAds = () => {
    injectAdScript(allDOMElements.persistentAdBanner, ads.bottomBar);
    injectAdScript(allDOMElements.adGrid, ads.bigBar);
};

/**
 * Sets up a one-time listener to trigger the popunder ad on first user interaction.
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
 * Shows the interstitial ad modal. This is ONLY called by user actions.
 * @param {string} targetUrl The URL to navigate to after the ad.
 */
const showInterstitialAd = (targetUrl) => {
    const { interstitialAdModal, skipAdButton, closeAdModalBtn } = allDOMElements;
    injectAdScript(allDOMElements.interstitialAdContainer, ads.bigBar);
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

// --- Main Hub Logic & Feature Restoration ---

/**
 * Toggles the visibility of the main views.
 * @param {string} viewId ID of the view to show.
 */
const showView = (viewId) => {
    ['main-view', 'support-view', 'app-view'].forEach(id => {
        document.getElementById(id)?.classList.toggle('hidden', id !== viewId);
    });
    allDOMElements.commandCenterBtn?.classList.toggle('visible', viewId === 'app-view');
};

/**
 * Loads a URL into the iFrame for the embedded course view.
 * @param {string} url The URL to load.
 * @param {boolean} setLoginTimestamp Whether to set the 36-hour login timestamp.
 */
const launchSite = (url, setLoginTimestamp) => {
    if (setLoginTimestamp) localStorage.setItem('sagarRajLoginTimestamp', Date.now().toString());
    if (url !== appState.currentUrl && appState.currentUrl) {
        appState.iframeHistory.push(appState.currentUrl);
    }
    appState.currentUrl = url;
    allDOMElements.websiteFrame.src = 'about:blank';
    setTimeout(() => {
        allDOMElements.websiteFrame.src = url;
        showView('app-view');
        allDOMElements.iframeLoader.style.display = 'block';
    }, 50);
};

/**
 * Navigates back in the iFrame history or returns to the main hub.
 */
const navigateBack = () => {
    if (appState.iframeHistory.length > 0) {
        const prevUrl = appState.iframeHistory.pop();
        appState.currentUrl = prevUrl;
        allDOMElements.websiteFrame.src = prevUrl;
        allDOMElements.iframeLoader.style.display = 'block';
    } else {
        showView('main-view');
        allDOMElements.websiteFrame.src = 'about:blank';
        appState.currentUrl = '';
    }
};

/**
 * Makes an element draggable by its header.
 * @param {HTMLElement} elmnt The element to drag.
 * @param {HTMLElement} header The header element to drag by.
 */
const makeDraggable = (elmnt, header) => {
    let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
    const dragHeader = header.querySelector('.fa-arrows-alt') || header;
    dragHeader.onmousedown = e => {
        e.preventDefault();
        p3 = e.clientX;
        p4 = e.clientY;
        document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
        document.onmousemove = e => {
            p1 = p3 - e.clientX; p2 = p4 - e.clientY;
            p3 = e.clientX; p4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - p2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - p1) + "px";
        };
    };
};

/**
 * Sets up the main login button based on the stored timestamp.
 */
const setupLoginButton = () => {
    const isLoggedIn = (Date.now() - parseInt(localStorage.getItem('sagarRajLoginTimestamp') || '0', 10)) < (36 * 60 * 60 * 1000);
    allDOMElements.loginButtonArea.innerHTML = isLoggedIn
        ? `<button class="styled-button" id="continue-study-btn">Continue Study</button>`
        : `<button class="styled-button" id="login-btn">Login for 36 Hours</button>`;
    
    document.getElementById('continue-study-btn')?.addEventListener('click', () => launchSite('https://www.rolexcoderz.xyz/Course', false));
    document.getElementById('login-btn')?.addEventListener('click', () => launchSite('https://rolexcoderz.live/36xsuccess/', true));
};

/**
 * Filters the dashboard cards based on search and category.
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
    allDOMElements.websiteFrame.addEventListener('load', () => { allDOMElements.iframeLoader.style.display = 'none'; });
    allDOMElements.searchBar.addEventListener('input', filterDashboard);
    allDOMElements.categoryFilter.addEventListener('click', (e) => {
        if (e.target.matches('.category-btn')) {
            allDOMElements.categoryFilter.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            filterDashboard();
        }
    });

    // ** RESTORED **: Command Center and Side Panel Logic
    allDOMElements.commandCenterBtn.addEventListener('click', () => {
        allDOMElements.commandCenterBtn.classList.toggle('open');
        allDOMElements.sidePanel.classList.toggle('visible');
    });

    allDOMElements.sidePanelNav.addEventListener('click', (e) => {
        const target = e.target.closest('.side-panel-button');
        if (!target) return;
        allDOMElements.commandCenterBtn.classList.remove('open');
        allDOMElements.sidePanel.classList.remove('visible');
        switch (target.id) {
            case 'side-panel-back-btn': navigateBack(); break;
            case 'side-panel-calculator-btn': allDOMElements.calculator.style.display = 'block'; break;
            case 'side-panel-notes-btn': allDOMElements.notesWidget.style.display = 'flex'; break;
            case 'side-panel-exit-btn': showView('main-view'); allDOMElements.websiteFrame.src = 'about:blank'; appState.currentUrl = ''; appState.iframeHistory = []; break;
        }
    });

    // ** RESTORED **: Widget Logic
    makeDraggable(allDOMElements.calculator, allDOMElements.calcHeader);
    makeDraggable(allDOMElements.notesWidget, allDOMElements.notesHeader);

    // ** FIX **: Smoothly transition from loader to main view
    setTimeout(() => {
        allDOMElements.loaderOverlay.classList.add('hidden');
        allDOMElements.mainView.classList.remove('hidden');
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
