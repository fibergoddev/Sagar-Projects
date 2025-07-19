/* * Designed & Developed by Sagar Raj
 * Version 32: Self-Initializing Module Fix
 */

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- DOM Element Cache ---
const allDOMElements = {
    loaderOverlay: document.getElementById('loader-overlay'),
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
    permissionsModal: document.getElementById('permissions-modal'),
    closePermissionsModal: document.getElementById('close-permissions-modal'),
    grantCameraBtn: document.getElementById('grant-camera-btn'),
    grantNotifyBtn: document.getElementById('grant-notify-btn'),
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
    booksSectionLink: document.getElementById('books-ad-link'),
    searchBar: document.getElementById('search-bar'),
    categoryFilter: document.querySelector('.category-filter'),
    dashboardGrid: document.getElementById('dashboard-grid'),
    noResultsMessage: document.getElementById('no-results-message'),
    playGameBtn: document.getElementById('play-game-btn'),
    rightAdBar: document.getElementById('right-ad-bar'),
    adBarToggle: document.getElementById('ad-bar-toggle'),
    rightAdContent: document.getElementById('right-ad-content'),
    directAdOverlay: document.getElementById('direct-ad-overlay'),
    notificationContainer: document.getElementById('notification-container'),
};

// --- Configuration & State ---
const initialLoginUrl = 'https://rolexcoderz.live/36xsuccess/';
const studyUrl = 'https://www.rolexcoderz.xyz/Course';
const profileUrl = 'https://fibergoddev.github.io/Sagar-Projects/Cont/profile.html';
const gameUrl = 'game.html';
const libraryAdUrl = 'https://www.profitableratecpm.com/z3cci824?key=3ad08b148f03cc313b5357f5e120feaf';
const directAdLinks = [
    'https://www.profitableratecpm.com/z3cci824?key=3ad08b148f03cc313b5357f5e120feaf',
    'https://www.profitableratecpm.com/ezn24hhv5?key=a7daf987a4d652e9dfb0fd1fe4cd1cd5'
];
const loginTimestampKey = 'sagarRajLoginTimestamp';
const userInfoKey = 'sagarRajUserInfo';
const notesKey = 'sagarRajNotes';

const appState = {
    iframeHistory: [],
    currentUrl: '',
    db: null,
    auth: null,
    userId: null,
};

// --- Core Functions ---

const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    let iconClass = 'fas fa-info-circle';
    if (type === 'success') iconClass = 'fas fa-check-circle';
    if (type === 'error') iconClass = 'fas fa-times-circle';
    notification.innerHTML = `<i class="${iconClass}"></i><span>${message}</span>`;
    allDOMElements.notificationContainer.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
};

// --- Firebase Data Collection ---
const trackUserData = async () => {
    if (!appState.db || !appState.userId) return;
    try {
        const storedUserInfo = JSON.parse(localStorage.getItem(userInfoKey) || '{}');
        const getDeviceType = () => {
            const ua = navigator.userAgent;
            if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
            if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile";
            return "Desktop";
        };
        const device = { type: getDeviceType(), os: navigator.platform };
        let location = {};
        try {
            const locResponse = await fetch('https://ipapi.co/json/');
            const locData = await locResponse.json();
            location = { city: locData.city, region: locData.region, country: locData.country_name };
        } catch (e) {
            location = { error: "Could not fetch" };
        }
        const userDocRef = doc(appState.db, "users", appState.userId);
        const userData = {
            id: appState.userId, ...storedUserInfo, device, location, lastVisited: serverTimestamp(),
        };
        await setDoc(userDocRef, userData, { merge: true });
    } catch (error) {
        console.error("Failed to track user data:", error);
    }
};

const checkLoginStatus = () => {
    const lastLogin = localStorage.getItem(loginTimestampKey);
    if (!lastLogin) return false;
    const thirtySixHours = 36 * 60 * 60 * 1000;
    return (Date.now() - parseInt(lastLogin, 10)) < thirtySixHours;
};

const showView = (viewId) => {
    ['main-view', 'app-view', 'support-view'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', id !== viewId);
    });
    allDOMElements.commandCenterBtn.classList.toggle('visible', viewId === 'app-view');
    allDOMElements.rightAdBar.classList.toggle('visible-view', viewId === 'app-view');
};

const launchSite = (url, setLoginTimestamp) => {
    if (setLoginTimestamp) localStorage.setItem(loginTimestampKey, Date.now().toString());
    if (url !== appState.currentUrl && appState.currentUrl) appState.iframeHistory.push(appState.currentUrl);
    appState.currentUrl = url;
    allDOMElements.websiteFrame.src = 'about:blank';
    setTimeout(() => {
        allDOMElements.websiteFrame.src = url;
        showView('app-view');
        allDOMElements.iframeLoader.classList.add('visible');
    }, 50);
};

