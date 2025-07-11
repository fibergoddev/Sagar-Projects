/* * Designed & Developed by Sagar Raj
 * Version 20: The Definitive Flawless Hub Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const studyUrl = 'https://www.rolexcoderz.xyz/Course';
    const profileUrl = 'https://fibergoddev.github.io/Sagar-Projects/Cont/profile.html';
    const mainProjectsUrl = 'https://fibergoddev.github.io/Sagar-Projects/Cont/padhai.html';
    const adLink = 'https://www.profitableratecpm.com/z3cci824?key=3ad08b148f03cc313b5357f5e120feaf';
    const loginTimestampKey = 'sagarRajLoginTimestamp';
    const userInfoKey = 'sagarRajUserInfo';
    const notesKey = 'sagarRajNotes';

    // --- DOM Element Cache ---
    const allDOMElements = {
        mainView: document.getElementById('main-view'),
        appView: document.getElementById('app-view'),
        supportView: document.getElementById('support-view'),
        loginStudyBtn: document.getElementById('login-study-btn'),
        interstitialAdModal: document.getElementById('interstitial-ad-modal'),
        interstitialAdContainer: document.getElementById('interstitial-ad-container'),
        skipAdButton: document.getElementById('skip-ad-button'),
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
        closeSidePanelBtn: document.getElementById('close-side-panel-btn'),
        sidePanelHomeBtn: document.getElementById('side-panel-home-btn'),
        sidePanelProfileBtn: document.getElementById('side-panel-profile-btn'),
        sidePanelCalculatorBtn: document.getElementById('side-panel-calculator-btn'),
        sidePanelFocusBtn: document.getElementById('side-panel-focus-btn'),
        sidePanelNotesBtn: document.getElementById('side-panel-notes-btn'),
        sidePanelPermissionsBtn: document.getElementById('side-panel-permissions-btn'),
        sidePanelExitBtn: document.getElementById('side-panel-exit-btn'),
        sidePanelBackBtn: document.getElementById('side-panel-back-btn'),
        supportUsBtn: document.getElementById('support-us-btn'),
        backToMainBtn: document.getElementById('back-to-main-btn'),
        persistentAdBanner: document.getElementById('persistent-ad-banner'),
        booksSection: document.getElementById('books-section'),
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
        const twentyFourHours = 24 * 60 * 60 * 1000;
        return (Date.now() - parseInt(lastLogin, 10)) < twentyFourHours;
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
        
        if (url !== appState.currentUrl) {
            appState.iframeHistory.push(appState.currentUrl);
            appState.currentUrl = url;
        }

        allDOMElements.websiteFrame.src = url;
        showView('app-view');
        allDOMElements.iframeLoader.classList.add('visible');
    };

    const navigateBack = () => {
        if (appState.iframeHistory.length > 1) {
            const prevUrl = appState.iframeHistory.pop();
            appState.currentUrl = prevUrl;
            allDOMElements.websiteFrame.src = prevUrl;
            allDOMElements.iframeLoader.classList.add('visible');
        } else {
            showView('main-view');
            allDOMElements.websiteFrame.src = 'about:blank';
            appState.iframeHistory = [];
            appState.currentUrl = '';
        }
    };

    const showInterstitialAd = (targetUrl, setLoginTimestamp) => {
        const { interstitialAdModal, interstitialAdContainer, skipAdButton } = allDOMElements;
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
        skipAdButton.onclick = () => {
            if (skipAdButton.disabled) return;
            interstitialAdModal.classList.remove('visible');
            launchSite(targetUrl, setLoginTimestamp);
            skipAdButton.onclick = null;
        };
    };
    
    const setupLoginButton = () => {
        const isLoggedIn = checkLoginStatus();
        if (isLoggedIn) {
            allDOMElements.loginStudyBtn.textContent = 'Continue Study';
            allDOMElements.loginStudyBtn.onclick = () => showInterstitialAd(studyUrl, false);
        } else {
            allDOMElements.loginStudyBtn.textContent = 'Login for 24 Hours';
            allDOMElements.loginStudyBtn.onclick = () => showInterstitialAd(studyUrl, true);
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

    // --- Initial App Flow ---
    allDOMElements.telegramModal.classList.add('visible');
    allDOMElements.closeTelegramModal.onclick = () => {
        allDOMElements.telegramModal.classList.remove('visible');
        if (!localStorage.getItem(userInfoKey)) {
            allDOMElements.userInfoModal.classList.add('visible');
        } else {
            setupLoginButton();
        }
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
    allDOMElements.closeSidePanelBtn.addEventListener('click', () => {
        allDOMElements.sidePanel.classList.remove('visible');
        allDOMElements.commandCenterBtn.classList.remove('open');
    });
    
    allDOMElements.sidePanelExitBtn.addEventListener('click', () => {
        showView('main-view');
        allDOMElements.sidePanel.classList.remove('visible');
        allDOMElements.commandCenterBtn.classList.remove('open');
        allDOMElements.websiteFrame.src = 'about:blank';
        appState.iframeHistory = [];
        appState.currentUrl = '';
    });
    allDOMElements.sidePanelBackBtn.addEventListener('click', navigateBack);
    allDOMElements.sidePanelHomeBtn.addEventListener('click', () => launchSite(mainProjectsUrl, false));
    allDOMElements.sidePanelProfileBtn.addEventListener('click', () => launchSite(profileUrl, false));
    allDOMElements.sidePanelCalculatorBtn.addEventListener('click', () => allDOMElements.calculator.classList.toggle('visible'));
    allDOMElements.sidePanelNotesBtn.addEventListener('click', () => allDOMElements.notesWidget.classList.toggle('visible'));
    allDOMElements.sidePanelFocusBtn.addEventListener('click', () => {
        allDOMElements.focusOverlay.classList.toggle('active');
        const icon = allDOMElements.sidePanelFocusBtn.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
    allDOMElements.sidePanelPermissionsBtn.addEventListener('click', () => allDOMElements.permissionsModal.classList.add('visible'));
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
    allDOMElements.booksSection.addEventListener('click', () => window.open(adLink, '_blank'));
    
    makeDraggable(allDOMElements.notesWidget, allDOMElements.notesHeader);
    makeDraggable(allDOMElements.calculator, allDOMElements.calcHeader);
    handleCalculator();
});
