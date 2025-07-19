/* * Designed & Developed by Sagar Raj
 * Version 35: Definitive Ad System & Revenue Maximization
 */

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyC8kXafslLM647EOpzZZ3F7oVoaa0u8ieo",
    authDomain: "padhailikhai-app.firebaseapp.com",
    projectId: "padhailikhai-app",
    storageBucket: "padhailikhai-app.appspot.com",
    messagingSenderId: "205786528118",
    appId: "1:205786528118:web:2f09f0a2073144f3846257",
    measurementId: "G-4MGMPE2DYV"
};

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

// --- App State ---
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
    const lastLogin = localStorage.getItem('sagarRajLoginTimestamp');
    if (!lastLogin) return false;
    return (Date.now() - parseInt(lastLogin, 10)) < (36 * 60 * 60 * 1000);
};

const showView = (viewId) => {
    ['main-view', 'app-view', 'support-view'].forEach(id => {
        document.getElementById(id)?.classList.toggle('hidden', id !== viewId);
    });
    allDOMElements.commandCenterBtn?.classList.toggle('visible', viewId === 'app-view');
    allDOMElements.rightAdBar?.classList.toggle('visible-view', viewId === 'app-view');
};

const launchSite = (url, setLoginTimestamp) => {
    if (setLoginTimestamp) localStorage.setItem('sagarRajLoginTimestamp', Date.now().toString());
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

// ** THE FIX **: Centralized function to load all ads strategically.
const loadAds = () => {
    // Layer 1: Always-On Ads
    // Ad 1: Bottom Bar (320x50)
    allDOMElements.persistentAdBanner.innerHTML = `<script type="text/javascript">atOptions = { 'key' : '7f09cc75a479e1c1557ae48261980b12', 'format' : 'iframe', 'height' : 50, 'width' : 320, 'params' : {} };<\/script><script type="text/javascript" src="//www.highperformanceformat.com/7f09cc75a479e1c1557ae48261980b12/invoke.js"><\/script>`;
    
    // Ad 3: Social Bar (Aggressive pop-under/redirect) - Loaded into the body
    const socialBarScript = document.createElement('script');
    socialBarScript.type = 'text/javascript';
    socialBarScript.src = '//pl27121918.profitableratecpm.com/f4/35/c9/f435c96959f348c08e52ceb50abf087e.js';
    document.body.appendChild(socialBarScript);

    // Layer 2: High-Engagement Ads
    // Ad 2: Big Bar (300x250) for the right-side panel
    allDOMElements.rightAdContent.innerHTML = `<div class="ad-slot ad-slot-300x250"><script type="text/javascript">atOptions = { 'key' : 'de366f663355ebaa73712755e3876ab8', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };<\/script><script type="text/javascript" src="//www.highperformanceformat.com/de366f663355ebaa73712755e3876ab8/invoke.js"><\/script></div>`;

    // Ad Grid for "Support Us" page, combining the Big Bar and the one valid Native Banner
    allDOMElements.adGrid.innerHTML = `
        <div class="ad-slot ad-slot-300x250"><script type="text/javascript">atOptions = { 'key' : 'de366f663355ebaa73712755e3876ab8', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };<\/script><script type="text/javascript" src="//www.highperformanceformat.com/de366f663355ebaa73712755e3876ab8/invoke.js"><\/script></div>
        <div class="ad-slot ad-slot-container-div"><script async="async" data-cfasync="false" src="//pl27121901.profitableratecpm.com/5a3a56f258731c59b0ae000546a15e25/invoke.js"><\/script><div id="container-5a3a56f258731c59b0ae000546a15e25"></div></div>`;
};

const showInterstitialAd = (targetUrl, setLoginTimestamp) => {
    const { interstitialAdModal, interstitialAdContainer, skipAdButton, closeAdModalBtn } = allDOMElements;
    interstitialAdModal.classList.add('visible');
    interstitialAdContainer.innerHTML = '';
    
    // Ad 2: Big Bar (300x250) in the interstitial, as requested
    const adScriptContainer = document.createElement('div');
    adScriptContainer.innerHTML = `<script type="text/javascript">atOptions = { 'key' : 'de366f663355ebaa73712755e3876ab8', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };<\/script><script type="text/javascript" src="//www.highperformanceformat.com/de366f663355ebaa73712755e3876ab8/invoke.js"><\/script>`;
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
    };
    skipAdButton.onclick = () => {
        if (!skipAdButton.disabled) {
            closeFunction();
            if (targetUrl) launchSite(targetUrl, setLoginTimestamp);
        }
    };
    closeAdModalBtn.onclick = closeFunction;
};

