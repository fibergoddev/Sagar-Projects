/* * Designed & Developed by Sagar Raj
 * Version 46: Definitive Cyberpunk Main Hub Script
 */

// --- Firebase Imports ---
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Ad System Resources ---
// Centralized object for all new ad codes and links for easy management.
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
    searchBar: document.getElementById('search-bar'),
    categoryFilter: document.querySelector('.category-filter'),
    dashboardGrid: document.getElementById('dashboard-grid'),
    noResultsMessage: document.getElementById('no-results-message'),
    playGameBtn: document.getElementById('play-game-btn'),
    rightAdBar: document.getElementById('right-ad-bar'),
    adBarToggle: document.getElementById('ad-bar-toggle'),
    rightAdContent: document.getElementById('right-ad-content'),
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
    inactivityTimer: null,
    popunderTriggered: false,
};

// --- Core Functions ---
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

const trackUserData = async (dataToUpdate = {}) => {
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
        const userData = {
            id: appState.userId,
            ...storedUserInfo,
            device,
            location: locationInfo,
            lastVisited: serverTimestamp(),
            ...dataToUpdate,
        };
        await setDoc(userDocRef, userData, { merge: true });
    } catch (error) {
        console.error("Failed to track user data:", error);
    }
};

// --- New Ad System ---
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

const loadAds = () => {
    injectAdScript(allDOMElements.persistentAdBanner, ads.bottomBar);
    const adSlot1 = document.createElement('div');
    adSlot1.className = 'ad-slot';
    const adSlot2 = document.createElement('div');
    adSlot2.className = 'ad-slot';
    allDOMElements.adGrid.innerHTML = '';
    allDOMElements.adGrid.appendChild(adSlot1);
    allDOMElements.adGrid.appendChild(adSlot2);
    injectAdScript(adSlot1, ads.bigBar);
    injectNativeAd(adSlot2, ads.nativeBanner);
    injectAdScript(allDOMElements.rightAdContent, ads.bigBar);
};

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

const showInterstitialAd = (targetUrl, setLoginTimestamp) => {
    const { interstitialAdModal, interstitialAdContainer, skipAdButton, closeAdModalBtn } = allDOMElements;
    injectAdScript(interstitialAdContainer, ads.bigBar);
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
    const closeFunction = (navigate = false) => {
        clearInterval(timerInterval);
        interstitialAdModal.classList.remove('visible');
        if (navigate && targetUrl) {
            window.location.href = targetUrl;
        }
    };
    skipAdButton.onclick = () => {
        if (!skipAdButton.disabled) {
            if (setLoginTimestamp) localStorage.setItem('sagarRajLoginTimestamp', Date.now().toString());
            closeFunction(true);
        }
    };
    closeAdModalBtn.onclick = () => closeFunction(false);
};

// --- New Dynamic UI Functions ---
const initializeLiveUserCounts = () => {
    const countElements = document.querySelectorAll('.live-user-count span');
    if (countElements.length === 0) return;
    const updateCounts = () => {
        countElements.forEach(el => {
            const count = Math.floor(Math.random() * 40) + 10;
            el.textContent = count;
        });
    };
    updateCounts(); // Initial update
    setInterval(updateCounts, 3500);
};

