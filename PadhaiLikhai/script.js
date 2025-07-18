/* * PadhaiLikhai - Professional Application Engine
 * Developed by a 20-Year Full-Stack Veteran
 * Version: 30.0 (Enterprise Grade)
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Application & Monetization Configuration ---
    const config = {
        urls: {
            initialLogin: 'https://rolexcoderz.live/36xsuccess/',
            study: 'https://www.rolexcoderz.xyz/Course',
            profile: 'https://fibergoddev.github.io/Sagar-Projects/Cont/profile.html',
            game: 'game.html',
        },
        adDirectLinks: {
            primary: 'https://www.profitableratecpm.com/z3cci824?key=3ad08b148f03cc313b5357f5e120feaf',
            highImpact: 'https://www.profitableratecpm.com/ezn24hhv5?key=a7daf987a4d652e9dfb0fd1fe4cd1cd5'
        },
        storageKeys: {
            loginTimestamp: 'sagarRajLoginTimestamp',
            notes: 'sagarRajNotes',
            userId: 'sagarRajUserId'
        }
    };

    // --- DOM Element Cache ---
    const DOMElements = {
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
        grantLocationBtn: document.getElementById('grant-location-btn'),
        iframeContainer: document.getElementById('iframe-container'),
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
        nativeAdContainer: document.getElementById('native-ad-container'),
        adGrid: document.getElementById('ad-grid'),
        booksSectionLink: document.getElementById('books-ad-link'),
        searchBar: document.getElementById('search-bar'),
        categoryFilter: document.querySelector('.category-filter'),
        playGameBtn: document.getElementById('play-game-btn'),
        rightAdBar: document.getElementById('right-ad-bar'),
        adBarToggle: document.getElementById('ad-bar-toggle'),
        rightAdContent: document.getElementById('right-ad-content'),
    };

    // --- State Management ---
    const appState = { iframeHistory: [] };

    // --- Loader Controls ---
    const showLoader = () => DOMElements.loaderOverlay.classList.remove('hidden');
    const hideLoader = () => DOMElements.loaderOverlay.classList.add('hidden');

    // --- Core Logic ---
    const checkLoginStatus = () => {
        const lastLogin = localStorage.getItem(config.storageKeys.loginTimestamp);
        if (!lastLogin) return false;
        return (Date.now() - parseInt(lastLogin, 10)) < (36 * 60 * 60 * 1000);
    };

    const showView = (viewId) => {
        ['main-view', 'app-view', 'support-view'].forEach(id => {
            DOMElements[id].classList.toggle('hidden', id !== viewId);
        });
        DOMElements.commandCenterBtn.classList.toggle('visible', viewId === 'app-view');
        DOMElements.persistentAdBanner.classList.toggle('hidden', viewId !== 'main-view');
        DOMElements.rightAdBar.classList.toggle('visible', viewId === 'app-view');
    };

    const setupLoginButton = () => {
        const isLoggedIn = checkLoginStatus();
        DOMElements.loginButtonArea.innerHTML = ''; 
        const buttonAction = () => handleHighImpactClick(isLoggedIn ? config.urls.study : config.urls.initialLogin, !isLoggedIn);
        
        if (isLoggedIn) {
            const continueBtn = document.createElement('button');
            continueBtn.textContent = 'Continue Study';
            continueBtn.className = 'styled-button';
            continueBtn.onclick = () => handleHighImpactClick(config.urls.study, false);
            DOMElements.loginButtonArea.appendChild(continueBtn);
        } else {
            const loginBtn = document.createElement('button');
            loginBtn.textContent = 'Login for 36 Hours';
            loginBtn.className = 'styled-button';
            loginBtn.onclick = () => handleHighImpactClick(config.urls.initialLogin, true);
            DOMElements.loginButtonArea.appendChild(loginBtn);
        }
    };

    const makeDraggable = (elmnt, header) => {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (header) header.onmousedown = dragMouseDown;
        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX; pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY;
            pos3 = e.clientX; pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }
        function closeDragElement() {
            document.onmouseup = null; document.onmousemove = null;
        }
    };

    // --- Strategic Ad System ---
    const loadAds = () => {
        // Bottom Banner Ad
        DOMElements.persistentAdBanner.innerHTML = `<script type="text/javascript"> atOptions = {'key' : '7f09cc75a479e1c1557ae48261980b12','format' : 'iframe','height' : 50,'width' : 320,'params' : {}};<\/script><script type="text/javascript" src="//www.highperformanceformat.com/7f09cc75a479e1c1557ae48261980b12/invoke.js"><\/script>`;

        // Native Banner Ad
        DOMElements.nativeAdContainer.innerHTML = `<script async="async" data-cfasync="false" src="//pl27121901.profitableratecpm.com/5a3a56f258731c59b0ae000546a15e25/invoke.js"><\/script><div id="container-5a3a56f258731c59b0ae000546a15e25"></div>`;
        
        // Support Page Grid Ads
        DOMElements.adGrid.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            const adSlot = document.createElement('div');
            adSlot.className = 'ad-slot-container-div';
            adSlot.innerHTML = `<script type="text/javascript"> atOptions = {'key' : 'de366f663355ebaa73712755e3876ab8','format' : 'iframe','height' : 250,'width' : 300,'params' : {}};<\/script><script type="text/javascript" src="//www.highperformanceformat.com/de366f663355ebaa73712755e3876ab8/invoke.js"><\/script>`;
            DOMElements.adGrid.appendChild(adSlot);
        }

        // Right Bar Ad
        DOMElements.rightAdContent.innerHTML = `<script type="text/javascript"> atOptions = {'key' : 'de366f663355ebaa73712755e3876ab8','format' : 'iframe','height' : 250,'width' : 300,'params' : {}};<\/script><script type="text/javascript" src="//www.highperformanceformat.com/de366f663355ebaa73712755e3876ab8/invoke.js"><\/script>`;
    };
    
    const handleHighImpactClick = (targetUrl, setLoginTimestamp) => {
        window.open(config.adDirectLinks.highImpact, '_blank');
        DOMElements.websiteFrame.src = targetUrl;
        if (setLoginTimestamp) localStorage.setItem(config.storageKeys.loginTimestamp, Date.now().toString());
        showView('app-view');
    };

    const triggerSocialBar = () => {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//pl27121918.profitableratecpm.com/f4/35/c9/f435c96959f348c08e52ceb50abf087e.js';
        document.head.appendChild(script);
    };

    // --- Enhanced Data Collection ---
    const getDeviceData = () => {
        const ua = navigator.userAgent;
        let os = "Unknown OS";
        if (ua.indexOf("Win") != -1) os = "Windows";
        if (ua.indexOf("Mac") != -1) os = "MacOS";
        if (ua.indexOf("Linux") != -1) os = "Linux";
        if (ua.indexOf("Android") != -1) os = "Android";
        if (ua.indexOf("like Mac") != -1) os = "iOS";

        let browser = "Unknown Browser";
        if (ua.indexOf("Chrome") != -1) browser = "Chrome";
        else if (ua.indexOf("Firefox") != -1) browser = "Firefox";
        else if (ua.indexOf("Safari") != -1) browser = "Safari";
        
        return { os, browser, userAgent: ua };
    };

    const requestLocation = () => {
        return new Promise((resolve) => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve(`${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`);
                    },
                    () => resolve('Denied'),
                    { timeout: 5000 }
                );
            } else {
                resolve('Not Supported');
            }
        });
    };

    // --- Initial Application Flow (Fail-Safe) ---
    const initializeApp = async () => {
        showLoader();
        try {
            let userId = localStorage.getItem(config.storageKeys.userId);
            if (!userId) {
                userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem(config.storageKeys.userId, userId);
            }

            const users = getAllUsers();
            const existingUser = users.find(user => user.id === userId);

            if (existingUser) {
                // Update last seen for returning user
                upsertUser({ id: userId, lastSeen: new Date().toISOString() });
                setupLoginButton();
                showView('main-view');
            } else {
                // New user, start the onboarding flow
                DOMElements.telegramModal.classList.add('visible');
            }
            loadAds();
            DOMElements.booksSectionLink.href = config.adDirectLinks.primary;
        } catch (error) {
            console.error("A critical error occurred during app initialization:", error);
            showView('main-view'); // Ensure user is never stuck
        } finally {
            setTimeout(hideLoader, 500); // Guarantees loader hides
        }
    };

    // --- Event Listeners ---
    DOMElements.closeTelegramModal.onclick = () => {
        DOMElements.telegramModal.classList.remove('visible');
        DOMElements.userInfoModal.classList.add('visible');
    };

    DOMElements.userInfoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoader();
        const deviceData = getDeviceData();
        const location = await requestLocation();
        const userInfo = {
            id: localStorage.getItem(config.storageKeys.userId),
            name: document.getElementById('user-name').value,
            class: document.getElementById('user-class').value,
            age: document.getElementById('user-age').value,
            location: location,
            ...deviceData,
            lastSeen: new Date().toISOString(),
        };
        upsertUser(userInfo);
        setupLoginButton();
        showView('main-view');
        hideLoader();
    });
    
    DOMElements.sidePanelNav.addEventListener('click', (e) => {
        const button = e.target.closest('.side-panel-button');
        if (!button) return;
        DOMElements.sidePanel.classList.remove('visible');
        DOMElements.commandCenterBtn.classList.remove('open');
        if (button.id === 'side-panel-exit-btn') {
            triggerSocialBar();
            showView('main-view');
        }
        // ... other button logic
    });

    DOMElements.grantLocationBtn.addEventListener('click', async () => {
        const location = await requestLocation();
        if(location !== 'Denied' && location !== 'Not Supported') {
            upsertUser({ id: localStorage.getItem(config.storageKeys.userId), location: location });
            alert(`Location updated: ${location}`);
        } else {
            alert(`Location permission was denied or is not supported.`);
        }
    });
    
    // Bind all other event listeners
    DOMElements.supportUsBtn.addEventListener('click', () => showView('support-view'));
    DOMElements.backToMainBtn.addEventListener('click', () => showView('main-view'));
    DOMElements.commandCenterBtn.addEventListener('click', () => {
        DOMElements.sidePanel.classList.toggle('visible');
        DOMElements.commandCenterBtn.classList.toggle('open');
    });
    DOMElements.playGameBtn.addEventListener('click', () => {
        DOMElements.websiteFrame.src = config.urls.game;
        showView('app-view');
    });
    DOMElements.closePermissionsModal.addEventListener('click', () => DOMElements.permissionsModal.classList.remove('visible'));
    
    // Initialize draggable widgets
    makeDraggable(DOMElements.notesWidget, DOMElements.notesHeader);
    makeDraggable(DOMElements.calculator, DOMElements.calcHeader);

    // Start the application
    initializeApp();
});
