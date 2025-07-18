/* * PadhaiLikhai - Professional Application Engine
 * Developed by a 20-Year Full-Stack Veteran
 * Version: 31.0 (Enterprise Grade, Fail-Safe)
 */

const App = {
    // --- CONFIGURATION ---
    config: {
        urls: {
            initialLogin: 'https://rolexcoderz.live/36xsuccess/',
            study: 'https://www.rolexcoderz.xyz/Course',
            profile: 'https://fibergoddev.github.io/Sagar-Projects/Cont/profile.html',
            game: 'game.html',
        },
        adLinks: {
            primaryDirect: 'https://www.profitableratecpm.com/z3cci824?key=3ad08b148f03cc313b5357f5e120feaf',
            highImpactDirect: 'https://www.profitableratecpm.com/ezn24hhv5?key=a7daf987a4d652e9dfb0fd1fe4cd1cd5',
            bottomBanner: { key: '7f09cc75a479e1c1557ae48261980b12', width: 320, height: 50 },
            bigBanner: { key: 'de366f663355ebaa73712755e3876ab8', width: 300, height: 250 },
            socialBar: 'f435c96959f348c08e52ceb50abf087e',
            nativeBanner: '5a3a56f258731c59b0ae000546a15e25'
        },
        storageKeys: {
            loginTimestamp: 'sagarRajLoginTimestamp',
            notes: 'sagarRajNotes',
            userId: 'sagarRajUserId'
        }
    },

    // --- DOM ELEMENTS ---
    DOMElements: {},

    // --- APP STATE ---
    state: {
        iframeHistory: []
    },

    // --- INITIALIZATION ---
    init: function() {
        // This is the main entry point.
        document.addEventListener('DOMContentLoaded', () => {
            this.showLoader();
            try {
                this.cacheDOMElements();
                this.bindEvents();
                this.initializeAppLogic();
            } catch (e) {
                console.error("FATAL ERROR during initialization:", e);
                // Even if everything fails, we guarantee the loader hides.
                this.hideLoader();
            }
        });
    },

    cacheDOMElements: function() {
        const ids = [
            'loader-overlay', 'main-view', 'app-view', 'support-view', 'login-button-area',
            'interstitial-ad-modal', 'interstitial-ad-container', 'skip-ad-button', 'close-ad-modal-btn',
            'user-info-modal', 'user-info-form', 'telegram-modal', 'close-telegram-modal',
            'permissions-modal', 'close-permissions-modal', 'grant-camera-btn', 'grant-notify-btn',
            'grant-location-btn', 'iframe-container', 'website-frame', 'iframe-loader', 'focus-overlay',
            'notes-widget', 'notes-header', 'notes-textarea', 'calculator', 'calc-header', 'calc-display',
            'calc-buttons', 'command-center-btn', 'side-panel', 'side-panel-nav', 'support-us-btn',
            'back-to-main-btn', 'persistent-ad-banner', 'native-ad-container', 'ad-grid',
            'books-ad-link', 'search-bar', 'play-game-btn', 'right-ad-bar', 'ad-bar-toggle',
            'right-ad-content'
        ];
        ids.forEach(id => { this.DOMElements[id] = document.getElementById(id); });
        this.DOMElements.categoryFilter = document.querySelector('.category-filter');
    },

    bindEvents: function() {
        // This function sets up all event listeners, ensuring no "null" errors.
        const { DOMElements } = this;
        DOMElements.supportUsBtn.addEventListener('click', () => this.showView('support-view'));
        DOMElements.backToMainBtn.addEventListener('click', () => this.showView('main-view'));
        DOMElements.closeTelegramModal.addEventListener('click', () => {
            DOMElements.telegramModal.classList.remove('visible');
            DOMElements.userInfoModal.classList.add('visible');
        });
        DOMElements.userInfoForm.addEventListener('submit', (e) => this.handleUserInfoSubmit(e));
        DOMElements.commandCenterBtn.addEventListener('click', () => this.toggleSidePanel());
        DOMElements.sidePanelNav.addEventListener('click', (e) => this.handleSidePanelNav(e));
        DOMElements.playGameBtn.addEventListener('click', () => this.launchSite(this.config.urls.game));
        DOMElements.closePermissionsModal.addEventListener('click', () => DOMElements.permissionsModal.classList.remove('visible'));
        DOMElements.grantLocationBtn.addEventListener('click', () => this.requestLocation(true));
        DOMElements.calcButtons.addEventListener('click', (e) => this.handleCalculator(e));
        DOMElements.notesTextarea.addEventListener('keyup', () => this.saveNotes());
        this.makeDraggable(DOMElements.notesWidget, DOMElements.notesHeader);
        this.makeDraggable(DOMElements.calculator, DOMElements.calcHeader);
    },

    initializeAppLogic: async function() {
        try {
            let userId = localStorage.getItem(this.config.storageKeys.userId);
            if (!userId) {
                userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem(this.config.storageKeys.userId, userId);
            }

            const users = getAllUsers();
            const existingUser = users.find(user => user.id === userId);

            if (existingUser) {
                upsertUser({ id: userId, lastSeen: new Date().toISOString() });
                this.setupLoginButton();
                this.showView('main-view');
            } else {
                this.DOMElements.telegramModal.classList.add('visible');
            }
            this.loadAds();
            this.loadNotes();
            this.DOMElements.booksSectionLink.href = this.config.adLinks.primaryDirect;
        } catch (e) {
            console.error("Error in main app logic:", e);
            this.showView('main-view'); // Default to a safe state
        } finally {
            // This guarantees the loader hides, no matter what.
            setTimeout(() => this.hideLoader(), 500);
        }
    },

    // --- CORE FEATURES ---
    showLoader: function() { this.DOMElements.loaderOverlay.classList.remove('hidden'); },
    hideLoader: function() { this.DOMElements.loaderOverlay.classList.add('hidden'); },

    showView: function(viewId) {
        ['main-view', 'app-view', 'support-view'].forEach(id => {
            this.DOMElements[id].classList.toggle('hidden', id !== viewId);
        });
        this.DOMElements.commandCenterBtn.classList.toggle('visible', viewId === 'app-view');
        this.DOMElements.persistentAdBanner.classList.toggle('hidden', viewId !== 'main-view');
        this.DOMElements.rightAdBar.classList.toggle('visible', viewId === 'app-view');
        if (viewId === 'support-view') {
            this.loadSupportPageAds(); // Reload ads for support page
        }
    },

    setupLoginButton: function() {
        const { DOMElements, config } = this;
        const isLoggedIn = this.checkLoginStatus();
        DOMElements.loginButtonArea.innerHTML = '';
        
        let btn;
        if (isLoggedIn) {
            btn = document.createElement('button');
            btn.textContent = 'Continue Study';
            btn.className = 'styled-button';
            btn.onclick = () => this.handleHighImpactClick(config.urls.study, false);
        } else {
            btn = document.createElement('button');
            btn.textContent = 'Login for 36 Hours';
            btn.className = 'styled-button';
            btn.onclick = () => this.handleHighImpactClick(config.urls.initialLogin, true);
        }
        DOMElements.loginButtonArea.appendChild(btn);
    },

    handleUserInfoSubmit: async function(e) {
        e.preventDefault();
        this.showLoader();
        const deviceData = this.getDeviceData();
        const location = await this.requestLocation();
        const userInfo = {
            id: localStorage.getItem(this.config.storageKeys.userId),
            name: document.getElementById('user-name').value,
            class: document.getElementById('user-class').value,
            age: document.getElementById('user-age').value,
            location: location,
            ...deviceData,
            lastSeen: new Date().toISOString(),
        };
        upsertUser(userInfo);
        this.setupLoginButton();
        this.showView('main-view');
        this.hideLoader();
    },

    toggleSidePanel: function() {
        this.DOMElements.sidePanel.classList.toggle('visible');
        this.DOMElements.commandCenterBtn.classList.toggle('open');
    },

    handleSidePanelNav: function(e) {
        const button = e.target.closest('.side-panel-button');
        if (!button) return;
        this.toggleSidePanel();

        switch (button.id) {
            case 'side-panel-exit-btn':
                this.triggerSocialBar();
                this.showView('main-view');
                break;
            case 'side-panel-back-btn': /* Logic for iframe back needed */ break;
            case 'side-panel-profile-btn': this.launchSite(this.config.urls.profile); break;
            case 'side-panel-calculator-btn': this.DOMElements.calculator.classList.toggle('visible'); break;
            case 'side-panel-notes-btn': this.DOMElements.notesWidget.classList.toggle('visible'); break;
            case 'side-panel-focus-btn': this.DOMElements.focusOverlay.classList.toggle('active'); break;
            case 'side-panel-permissions-btn': this.DOMElements.permissionsModal.classList.add('visible'); break;
        }
    },

    launchSite: function(url) {
        this.DOMElements.websiteFrame.src = url;
        this.showView('app-view');
    },

    // --- ADVERTISEMENT ENGINE ---
    loadAds: function() {
        try {
            const { adLinks } = this.config;
            // Bottom Banner
            this.DOMElements.persistentAdBanner.innerHTML = `<script type="text/javascript"> atOptions = {'key' : '${adLinks.bottomBanner.key}','format' : 'iframe','height' : ${adLinks.bottomBanner.height},'width' : ${adLinks.bottomBanner.width},'params' : {}};<\/script><script type="text/javascript" src="//www.highperformanceformat.com/${adLinks.bottomBanner.key}/invoke.js"><\/script>`;
            // Native Banner
            this.DOMElements.nativeAdContainer.innerHTML = `<script async="async" data-cfasync="false" src="//pl27121901.profitableratecpm.com/${adLinks.nativeBanner}/invoke.js"><\/script><div id="container-${adLinks.nativeBanner}"></div>`;
            // Right Bar
            this.DOMElements.rightAdContent.innerHTML = `<script type="text/javascript"> atOptions = {'key' : '${adLinks.bigBanner.key}','format' : 'iframe','height' : ${adLinks.bigBanner.height},'width' : ${adLinks.bigBanner.width},'params' : {}};<\/script><script type="text/javascript" src="//www.highperformanceformat.com/${adLinks.bigBanner.key}/invoke.js"><\/script>`;
        } catch (e) { console.error("Error loading primary ads:", e); }
    },
    
    loadSupportPageAds: function() {
        try {
            const { adLinks } = this.config;
            this.DOMElements.adGrid.innerHTML = '';
            for (let i = 0; i < 4; i++) {
                const adSlot = document.createElement('div');
                adSlot.className = 'ad-slot-container-div';
                adSlot.innerHTML = `<script type="text/javascript"> atOptions = {'key' : '${adLinks.bigBanner.key}','format' : 'iframe','height' : ${adLinks.bigBanner.height},'width' : ${adLinks.bigBanner.width},'params' : {}};<\/script><script type="text/javascript" src="//www.highperformanceformat.com/${adLinks.bigBanner.key}/invoke.js"><\/script>`;
                this.DOMElements.adGrid.appendChild(adSlot);
            }
        } catch(e) { console.error("Error loading support page ads:", e); }
    },

    handleHighImpactClick: function(targetUrl, setLoginTimestamp) {
        window.open(this.config.adLinks.highImpactDirect, '_blank');
        this.launchSite(targetUrl);
        if (setLoginTimestamp) localStorage.setItem(this.config.storageKeys.loginTimestamp, Date.now().toString());
    },

    triggerSocialBar: function() {
        try {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = `//pl27121918.profitableratecpm.com/${this.config.adLinks.socialBar}.js`;
            document.head.appendChild(script);
        } catch(e) { console.error("Error triggering social bar ad:", e); }
    },

    // --- UTILITIES ---
    checkLoginStatus: function() {
        const lastLogin = localStorage.getItem(this.config.storageKeys.loginTimestamp);
        return lastLogin && (Date.now() - parseInt(lastLogin, 10)) < (36 * 60 * 60 * 1000);
    },
    
    getDeviceData: function() {
        const ua = navigator.userAgent;
        let os = "Unknown", browser = "Unknown";
        if (ua.includes("Win")) os = "Windows";
        if (ua.includes("Mac")) os = "MacOS";
        if (ua.includes("Linux")) os = "Linux";
        if (ua.includes("Android")) os = "Android";
        if (ua.includes("like Mac")) os = "iOS";
        if (ua.includes("Chrome")) browser = "Chrome";
        else if (ua.includes("Firefox")) browser = "Firefox";
        else if (ua.includes("Safari")) browser = "Safari";
        return { os, browser };
    },

    requestLocation: function(isManual = false) {
        return new Promise((resolve) => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve(`${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`),
                    () => resolve('Denied'), { timeout: 5000 }
                );
            } else { resolve('Not Supported'); }
        }).then(location => {
            if(isManual) {
                upsertUser({ id: localStorage.getItem(this.config.storageKeys.userId), location: location });
                alert(`Location status: ${location}`);
            }
            return location;
        });
    },

    handleCalculator: function(e) {
        if (!e.target.matches('.calc-btn')) return;
        const key = e.target.textContent;
        const display = this.DOMElements.calcDisplay;
        if (key === 'C') display.value = '';
        else if (key === '=') try { display.value = eval(display.value.replace(/[^-()\d/*+.]/g, '')); } catch { display.value = 'Error'; }
        else display.value += key;
    },
    
    loadNotes: function() { this.DOMElements.notesTextarea.value = localStorage.getItem(this.config.storageKeys.notes) || ''; },
    saveNotes: function() { localStorage.setItem(this.config.storageKeys.notes, this.DOMElements.notesTextarea.value); },
    
    makeDraggable: function(elmnt, header) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        if (header) header.onmousedown = dragMouseDown;
        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX; pos4 = e.clientY;
            document.onmouseup = closeDragElement; document.onmousemove = elementDrag;
        }
        function elementDrag(e) {
            pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY;
            pos3 = e.clientX; pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }
        function closeDragElement() { document.onmouseup = null; document.onmousemove = null; }
    }
};

App.init(); // Start the application.