const setupLoginButton = () => {
    allDOMElements.loginButtonArea.innerHTML = '';
    if (checkLoginStatus()) {
        allDOMElements.loginButtonArea.innerHTML = `
            <button class="styled-button" id="continue-study-btn">Continue Study</button>
            <button class="styled-button support-button" id="force-login-btn">Force Login</button>`;
        document.getElementById('continue-study-btn').onclick = () => showInterstitialAd('https://www.rolexcoderz.xyz/Course', false);
        document.getElementById('force-login-btn').onclick = () => showInterstitialAd('https://rolexcoderz.live/36xsuccess/', true);
    } else {
        allDOMElements.loginButtonArea.innerHTML = `<button class="styled-button" id="login-btn">Login for 36 Hours</button>`;
        document.getElementById('login-btn').onclick = () => showInterstitialAd('https://rolexcoderz.live/36xsuccess/', true);
    }
};

const makeDraggable = (elmnt, header) => {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const dragHeader = header.querySelector('.fa-arrows-alt') || header;
    dragHeader.onmousedown = dragMouseDown;
    function dragMouseDown(e) { e.preventDefault(); pos3 = e.clientX; pos4 = e.clientY; document.onmouseup = closeDragElement; document.onmousemove = elementDrag; }
    function elementDrag(e) { pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY; elmnt.style.top = (elmnt.offsetTop - pos2) + "px"; elmnt.style.left = (elmnt.offsetLeft - pos1) + "px"; }
    function closeDragElement() { document.onmouseup = null; document.onmousemove = null; }
};