const navigateBack = () => {
    if (appState.iframeHistory.length > 0) {
        const prevUrl = appState.iframeHistory.pop();
        appState.currentUrl = prevUrl;
        allDOMElements.websiteFrame.src = prevUrl;
        allDOMElements.iframeLoader.classList.add('visible');
    } else {
        showView('main-view');
        allDOMElements.websiteFrame.src = 'about:blank';
        appState.currentUrl = '';
    }
};

const showInterstitialAd = (targetUrl, setLoginTimestamp) => {
    const { interstitialAdModal, interstitialAdContainer, skipAdButton, closeAdModalBtn } = allDOMElements;
    interstitialAdModal.classList.add('visible');
    interstitialAdContainer.innerHTML = '';
    const adScriptContainer = document.createElement('div');
    const adScript1 = document.createElement('script');
    adScript1.type = 'text/javascript';
    adScript1.innerHTML = `atOptions = { 'key' : 'de366f663355ebaa73712755e3876ab8', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };`;
    const adScript2 = document.createElement('script');
    adScript2.type = 'text/javascript';
    adScript2.src = '//www.highperformanceformat.com/de366f663355ebaa73712755e3876ab8/invoke.js';
    adScriptContainer.appendChild(adScript1);
    adScriptContainer.appendChild(adScript2);
    interstitialAdContainer.appendChild(adScriptContainer);
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
        skipAdButton.onclick = null;
        closeAdModalBtn.onclick = null;
    };
    skipAdButton.onclick = () => {
        if (skipAdButton.disabled) return;
        closeFunction();
        if (targetUrl) launchSite(targetUrl, setLoginTimestamp);
    };
    closeAdModalBtn.onclick = closeFunction;
};

const setupLoginButton = () => {
    const isLoggedIn = checkLoginStatus();
    allDOMElements.loginButtonArea.innerHTML = '';
    if (isLoggedIn) {
        const continueBtn = document.createElement('button');
        continueBtn.textContent = 'Continue Study';
        continueBtn.className = 'styled-button';
        continueBtn.onclick = () => showInterstitialAd(studyUrl, false);
        const forceLoginBtn = document.createElement('button');
        forceLoginBtn.textContent = 'Force Login';
        forceLoginBtn.className = 'styled-button support-button';
        forceLoginBtn.onclick = () => showInterstitialAd(initialLoginUrl, true);
        allDOMElements.loginButtonArea.appendChild(continueBtn);
        allDOMElements.loginButtonArea.appendChild(forceLoginBtn);
    } else {
        const loginBtn = document.createElement('button');
        loginBtn.textContent = 'Login for 36 Hours';
        loginBtn.className = 'styled-button';
        loginBtn.onclick = () => showInterstitialAd(initialLoginUrl, true);
        allDOMElements.loginButtonArea.appendChild(loginBtn);
    }
};

const makeDraggable = (elmnt, header) => {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const dragHeader = header.querySelector('.fa-arrows-alt') || header;
    dragHeader.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
};