// --- Refactored Main Logic ---
const resetInactivityTimer = () => { clearTimeout(appState.inactivityTimer); appState.inactivityTimer = setTimeout(() => { if (allDOMElements.mainView.style.opacity !== "0") { showInterstitialAd(null, false); } }, 150000); };
const checkLoginStatus = () => { const lastLogin = localStorage.getItem('sagarRajLoginTimestamp'); if (!lastLogin) return false; return (Date.now() - parseInt(lastLogin, 10)) < (36 * 60 * 60 * 1000); };
const showView = (viewId) => { ['main-view', 'app-view', 'support-view'].forEach(id => { document.getElementById(id)?.classList.toggle('hidden', id !== viewId); }); allDOMElements.commandCenterBtn?.classList.toggle('visible', viewId === 'app-view'); allDOMElements.rightAdBar?.classList.toggle('visible-view', viewId === 'app-view'); };
const launchSite = (url, setLoginTimestamp) => { if (setLoginTimestamp) localStorage.setItem('sagarRajLoginTimestamp', Date.now().toString()); if (url !== appState.currentUrl && appState.currentUrl) appState.iframeHistory.push(appState.currentUrl); appState.currentUrl = url; allDOMElements.websiteFrame.src = 'about:blank'; setTimeout(() => { allDOMElements.websiteFrame.src = url; showView('app-view'); allDOMElements.iframeLoader.classList.add('visible'); }, 50); };
const navigateBack = () => { if (appState.iframeHistory.length > 0) { const prevUrl = appState.iframeHistory.pop(); appState.currentUrl = prevUrl; allDOMElements.websiteFrame.src = prevUrl; allDOMElements.iframeLoader.classList.add('visible'); } else { showView('main-view'); allDOMElements.websiteFrame.src = 'about:blank'; appState.currentUrl = ''; } };
const setupLoginButton = () => { allDOMElements.loginButtonArea.innerHTML = ''; if (checkLoginStatus()) { allDOMElements.loginButtonArea.innerHTML = `<button class="styled-button" id="continue-study-btn">Continue Study</button>`; } else { allDOMElements.loginButtonArea.innerHTML = `<button class="styled-button" id="login-btn">Login for 36 Hours</button>`; } document.getElementById('continue-study-btn')?.addEventListener('click', () => launchSite('https://www.rolexcoderz.xyz/Course', false)); document.getElementById('login-btn')?.addEventListener('click', () => launchSite('https://rolexcoderz.live/36xsuccess/', true)); };
const makeDraggable = (elmnt, header) => { let p1=0, p2=0, p3=0, p4=0; const dragHeader = header.querySelector('.fa-arrows-alt') || header; dragHeader.onmousedown = e => { e.preventDefault(); p3 = e.clientX; p4 = e.clientY; document.onmouseup = ()=>{document.onmouseup=null;document.onmousemove=null;}; document.onmousemove = e => { p1=p3-e.clientX; p2=p4-e.clientY; p3=e.clientX; p4=e.clientY; elmnt.style.top=(elmnt.offsetTop-p2)+"px"; elmnt.style.left=(elmnt.offsetLeft-p1)+"px"; }; }; };
const handleCalculator = () => { allDOMElements.calcButtons.addEventListener('click', (e) => { const target = e.target.closest('.calc-btn'); if (!target) return; const key = target.textContent; const display = allDOMElements.calcDisplay; if (key === 'C') { display.value = ''; } else if (key === '=') { try { display.value = new Function('return ' + display.value.replace(/[^-()\d/*+.]/g, ''))(); } catch { display.value = 'Error'; } } else { if (display.value === 'Error') display.value = ''; display.value += key; } }); };
const filterDashboard = () => { const searchTerm = allDOMElements.searchBar.value.toLowerCase().trim(); const activeCategory = allDOMElements.categoryFilter.querySelector('.active').dataset.category; let resultsFound = false; document.querySelectorAll('#dashboard-grid .content-card, #dashboard-grid a.content-card').forEach(card => { const keywords = card.dataset.keywords.toLowerCase(); const category = card.dataset.category; const categoryMatch = activeCategory === 'all' || category === activeCategory; const searchMatch = searchTerm === '' || keywords.split(' ').some(k => k.startsWith(searchTerm)); card.classList.toggle('hidden', !(categoryMatch && searchMatch)); if (categoryMatch && searchMatch) resultsFound = true; }); allDOMElements.noResultsMessage.classList.toggle('hidden', resultsFound); };

// --- App Initialization Sequence ---
function initializeMainApp() {
    trackUserData();
    loadAds();
    initializePopunder();
    initializeLiveUserCounts();
    
    allDOMElements.closeTelegramModal.onclick = () => { allDOMElements.telegramModal.classList.remove('visible'); if (!localStorage.getItem('sagarRajUserInfo')) { allDOMElements.userInfoModal.classList.add('visible'); } else { setupLoginButton(); } };
    allDOMElements.userInfoForm.addEventListener('submit', (e) => { e.preventDefault(); const userInfo = { name: document.getElementById('user-name').value, class: document.getElementById('user-class').value, age: document.getElementById('user-age').value }; localStorage.setItem('sagarRajUserInfo', JSON.stringify(userInfo)); allDOMElements.userInfoModal.classList.remove('visible'); setupLoginButton(); trackUserData(); });
    allDOMElements.websiteFrame.addEventListener('load', () => allDOMElements.iframeLoader.classList.remove('visible'));
    allDOMElements.supportUsBtn.addEventListener('click', () => { showView('support-view'); });
    allDOMElements.backToMainBtn.addEventListener('click', () => showView('main-view'));
    allDOMElements.commandCenterBtn.addEventListener('click', () => { allDOMElements.sidePanel.classList.toggle('visible'); allDOMElements.commandCenterBtn.classList.toggle('open'); });
    allDOMElements.sidePanelNav.addEventListener('click', (e) => { const target = e.target.closest('.side-panel-button'); if (!target) return; allDOMElements.sidePanel.classList.remove('visible'); allDOMElements.commandCenterBtn.classList.remove('open'); switch (target.id) { case 'side-panel-exit-btn': showView('main-view'); allDOMElements.websiteFrame.src = 'about:blank'; appState.iframeHistory = []; appState.currentUrl = ''; break; case 'side-panel-back-btn': navigateBack(); break; case 'side-panel-profile-btn': launchSite('https://fibergoddev.github.io/Sagar-Projects/Cont/profile.html', false); break; case 'side-panel-calculator-btn': allDOMElements.calculator.classList.toggle('visible'); break; case 'side-panel-notes-btn': allDOMElements.notesWidget.classList.toggle('visible'); break; case 'side-panel-focus-btn': allDOMElements.focusOverlay.classList.toggle('active'); target.querySelector('i').classList.toggle('fa-eye-slash'); break; case 'side-panel-permissions-btn': allDOMElements.permissionsModal.classList.add('visible'); break; } });
    allDOMElements.closePermissionsModal.addEventListener('click', () => allDOMElements.permissionsModal.classList.remove('visible'));
    allDOMElements.grantCameraBtn.addEventListener('click', async () => { try { await navigator.mediaDevices.getUserMedia({ video: true }); showNotification('Camera permission granted!', 'success'); } catch (err) { showNotification('Camera permission was denied.', 'error'); } });
    allDOMElements.grantNotifyBtn.addEventListener('click', async () => { try { const permission = await Notification.requestPermission(); if (permission === 'granted') { showNotification('Notifications are now enabled.', 'success'); } else { showNotification('Notification permission was denied.', 'error'); } } catch (err) { showNotification('Could not request notification permission.', 'error'); } });
    allDOMElements.notesTextarea.value = localStorage.getItem('sagarRajNotes') || '';
    allDOMElements.notesTextarea.addEventListener('keyup', () => localStorage.setItem('sagarRajNotes', allDOMElements.notesTextarea.value));
    allDOMElements.searchBar.addEventListener('input', filterDashboard);
    allDOMElements.categoryFilter.addEventListener('click', (e) => { if (e.target.matches('.category-btn')) { allDOMElements.categoryFilter.querySelector('.active').classList.remove('active'); e.target.classList.add('active'); filterDashboard(); } });
    allDOMElements.playGameBtn.addEventListener('click', () => showInterstitialAd('game.html', false));
    allDOMElements.adBarToggle.addEventListener('click', () => allDOMElements.rightAdBar.classList.toggle('expanded'));
    makeDraggable(allDOMElements.notesWidget, allDOMElements.notesHeader);
    makeDraggable(allDOMElements.calculator, allDOMElements.calcHeader);
    handleCalculator();
    filterDashboard();
    ['mousemove', 'keypress', 'scroll', 'click'].forEach(evt => window.addEventListener(evt, resetInactivityTimer));
    if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW registration failed:', err)); }); }

    setTimeout(() => {
        allDOMElements.loaderOverlay.classList.add('hidden');
        allDOMElements.telegramModal.classList.add('visible');
    }, 500);
}

// --- Main Execution Block ---
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
    allDOMElements.loaderStatus.style.color = "var(--danger-color)";
});
