/* * Designed & Developed by Sagar Raj
 * Version 29: Bulletproof Logic for Loader and Local DB
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const initialLoginUrl = 'https://rolexcoderz.live/36xsuccess/';
    const studyUrl = 'https://www.rolexcoderz.xyz/Course';
    const profileUrl = 'https://fibergoddev.github.io/Sagar-Projects/Cont/profile.html';
    const gameUrl = 'game.html';
    const adLink = 'https://www.profitableratecpm.com/z3cci824?key=3ad08b148f03cc313b5357f5e120feaf';
    const loginTimestampKey = 'sagarRajLoginTimestamp';
    const notesKey = 'sagarRajNotes';
    const userIdKey = 'sagarRajUserId';

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
        persistentAdContainer: document.getElementById('persistent-ad-container'),
        adGrid: document.getElementById('ad-grid'),
        booksSectionLink: document.getElementById('books-ad-link'),
        searchBar: document.getElementById('search-bar'),
        categoryFilter: document.querySelector('.category-filter'),
        dashboardGrid: document.getElementById('dashboard-grid'),
        playGameBtn: document.getElementById('play-game-btn'),
        rightAdBar: document.getElementById('right-ad-bar'),
        adBarToggle: document.getElementById('ad-bar-toggle'),
        rightAdContent: document.getElementById('right-ad-content'),
    };

    // --- State Management ---
    const appState = {
        iframeHistory: [],
        currentUrl: '',
    };

    // --- Core Functions ---
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
        allDOMElements.persistentAdBanner.classList.toggle('hidden', viewId === 'app-view');
        allDOMElements.rightAdBar.classList.toggle('visible', viewId === 'app-view');
    };

    const launchSite = (url, setLoginTimestamp) => {
        if (setLoginTimestamp) localStorage.setItem(loginTimestampKey, Date.now().toString());
        
        if (url !== appState.currentUrl && appState.currentUrl) {
            appState.iframeHistory.push(appState.currentUrl);
        }
        appState.currentUrl = url;

        allDOMElements.websiteFrame.src = url;
        showView('app-view');
        allDOMElements.iframeLoader.classList.add('visible');
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
        const adIframe = document.createElement('iframe');
        adIframe.scrolling = 'no';
        adIframe.frameBorder = '0';
        adIframe.style.width = '300px';
        adIframe.style.height = '250px';
        interstitialAdContainer.appendChild(adIframe);
        
        const adScriptContent = `
            <script type="text/javascript">
                atOptions = { 'key' : 'de366f663355ebaa73712755e3876ab8', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };
            <\/script>
            <script type="text/javascript" src="//www.highperformanceformat.com/de366f663355ebaa73712755e3876ab8/invoke.js"><\/script>
        `;
        const adDoc = adIframe.contentWindow.document;
        adDoc.open();
        adDoc.write(adScriptContent);
        adDoc.close();

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
            launchSite(targetUrl, setLoginTimestamp);
        };
        closeAdModalBtn.onclick = closeFunction;
    };
    
    const setupLoginButton = () => {
        const isLoggedIn = checkLoginStatus();
        allDOMElements.loginButtonArea.innerHTML = ''; // Clear previous buttons

        if (isLoggedIn) {
            const continueBtn = document.createElement('button');
            continueBtn.textContent = 'Continue Study';
            continueBtn.className = 'styled-button';
            continueBtn.onclick = () => showInterstitialAd(studyUrl, false);
            
            const forceLoginBtn = document.createElement('button');
            forceLoginBtn.textContent = 'Force Login';
            forceLoginBtn.className = 'styled-button support-button';
            forceLoginBtn.style.marginLeft = '15px';
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
        if (header) header.onmousedown = dragMouseDown;
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
            if (!e.target.matches('.calc-btn')) return;
            const key = e.target.textContent;
            const display = allDOMElements.calcDisplay;
            if (key === 'C') {
                display.value = '';
            } else if (key === '=') {
                try { display.value = eval(display.value.replace(/[^-()\d/*+.]/g, '')); } catch { display.value = 'Error'; }
            } else {
                display.value += key;
            }
        });
    };
    
    const loadAds = () => {
        const adPlacements = [
            { container: allDOMElements.adGrid, key: 'de366f663355ebaa73712755e3876ab8', width: 300, height: 250, count: 4 },
            { container: allDOMElements.persistentAdContainer, key: '3ad08b148f03cc313b5357f5e120feaf', width: 728, height: 90, count: 1 },
            { container: allDOMElements.rightAdContent, key: 'de366f663355ebaa73712755e3876ab8', width: 300, height: 250, count: 1 }
        ];

        adPlacements.forEach(placement => {
            if (!placement.container) return;
            placement.container.innerHTML = ''; 

            for (let i = 0; i < placement.count; i++) {
                const adSlot = document.createElement('div');
                adSlot.className = 'ad-slot-container-div';
                placement.container.appendChild(adSlot);

                const adScript = document.createElement('script');
                adScript.type = 'text/javascript';
                adScript.innerHTML = `
                    atOptions = {
                        'key' : '${placement.key}',
                        'format' : 'iframe',
                        'height' : ${placement.height},
                        'width' : ${placement.width},
                        'params' : {}
                    };
                `;
                
                const adLoaderScript = document.createElement('script');
                adLoaderScript.type = 'text/javascript';
                adLoaderScript.src = `//www.highperformanceformat.com/${placement.key}/invoke.js`;
                
                adSlot.appendChild(adScript);
                adSlot.appendChild(adLoaderScript);
            }
        });
    };

    const filterDashboard = () => {
        const searchTerm = allDOMElements.searchBar.value.toLowerCase();
        const activeCategory = allDOMElements.categoryFilter.querySelector('.active').dataset.category;
        
        document.querySelectorAll('#dashboard-grid .content-card').forEach(card => {
            const keywords = card.dataset.keywords.toLowerCase();
            const category = card.dataset.category;

            const categoryMatch = activeCategory === 'all' || category === activeCategory;
            const searchMatch = keywords.includes(searchTerm);

            card.style.display = (categoryMatch && searchMatch) ? 'block' : 'none';
        });
    };

    const getIpAddress = async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            if (!response.ok) throw new Error('Failed to fetch IP');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error("Could not get IP address:", error);
            return 'Not available';
        }
    };

    const saveAndProceed = async (userInfo) => {
        const ipAddress = await getIpAddress();
        const fullUserInfo = {
            ...userInfo,
            id: localStorage.getItem(userIdKey),
            ipAddress,
            deviceInfo: navigator.userAgent,
            lastSeen: new Date().toISOString()
        };
        
        addUser(fullUserInfo);
        
        allDOMElements.userInfoModal.classList.remove('visible');
        setupLoginButton();
        showView('main-view');
    };

    // --- Initial App Flow ---
    const initializeApp = () => {
        // CRITICAL FIX: Use a try...finally block to guarantee the loader is hidden.
        try {
            let userId = localStorage.getItem(userIdKey);
            if (!userId) {
                userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem(userIdKey, userId);
            }

            const users = getUsers();
            const existingUser = users.find(user => user.id === userId);

            if (existingUser) {
                setupLoginButton();
                showView('main-view');
            } else {
                allDOMElements.telegramModal.classList.add('visible');
            }
        } catch (error) {
            console.error("A critical error occurred during app initialization:", error);
            // Show the main view even if there's an error, so the user is not stuck.
            showView('main-view');
        } finally {
            // This will run regardless of whether an error occurred or not.
            // This guarantees the loader is always hidden.
            setTimeout(() => {
                allDOMElements.loaderOverlay.classList.remove('visible');
                allDOMElements.loaderOverlay.classList.add('hidden');
            }, 500); // A shorter delay is sufficient.
        }
    };

    // --- Event Listeners ---
    allDOMElements.closeTelegramModal.onclick = () => {
        allDOMElements.telegramModal.classList.remove('visible');
        const users = getUsers();
        const existingUser = users.find(user => user.id === localStorage.getItem(userIdKey));
        if (!existingUser) {
            allDOMElements.userInfoModal.classList.add('visible');
        } else {
            setupLoginButton();
            showView('main-view');
        }
    };

    allDOMElements.userInfoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userInfo = {
            name: document.getElementById('user-name').value,
            class: document.getElementById('user-class').value,
            age: document.getElementById('user-age').value,
        };
        saveAndProceed(userInfo);
    });

    allDOMElements.websiteFrame.addEventListener('load', () => allDOMElements.iframeLoader.classList.remove('visible'));
    
    allDOMElements.supportUsBtn.addEventListener('click', () => {
        showView('support-view');
        loadAds();
    });

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
            case 'side-panel-back-btn':
                navigateBack();
                break;
            case 'side-panel-profile-btn':
                launchSite(profileUrl, false);
                break;
            case 'side-panel-game-btn':
                showInterstitialAd(gameUrl, false);
                break;
            case 'side-panel-calculator-btn':
                allDOMElements.calculator.classList.toggle('visible');
                break;
            case 'side-panel-notes-btn':
                allDOMElements.notesWidget.classList.toggle('visible');
                break;
            case 'side-panel-focus-btn':
                allDOMElements.focusOverlay.classList.toggle('active');
                const icon = button.querySelector('i');
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
                break;
            case 'side-panel-permissions-btn':
                allDOMElements.permissionsModal.classList.add('visible');
                break;
        }
    });

    allDOMElements.closePermissionsModal.addEventListener('click', () => allDOMElements.permissionsModal.classList.remove('visible'));
    allDOMElements.grantCameraBtn.addEventListener('click', async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            alert('Camera permission granted!');
        } catch (err) {
            alert('Camera permission was denied.');
        }
    });
    allDOMElements.grantNotifyBtn.addEventListener('click', async () => {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') new Notification('Thank you!', { body: 'Notifications are now enabled.' });
        else alert('Notification permission was denied.');
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
    allDOMElements.booksSectionLink.href = adLink;
    
    allDOMElements.adBarToggle.addEventListener('click', () => {
        allDOMElements.rightAdBar.classList.toggle('visible');
    });

    makeDraggable(allDOMElements.notesWidget, allDOMElements.notesHeader);
    makeDraggable(allDOMElements.calculator, allDOMElements.calcHeader);
    handleCalculator();
    loadAds();

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js');
        });
    }

    initializeApp();
});
