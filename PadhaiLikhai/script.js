/* * Designed & Developed by Sagar Raj
 * Version 51: Definitive Professional Upgrade & Final Fixes
 * This script orchestrates all functionality for the main application hub.
 */

// --- Firebase Imports ---
// This script relies on firebase-init.js to handle the actual connection and
// to fire an event when the connection is ready.
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
    telegramModal: document.getElementById('telegram-modal'),
    closeTelegramModal: document.getElementById('close-telegram-modal'),
    websiteFrame: document.getElementById('website-frame'),
    iframeLoader: document.getElementById('iframe-loader'),
    commandCenterBtn: document.getElementById('command-center-btn'),
    sidePanel: document.getElementById('side-panel'),
    sidePanelNav: document.getElementById('side-panel-nav'),
    rightAdBar: document.getElementById('right-ad-bar'),
    adBarToggle: document.getElementById('ad-bar-toggle'),
    rightAdContent: document.getElementById('right-ad-content'),
    supportUsBtn: document.getElementById('support-us-btn'),
    backToMainBtn: document.getElementById('back-to-main-btn'),
    persistentAdBanner: document.getElementById('persistent-ad-banner'),
    nativeAdContainer: document.getElementById('native-ad-container'),
    adGrid: document.getElementById('ad-grid'),
    searchBar: document.getElementById('search-bar'),
    categoryFilter: document.querySelector('.category-filter'),
    noResultsMessage: document.getElementById('no-results-message'),
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
};

// --- Core Functions ---

/**
 * Toggles the visibility of the main views in the SPA.
 * @param {string} viewId ID of the view to show ('main-view', 'app-view', 'support-view').
 */
const showView = (viewId) => {
    ['main-view', 'support-view', 'app-view'].forEach(id => {
        document.getElementById(id)?.classList.toggle('hidden', id !== viewId);
    });
    allDOMElements.commandCenterBtn?.classList.toggle('visible', viewId === 'app-view');
    allDOMElements.rightAdBar?.classList.toggle('visible-view', viewId === 'app-view');
};

// --- Ad System & Monetization ---

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
 * Injects the native banner ad into its dedicated container.
 * @param {HTMLElement} container The container element.
 * @param {object} adConfig The ad configuration.
 */
const injectNativeAd = (container, adConfig) => {
    if (!container) return;
    container.innerHTML = '';
    const nativeScript = document.createElement('script');
    nativeScript.async = true;
    nativeScript.dataset.cfasync = "false";
    nativeScript.src = adConfig.invoke;
    const nativeDiv = document.createElement('div');
    nativeDiv.id = adConfig.containerId;
    container.appendChild(nativeScript);
    container.appendChild(nativeDiv);
};

/**
 * Loads all primary ads for the application into their designated slots.
 */
const loadAds = () => {
    injectAdScript(allDOMElements.persistentAdBanner, ads.bottomBar);
    injectAdScript(allDOMElements.adGrid, ads.bigBar);
    injectAdScript(allDOMElements.rightAdContent, ads.bigBar);
    injectNativeAd(allDOMElements.nativeAdContainer, ads.nativeBanner);
};

/**
 * Sets up a one-time listener to trigger the popunder ad on the first user interaction.
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
 * ** FIXED **: Shows the interstitial ad modal and executes a callback function upon completion.
 * This is the core of the new, monetized navigation flow.
 * @param {Function} onAdCompleteCallback The function to execute after the ad is skipped or closed.
 */
const showInterstitialAd = (onAdCompleteCallback) => {
    const { interstitialAdModal, skipAdButton, closeAdModalBtn } = allDOMElements;
    // ** FIX **: Ensure the big bar ad is correctly injected every time.
    injectAdScript(allDOMElements.interstitialAdContainer, ads.bigBar);
    interstitialAdModal.classList.add('visible');
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

    const closeFunction = () => {
        clearInterval(timerInterval);
        interstitialAdModal.classList.remove('visible');
        if (typeof onAdCompleteCallback === 'function') {
            onAdCompleteCallback();
        }
    };

    skipAdButton.onclick = () => !skipAdButton.disabled && closeFunction();
    closeAdModalBtn.onclick = closeFunction;
};

// --- Advanced Features & UI Logic ---

/**
 * Loads a URL into the iFrame for the embedded course view.
 * @param {string} url The URL to load.
 * @param {boolean} setLoginTimestamp Whether to set the 36-hour login timestamp.
 */