const handleCalculator = () => {
    allDOMElements.calcButtons.addEventListener('click', (e) => {
        const target = e.target.closest('.calc-btn');
        if (!target) return;
        const key = target.textContent;
        const display = allDOMElements.calcDisplay;
        if (key === 'C') { display.value = ''; } 
        else if (key === '=') { try { display.value = new Function('return ' + display.value.replace(/[^-()\d/*+.]/g, ''))(); } catch { display.value = 'Error'; } } 
        else { if (display.value === 'Error') display.value = ''; display.value += key; }
    });
};

const filterDashboard = () => {
    const searchTerm = allDOMElements.searchBar.value.toLowerCase().trim();
    const activeCategory = allDOMElements.categoryFilter.querySelector('.active').dataset.category;
    let resultsFound = false;
    document.querySelectorAll('#dashboard-grid .content-card').forEach(card => {
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
    const directAdLinks = [
        'https://www.profitableratecpm.com/z3cci824?key=3ad08b148f03cc313b5357f5e120feaf',
        'https://www.profitableratecpm.com/ezn24hhv5?key=a7daf987a4d652e9dfb0fd1fe4cd1cd5'
    ];
    const overlay = allDOMElements.directAdOverlay;
    if (!overlay) return;
    const activateAd = () => {
        overlay.classList.add('active');
        setTimeout(() => overlay.classList.remove('active'), 10000);
    };
    overlay.addEventListener('click', () => {
        window.open(directAdLinks[Math.floor(Math.random() * directAdLinks.length)], '_blank');
        overlay.classList.remove('active');
    });
    setInterval(activateAd, Math.random() * 20000 + 25000);
};

// --- App Initialization Sequence ---
async function main() {
    try {
        const app = initializeApp(firebaseConfig);
        getAnalytics(app);
        appState.db = getFirestore(app);
        appState.auth = getAuth(app);
        
        const userCredential = await signInAnonymously(appState.auth);
        appState.userId = userCredential.user.uid;
        
        setTimeout(() => {
            allDOMElements.loaderOverlay.classList.add('hidden');
            allDOMElements.telegramModal.classList.add('visible');
            trackUserData();
        }, 1500);

    } catch (error) {
        console.error("Firebase Initialization Error:", error);
        showNotification("Could not connect to app services. Please check your connection and refresh.", "error");
        allDOMElements.loaderOverlay.innerHTML = `<div style="text-align: center; color: white;"><p>Connection Failed</p><button id="retry-btn" class="styled-button support-button" style="margin-top: 20px;">Retry</button></div>`;
        document.getElementById('retry-btn').onclick = () => window.location.reload();
    }
}

// --- Main Execution Block ---
document.addEventListener('DOMContentLoaded', () => {
    main();

    allDOMElements.closeTelegramModal.onclick = () => {
        allDOMElements.telegramModal.classList.remove('visible');
        if (!localStorage.getItem('sagarRajUserInfo')) {
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
        localStorage.setItem('sagarRajUserInfo', JSON.stringify(userInfo));
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
            case 'side-panel-exit-btn': showView('main-view'); allDOMElements.websiteFrame.src = 'about:blank'; appState.iframeHistory = []; appState.currentUrl = ''; break;
            case 'side-panel-back-btn': navigateBack(); break;
            case 'side-panel-profile-btn': launchSite('https://fibergoddev.github.io/Sagar-Projects/Cont/profile.html', false); break;
            case 'side-panel-game-btn': showInterstitialAd('game.html', false); break;
            case 'side-panel-calculator-btn': allDOMElements.calculator.classList.toggle('visible'); break;
            case 'side-panel-notes-btn': allDOMElements.notesWidget.classList.toggle('visible'); break;
            case 'side-panel-focus-btn': allDOMElements.focusOverlay.classList.toggle('active'); button.querySelector('i').classList.toggle('fa-eye-slash'); break;
            case 'side-panel-permissions-btn': allDOMElements.permissionsModal.classList.add('visible'); break;
        }
    });
    allDOMElements.closePermissionsModal.addEventListener('click', () => allDOMElements.permissionsModal.classList.remove('visible'));
    allDOMElements.grantCameraBtn.addEventListener('click', async () => {
        try { await navigator.mediaDevices.getUserMedia({ video: true }); showNotification('Camera permission granted!', 'success'); } catch (err) { showNotification('Camera permission was denied.', 'error'); }
    });
    allDOMElements.grantNotifyBtn.addEventListener('click', async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') { showNotification('Notifications are now enabled.', 'success'); new Notification('Thank you!', { body: 'You will receive updates from PadhaiLikhai.' }); } else { showNotification('Notification permission was denied.', 'error'); }
        } catch (err) { showNotification('Could not request notification permission.', 'error'); }
    });
    allDOMElements.notesTextarea.value = localStorage.getItem('sagarRajNotes') || '';
    allDOMElements.notesTextarea.addEventListener('keyup', () => localStorage.setItem('sagarRajNotes', allDOMElements.notesTextarea.value));
    allDOMElements.searchBar.addEventListener('input', filterDashboard);
    allDOMElements.categoryFilter.addEventListener('click', (e) => {
        if (e.target.matches('.category-btn')) {
            allDOMElements.categoryFilter.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            filterDashboard();
        }
    });
    allDOMElements.playGameBtn.addEventListener('click', () => showInterstitialAd('game.html', false));
    allDOMElements.booksSectionLink.href = 'https://www.profitableratecpm.com/z3cci824?key=3ad08b148f03cc313b5357f5e120feaf';
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
