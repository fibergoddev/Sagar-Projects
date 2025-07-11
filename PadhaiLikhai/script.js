/* * Designed & Developed by Sagar Raj
 * Version 23: The Definitive Flawless Hub Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const initialLoginUrl = 'https://rolexcoderz.live/36xsuccess/';
    const studyUrl = 'https://www.rolexcoderz.xyz/Course';
    const profileUrl = 'https://fibergoddev.github.io/Sagar-Projects/Cont/profile.html';
    const gameUrl = 'game.html';
    const adLink = 'https://www.profitableratecpm.com/z3cci824?key=3ad08b148f03cc313b5357f5e120feaf';
    const loginTimestampKey = 'sagarRajLoginTimestamp';
    const userInfoKey = 'sagarRajUserInfo';
    const notesKey = 'sagarRajNotes';

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
        adGrid: document.getElementById('ad-grid'),
        booksSectionLink: document.getElementById('books-ad-link'),
        searchBar: document.getElementById('search-bar'),
        categoryFilter: document.querySelector('.category-filter'),
        dashboardGrid: document.getElementById('dashboard-grid'),
        playGameBtn: document.getElementById('play-game-btn'),
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
            document.getElementById(id).classList.toggle('hidden', id !== viewId);
        });
        allDOMElements.commandCenterBtn.classList.toggle('visible', viewId === 'app-view');
        allDOMElements.persistentAdBanner.classList.toggle('hidden', viewId !== 'main-view');
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
        interstitialAdContainer.appendChild(adIframe);
        const adScriptContent = `
            <script type="text/javascript">
                atOptions = { 'key' : 'de366f663355ebaa73712755e3876ab8', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };
            <\/script>
            <script type="text/javascript" src="//www.highperformanceformat.com/de366f663355ebaa73712755e3876ab8/invoke.js"><\/script>
        `;
        adIframe.contentWindow.document.open();
        adIframe.contentWindow.document.write(adScriptContent);
        adIframe.contentWindow.document.close();
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
        allDOMElements.persistentAdBanner.innerHTML = `
            <script type='text/javascript' src='//pl27121918.profitableratecpm.com/f4/35/c9/f435c96959f348c08e52ceb50abf087e.js'><\/script>
            <script type="text/javascript">
                atOptions = { 'key' : '7f09cc75a479e1c1557ae48261980b12', 'format' : 'iframe', 'height' : 50, 'width' : 320, 'params' : {} };
            <\/script>
            <script type="text/javascript" src="//www.highperformanceformat.com/7f09cc75a479e1c1557ae48261980b12/invoke.js"><\/script>
        `;
        allDOMElements.adGrid.innerHTML = `
            <div class="ad-slot ad-slot-300x250">
                <script type="text/javascript">
                    atOptions = { 'key' : 'de366f663355ebaa73712755e3876ab8', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };
                <\/script>
                <script type="text/javascript" src="//www.highperformanceformat.com/de366f663355ebaa73712755e3876ab8/invoke.js"><\/script>
            </div>
            <div class="ad-slot ad-slot-container-div">
                <script async="async" data-cfasync="false" src="//pl27121901.profitableratecpm.com/5a3a56f258731c59b0ae000546a15e25/invoke.js"><\/script>
                <div id="container-5a3a56f258731c59b0ae000546a15e25"></div>
            </div>
        `;
    };
    
    const filterDashboard = () => {
        const searchTerm = allDOMElements.searchBar.value.toLowerCase();
        const activeCategory = allDOMElements.categoryFilter.querySelector('.active').dataset.category;
        
        document.querySelectorAll('#dashboard-grid .content-card').forEach(card => {
            const keywords = card.dataset.keywords.toLowerCase();
            const category = card.dataset.category;

            const categoryMatch = activeCategory === 'all' || category === activeCategory;
            const searchMatch = keywords.includes(searchTerm);

            if (categoryMatch && searchMatch) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    };

    // --- Initial App Flow ---
    setTimeout(() => {
        allDOMElements.loaderOverlay.classList.add('hidden');
        allDOMElements.telegramModal.classList.add('visible');
    }, 2000);

    allDOMElements.closeTelegramModal.onclick = () => {
        allDOMElements.telegramModal.classList.remove('visible');
        if (!localStorage.getItem(userInfoKey)) {
            allDOMElements.userInfoModal.classList.add('visible');
        } else {
            setupLoginButton();
        }
        showView('main-view');
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
    });

    // --- Event Listeners ---
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
            case 'side-panel-back-btn':
                navigateBack();
                break;
            case 'side-panel-home-btn':
                launchSite(mainProjectsUrl, false);
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
    
    makeDraggable(allDOMElements.notesWidget, allDOMElements.notesHeader);
    makeDraggable(allDOMElements.calculator, allDOMElements.calcHeader);
    handleCalculator();
    loadAds();
});
