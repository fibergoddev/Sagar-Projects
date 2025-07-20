/**
 * @file Manages all UI interactions and DOM manipulations for the PadhaiLikhai main application.
 * @author Sagar Raj
 * @version 1.0
 */

// --- DOM Element Cache ---
export const allDOMElements = {
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
    popunderContainer: document.getElementById('popunder-container'),
    notificationContainer: document.getElementById('notification-container'),
    rightAdBar: document.getElementById('right-ad-bar'),
    rightAdContent: document.getElementById('right-ad-content'),
};

/**
 * Displays a temporary notification on the screen.
 * @param {string} message The message to display.
 * @param {string} type 'info', 'success', or 'error'.
 */
export const showNotification = (message, type = 'info') => {
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
 * Toggles the visibility of different views within index.html.
 * @param {string} viewId The ID of the view to show ('main-view', 'app-view', 'support-view').
 */
export const showView = (viewId) => {
    ['main-view', 'app-view', 'support-view'].forEach(id => {
        document.getElementById(id)?.classList.toggle('hidden', id !== viewId);
    });
    allDOMElements.commandCenterBtn?.classList.toggle('visible', viewId === 'app-view');
};

/**
 * Sets up the main login/continue button based on the stored timestamp.
 */
export const setupLoginButton = () => {
    const isLoggedIn = (Date.now() - parseInt(localStorage.getItem('sagarRajLoginTimestamp') || '0', 10)) < (36 * 60 * 60 * 1000);
    allDOMElements.loginButtonArea.innerHTML = '';
    if (isLoggedIn) {
        allDOMElements.loginButtonArea.innerHTML = `<button class="styled-button" id="continue-study-btn">Continue Study</button>`;
    } else {
        allDOMElements.loginButtonArea.innerHTML = `<button class="styled-button" id="login-btn">Login for 36 Hours</button>`;
    }
    // Note: Event listeners will be attached in the main script.
};

/**
 * Filters the dashboard cards based on search term and category.
 */
export const filterDashboard = () => {
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