const launchSite = (url, setLoginTimestamp = false) => {
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
 * Sets up the main login button based on the stored timestamp.
 */
const setupLoginButton = () => {
    const isLoggedIn = (Date.now() - parseInt(localStorage.getItem('sagarRajLoginTimestamp') || '0', 10)) < (36 * 60 * 60 * 1000);
    allDOMElements.loginButtonArea.innerHTML = isLoggedIn
        ? `<button class="styled-button" data-action="launchLogin" data-url="https://www.rolexcoderz.xyz/Course">Continue Study</button>`
        : `<button class="styled-button" data-action="launchLogin" data-url="https://rolexcoderz.live/36xsuccess/" data-set-timestamp="true">Login for 36 Hours</button>`;
};

/**
 * ** RESTORED **: Shows the Telegram modal if it hasn't been shown in the current session.
 */
const handleTelegramModal = () => {
    if (sessionStorage.getItem('telegramModalShown')) return;
    allDOMElements.telegramModal.classList.add('visible');
    allDOMElements.closeTelegramModal.onclick = () => {
        allDOMElements.telegramModal.classList.remove('visible');
        sessionStorage.setItem('telegramModalShown', 'true');
    };
};

/**
 * ** RESTORED **: Initializes the dynamic live user count on the dashboard cards.
 */
const initializeLiveUserCounts = () => {
    const countElements = document.querySelectorAll('.live-user-count span');
    if (countElements.length === 0) return;
    const updateCounts = () => {
        countElements.forEach(el => {
            el.textContent = Math.floor(Math.random() * 40) + 10;
        });
    };
    updateCounts();
    setInterval(updateCounts, 3500);
};

/**
 * ** ADVANCED **: A professional debounce function to prevent excessive function calls.
 * @param {Function} func The function to debounce.
 * @param {number} delay The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
};

/**
 * Filters the dashboard cards based on search and category.
 */
const filterDashboard = () => {
    const searchTerm = allDOMElements.searchBar.value.toLowerCase().trim();
    const activeCategory = allDOMElements.categoryFilter.querySelector('.active').dataset.category;
    document.querySelectorAll('#dashboard-grid .content-card, #dashboard-grid a.content-card').forEach(card => {
        const keywords = card.dataset.keywords.toLowerCase();
        const category = card.dataset.category;
        const categoryMatch = activeCategory === 'all' || category === activeCategory;
        const searchMatch = searchTerm === '' || keywords.includes(searchTerm);
        card.style.display = (categoryMatch && searchMatch) ? 'flex' : 'none';
    });
};

// --- App Initialization Sequence ---

/**
 * The main function that runs after Firebase is successfully initialized.
 */
function initializeMainApp() {
    loadAds();
    initializePopunder();
    setupLoginButton();
    initializeLiveUserCounts();

    // Attach all primary event listeners
    allDOMElements.supportUsBtn.addEventListener('click', () => showView('support-view'));
    allDOMElements.backToMainBtn.addEventListener('click', () => showView('main-view'));
    allDOMElements.websiteFrame.addEventListener('load', () => { allDOMElements.iframeLoader.style.display = 'none'; });
    
    // ** FIX **: Right Ad Slider Logic
    allDOMElements.adBarToggle.addEventListener('click', () => allDOMElements.rightAdBar.classList.toggle('expanded'));
    
    // ** ADVANCED **: Debounced search for a smoother experience
    allDOMElements.searchBar.addEventListener('input', debounce(filterDashboard, 300));
    
    allDOMElements.categoryFilter.addEventListener('click', (e) => {
        if (e.target.matches('.category-btn')) {
            allDOMElements.categoryFilter.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            filterDashboard();
        }
    });

    // ** Definitive Event Delegation for all button actions **
    document.body.addEventListener('click', (e) => {
        const targetButton = e.target.closest('[data-action]');
        if (!targetButton) return;

        e.preventDefault(); // Prevent default link behavior if any
        const { action, url, setTimestamp } = targetButton.dataset;

        const actionCallback = () => {
            if (action === 'launch') {
                launchSite(url, false);
            } else if (action === 'launchLogin') {
                launchSite(url, setTimestamp === 'true');
            }
        };

        if (action.startsWith('launch')) {
            showInterstitialAd(actionCallback);
        }
    });

    // Side Panel Logic
    allDOMElements.commandCenterBtn.addEventListener('click', () => allDOMElements.sidePanel.classList.toggle('visible'));
    allDOMElements.sidePanelNav.addEventListener('click', (e) => {
        const target = e.target.closest('.side-panel-button');
        if (!target) return;
        allDOMElements.sidePanel.classList.remove('visible');
        if (target.id === 'side-panel-back-btn') navigateBack();
        if (target.id === 'side-panel-exit-btn') {
            showView('main-view');
            allDOMElements.websiteFrame.src = 'about:blank';
            appState.currentUrl = '';
            appState.iframeHistory = [];
        }
    });

    // Smoothly transition from loader to main view and show Telegram modal
    setTimeout(() => {
        allDOMElements.loaderOverlay.classList.add('hidden');
        allDOMElements.mainView.classList.remove('hidden');
        handleTelegramModal();
    }, 500);
}

// --- Main Execution Block ---
document.addEventListener('firebaseReady', (e) => {
    appState.db = e.detail.db;
    appState.userId = e.detail.userId;
    initializeMainApp();
});

document.addEventListener('firebaseFailed', (e) => {
    allDOMElements.loaderStatus.textContent = "Connection Failed. Please Refresh.";
});