const handleCalculator = () => {
    allDOMElements.calcButtons.addEventListener('click', (e) => {
        const target = e.target.closest('.calc-btn');
        if (!target) return;
        const key = target.textContent;
        const display = allDOMElements.calcDisplay;
        if (key === 'C') {
            display.value = '';
        } else if (key === '=') {
            try {
                const result = new Function('return ' + display.value.replace(/[^-()\d/*+.]/g, ''))();
                display.value = result;
            } catch {
                display.value = 'Error';
            }
        } else {
            if (display.value === 'Error') display.value = '';
            display.value += key;
        }
    });
};

const loadAds = () => {
    const bannerContainer = allDOMElements.persistentAdBanner;
    bannerContainer.innerHTML = '';
    const adScript1 = document.createElement('script');
    adScript1.type = 'text/javascript';
    adScript1.innerHTML = `atOptions = { 'key' : '7f09cc75a479e1c1557ae48261980b12', 'format' : 'iframe', 'height' : 50, 'width' : 320, 'params' : {} };`;
    const adScript2 = document.createElement('script');
    adScript2.type = 'text/javascript';
    adScript2.src = '//www.highperformanceformat.com/7f09cc75a479e1c1557ae48261980b12/invoke.js';
    bannerContainer.appendChild(adScript1);
    bannerContainer.appendChild(adScript2);
    const adScript3 = document.createElement('script');
    adScript3.type = 'text/javascript';
    adScript3.src = '//pl27121918.profitableratecpm.com/f4/35/c9/f435c96959f348c08e52ceb50abf087e.js';
    bannerContainer.appendChild(adScript3);
    const adGrid = allDOMElements.adGrid;
    adGrid.innerHTML = '';
    const bigBarContainer = document.createElement('div');
    bigBarContainer.className = 'ad-slot ad-slot-300x250';
    const adScript4 = document.createElement('script');
    adScript4.type = 'text/javascript';
    adScript4.innerHTML = `atOptions = { 'key' : 'de366f663355ebaa73712755e3876ab8', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };`;
    const adScript5 = document.createElement('script');
    adScript5.src = '//www.highperformanceformat.com/de366f663355ebaa73712755e3876ab8/invoke.js';
    bigBarContainer.appendChild(adScript4);
    bigBarContainer.appendChild(adScript5);
    adGrid.appendChild(bigBarContainer);
    const nativeBannerContainer = document.createElement('div');
    nativeBannerContainer.className = 'ad-slot ad-slot-container-div';
    const adScript6 = document.createElement('script');
    adScript6.async = true;
    adScript6.dataset.cfasync = false;
    adScript6.src = '//pl27121901.profitableratecpm.com/5a3a56f258731c59b0ae000546a15e25/invoke.js';
    const adScript6Div = document.createElement('div');
    adScript6Div.id = 'container-5a3a56f258731c59b0ae000546a15e25';
    nativeBannerContainer.appendChild(adScript6);
    nativeBannerContainer.appendChild(adScript6Div);
    adGrid.appendChild(nativeBannerContainer);
    const rightAdContent = allDOMElements.rightAdContent;
    rightAdContent.innerHTML = '';
    const rightAdContainer = document.createElement('div');
    rightAdContainer.className = 'ad-slot ad-slot-300x250';
    const adScript7 = document.createElement('script');
    adScript7.type = 'text/javascript';
    adScript7.innerHTML = `atOptions = { 'key' : 'de366f663355ebaa73712755e3876ab8', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };`;
    const adScript8 = document.createElement('script');
    adScript8.src = '//www.highperformanceformat.com/de366f663355ebaa73712755e3876ab8/invoke.js';
    rightAdContainer.appendChild(adScript7);
    rightAdContainer.appendChild(adScript8);
    rightAdContent.appendChild(rightAdContainer);
};

const filterDashboard = () => {
    const searchTerm = allDOMElements.searchBar.value.toLowerCase().trim();
    const activeCategory = allDOMElements.categoryFilter.querySelector('.active').dataset.category;
    const cards = document.querySelectorAll('#dashboard-grid .content-card');
    let resultsFound = false;
    cards.forEach(card => {
        const keywords = card.dataset.keywords.toLowerCase();
        const category = card.dataset.category;
        const categoryMatch = activeCategory === 'all' || category === activeCategory;
        const searchMatch = searchTerm === '' || keywords.split(' ').some(k => k.startsWith(searchTerm));
        if (categoryMatch && searchMatch) {
            card.classList.remove('hidden');
            resultsFound = true;
        } else {
            card.classList.add('hidden');
        }
    });
    allDOMElements.noResultsMessage.classList.toggle('hidden', resultsFound);
};

const handleDirectAd = () => {
    const overlay = allDOMElements.directAdOverlay;
    if (!overlay) return;
    const activateAd = () => {
        overlay.classList.add('active');
        setTimeout(() => overlay.classList.remove('active'), 10000);
    };
    overlay.addEventListener('click', () => {
        const randomLink = directAdLinks[Math.floor(Math.random() * directAdLinks.length)];
        window.open(randomLink, '_blank');
        overlay.classList.remove('active');
    });
    setInterval(activateAd, Math.random() * 20000 + 25000);
};

// --- App Initialization ---
async function initializeApp() {
    // The firebaseConfig object is now expected to be on the window object
    if (typeof window.firebaseConfig === 'undefined' || !window.firebaseConfig.apiKey) {
        showNotification("Firebase is not configured correctly.", "error");
        allDOMElements.loaderOverlay.classList.add('hidden');
        return;
    }
    
    try {
        const app = initializeApp(window.firebaseConfig);
        const analytics = getAnalytics(app); // Initialize analytics
        appState.db = getFirestore(app);
        appState.auth = getAuth(app);
        
        const userCredential = await signInAnonymously(appState.auth);
        appState.userId = userCredential.user.uid;
        console.log("Firebase Anonymous Auth successful, UID:", appState.userId);
        
        // --- Start the app flow after successful auth ---
        // This is the key fix: The timeout was inside the DOMContentLoaded, but now it's part of the main flow
        setTimeout(() => {
            allDOMElements.loaderOverlay.classList.add('hidden');
            allDOMElements.telegramModal.classList.add('visible');
            trackUserData();
        }, 1500);

    } catch (error) {
        console.error("Firebase Initialization Error:", error);
        showNotification("Could not connect to app services.", "error");
        allDOMElements.loaderOverlay.classList.add('hidden');
    }
}

// ** FIX **: The main execution block.
// This ensures all code runs after the DOM is ready.
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase first.
    initializeApp();

    // Then, set up all the event listeners.
    allDOMElements.closeTelegramModal.onclick = () => {
        allDOMElements.telegramModal.classList.remove('visible');
        if (!localStorage.getItem(userInfoKey)) {
            allDOMElements.userInfoModal.classList.add('visible');
        } else {
            setupLoginButton();
        }
        showView('main-view');
        handleDirectAd();
    };

    allDOMElements.userInfoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userInfo = {
            name: document.getElementById('user-name').value,
            class: document.getElementById('user-class').value,
            age: document.getElementById('user-age').value,
        };
        localStorage.setItem(userInfoKey, JSON.stringify(userInfo));
        allDOMElements.userInfoModal.classList.remove('visible');
        setupLoginButton();
        trackUserData();
    });

    allDOMElements.websiteFrame.addEventListener('load', () => allDOMElements.iframeLoader.classList.remove('visible'));
    allDOMElements.supportUsBtn.addEventListener('click', () => showView('support-view'));
    allDOMElements.backToMainBtn.addEventListener('click', () => showView('main-view'));
    allDOMElements.commandCenterBtn.addEventListener('click', () => {
        allDOMElements.sidePanel.classList.toggle('visible');
        allDOMElements.commandCenterBtn.classList.toggle('open');
    });
    allDOMElements.sidePanelNav.addEventListener('click', (e) => {
        const button = e.target.closest('.side-panel-button');
        if (!button) return;
        allDOMElements.sidePanel.classList.remove('visible');
        allDOMElements.commandCenterBtn.classList.remove('open');
        switch (button.id) {
            case 'side-panel-exit-btn':
                showView('main-view');
                allDOMElements.websiteFrame.src = 'about:blank';
                appState.iframeHistory = [];
                appState.currentUrl = '';
                break;
            case 'side-panel-back-btn': navigateBack(); break;
            case 'side-panel-profile-btn': launchSite(profileUrl, false); break;
            case 'side-panel-game-btn': showInterstitialAd(gameUrl, false); break;
            case 'side-panel-calculator-btn': allDOMElements.calculator.classList.toggle('visible'); break;
            case 'side-panel-notes-btn': allDOMElements.notesWidget.classList.toggle('visible'); break;
            case 'side-panel-focus-btn':
                allDOMElements.focusOverlay.classList.toggle('active');
                const icon = button.querySelector('i');
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
                break;
            case 'side-panel-permissions-btn': allDOMElements.permissionsModal.classList.add('visible'); break;
        }
    });
    allDOMElements.closePermissionsModal.addEventListener('click', () => allDOMElements.permissionsModal.classList.remove('visible'));
    allDOMElements.grantCameraBtn.addEventListener('click', async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            showNotification('Camera permission granted!', 'success');
        } catch (err) {
            showNotification('Camera permission was denied.', 'error');
        }
    });
    allDOMElements.grantNotifyBtn.addEventListener('click', async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                showNotification('Notifications are now enabled.', 'success');
                new Notification('Thank you!', { body: 'You will receive updates from PadhaiLikhai.' });
            } else {
                showNotification('Notification permission was denied.', 'error');
            }
        } catch (err) {
            showNotification('Could not request notification permission.', 'error');
        }
    });
    allDOMElements.notesTextarea.value = localStorage.getItem(notesKey) || '';
    allDOMElements.notesTextarea.addEventListener('keyup', () => localStorage.setItem(notesKey, allDOMElements.notesTextarea.value));
    allDOMElements.searchBar.addEventListener('input', filterDashboard);
    allDOMElements.categoryFilter.addEventListener('click', (e) => {
        if (e.target.matches('.category-btn')) {
            allDOMElements.categoryFilter.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            filterDashboard();
        }
    });
    allDOMElements.playGameBtn.addEventListener('click', () => showInterstitialAd(gameUrl, false));
    allDOMElements.booksSectionLink.href = libraryAdUrl;
    allDOMElements.adBarToggle.addEventListener('click', () => allDOMElements.rightAdBar.classList.toggle('expanded'));

    makeDraggable(allDOMElements.notesWidget, allDOMElements.notesHeader);
    makeDraggable(allDOMElements.calculator, allDOMElements.calcHeader);
    handleCalculator();
    loadAds();
    filterDashboard();

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW registration failed:', err));
        });
    }
});
