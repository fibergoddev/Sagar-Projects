/* * Designed & Developed by Sagar Raj
 * Version 37: Definitive Nexus Hub System
 */

// Import all necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, writeBatch, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
    loaderOverlay: document.getElementById('loader-overlay'), mainView: document.getElementById('main-view'), appView: document.getElementById('app-view'), supportView: document.getElementById('support-view'), loginButtonArea: document.getElementById('login-button-area'), interstitialAdModal: document.getElementById('interstitial-ad-modal'), interstitialAdContainer: document.getElementById('interstitial-ad-container'), skipAdButton: document.getElementById('skip-ad-button'), closeAdModalBtn: document.getElementById('close-ad-modal-btn'), userInfoModal: document.getElementById('user-info-modal'), userInfoForm: document.getElementById('user-info-form'), telegramModal: document.getElementById('telegram-modal'), closeTelegramModal: document.getElementById('close-telegram-modal'), permissionsModal: document.getElementById('permissions-modal'), closePermissionsModal: document.getElementById('close-permissions-modal'), grantCameraBtn: document.getElementById('grant-camera-btn'), grantNotifyBtn: document.getElementById('grant-notify-btn'), websiteFrame: document.getElementById('website-frame'), iframeLoader: document.getElementById('iframe-loader'), focusOverlay: document.getElementById('focus-overlay'), notesWidget: document.getElementById('mini-notes'), notesHeader: document.getElementById('notes-header'), notesTextarea: document.getElementById('notes-textarea'), calculator: document.getElementById('calculator'), calcHeader: document.getElementById('calc-header'), calcDisplay: document.getElementById('calc-display'), calcButtons: document.getElementById('calc-buttons'), commandCenterBtn: document.getElementById('command-center-btn'), sidePanel: document.getElementById('side-panel'), sidePanelNav: document.getElementById('side-panel-nav'), supportUsBtn: document.getElementById('support-us-btn'), backToMainBtn: document.getElementById('back-to-main-btn'), persistentAdBanner: document.getElementById('persistent-ad-banner'), adGrid: document.getElementById('ad-grid'), booksSectionLink: document.getElementById('books-ad-link'), searchBar: document.getElementById('search-bar'), categoryFilter: document.querySelector('.category-filter'), dashboardGrid: document.getElementById('dashboard-grid'), noResultsMessage: document.getElementById('no-results-message'), playGameBtn: document.getElementById('play-game-btn'), rightAdBar: document.getElementById('right-ad-bar'), adBarToggle: document.getElementById('ad-bar-toggle'), rightAdContent: document.getElementById('right-ad-content'), directAdOverlay: document.getElementById('direct-ad-overlay'), notificationContainer: document.getElementById('notification-container'),
    // Nexus Hub Elements
    nexusHubBtn: document.getElementById('nexus-hub-btn'), nexusHubModal: document.getElementById('nexus-hub-modal'), nexusHubCloseBtn: document.getElementById('nexus-hub-close-btn'), nexusUserAvatar: document.getElementById('nexus-user-avatar'), nexusUserName: document.getElementById('nexus-user-name'), nexusUserPoints: document.getElementById('nexus-user-points'), nexusUserStreak: document.getElementById('nexus-user-streak'), nexusNavBtns: document.querySelectorAll('.nexus-nav-btn'), nexusViews: document.querySelectorAll('.nexus-view'), dailyMissionsList: document.getElementById('daily-missions-list'), noSquadView: document.getElementById('no-squad-view'), inSquadView: document.getElementById('in-squad-view'), createSquadForm: document.getElementById('create-squad-form'), joinSquadForm: document.getElementById('join-squad-form'), createSquadName: document.getElementById('create-squad-name'), joinSquadCode: document.getElementById('join-squad-code'), squadNameDisplay: document.getElementById('squad-name-display'), squadPointsDisplay: document.getElementById('squad-points-display'), squadInviteCode: document.getElementById('squad-invite-code'), copySquadCodeBtn: document.getElementById('copy-squad-code-btn'), squadMembersList: document.getElementById('squad-members-list'), leaveSquadBtn: document.getElementById('leave-squad-btn'), leaderboardTabs: document.querySelectorAll('.leaderboard-tab-btn'), leaderboardContents: document.querySelectorAll('.leaderboard-content'),
};

// --- App State ---
const appState = {
    iframeHistory: [], currentUrl: '', db: null, auth: null, userId: null, inactivityTimer: null, messaging: null, userData: null, squadData: null,
};

// --- Core Functions ---
const showNotification = (message, type = 'info') => { const n = document.createElement('div'); n.className = `notification ${type}`; n.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}"></i><span>${message}</span>`; allDOMElements.notificationContainer.appendChild(n); setTimeout(() => n.remove(), 5000); };
const trackUserData = async (dataToUpdate = {}) => { if (!appState.db || !appState.userId) return; try { const storedUserInfo = JSON.parse(localStorage.getItem('sagarRajUserInfo') || '{}'); const getDeviceType = () => { const ua = navigator.userAgent; if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet"; if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile"; return "Desktop"; }; const device = { type: getDeviceType(), os: navigator.platform }; let locationInfo = {}; try { const locResponse = await fetch('https://ipapi.co/json/'); const locData = await locResponse.json(); locationInfo = { ip: locData.ip, city: locData.city, region: locData.region, country: locData.country_name }; } catch (e) { locationInfo = { error: "Could not fetch" }; } const userDocRef = doc(appState.db, "users", appState.userId); const userData = { id: appState.userId, ...storedUserInfo, device, location: locationInfo, lastVisited: serverTimestamp(), ...dataToUpdate, }; await setDoc(userDocRef, userData, { merge: true }); } catch (error) { console.error("Failed to track user data:", error); } };
const loadAds = () => { const injectAd = (container, optionsScriptContent, srcUrl) => { container.innerHTML = ''; const optionsScript = document.createElement('script'); optionsScript.type = 'text/javascript'; optionsScript.innerHTML = optionsScriptContent; const sourceScript = document.createElement('script'); sourceScript.type = 'text/javascript'; sourceScript.src = srcUrl; container.appendChild(optionsScript); container.appendChild(sourceScript); }; injectAd(allDOMElements.persistentAdBanner, `atOptions = {'key' : '7f09cc75a479e1c1557ae48261980b12','format' : 'iframe','height' : 50,'width' : 320,'params' : {}};`, '//www.highperformanceformat.com/7f09cc75a479e1c1557ae48261980b12/invoke.js'); const socialBarScript = document.createElement('script'); socialBarScript.type = 'text/javascript'; socialBarScript.src = '//pl27121918.profitableratecpm.com/f4/35/c9/f435c96959f348c08e52ceb50abf087e.js'; document.body.appendChild(socialBarScript); const rightAdContainer = document.createElement('div'); allDOMElements.rightAdContent.innerHTML = ''; allDOMElements.rightAdContent.appendChild(rightAdContainer); injectAd(rightAdContainer, `atOptions = {'key' : 'de366f663355ebaa73712755e3876ab8','format' : 'iframe','height' : 250,'width' : 300,'params' : {}};`, '//www.highperformanceformat.com/de366f663355ebaa73712755e3876ab8/invoke.js'); allDOMElements.adGrid.innerHTML = ''; const bigBarContainer = document.createElement('div'); bigBarContainer.className = 'ad-slot ad-slot-300x250'; const nativeAdContainer = document.createElement('div'); nativeAdContainer.className = 'ad-slot ad-slot-container-div'; allDOMElements.adGrid.appendChild(bigBarContainer); allDOMElements.adGrid.appendChild(nativeAdContainer); injectAd(bigBarContainer, `atOptions = {'key' : 'de366f663355ebaa73712755e3876ab8','format' : 'iframe','height' : 250,'width' : 300,'params' : {}};`, '//www.highperformanceformat.com/de366f663355ebaa73712755e3876ab8/invoke.js'); const nativeAdScript = document.createElement('script'); nativeAdScript.async = true; nativeAdScript.dataset.cfasync = "false"; nativeAdScript.src = '//pl27121901.profitableratecpm.com/5a3a56f258731c59b0ae000546a15e25/invoke.js'; const nativeDiv = document.createElement('div'); nativeDiv.id = 'container-5a3a56f258731c59b0ae000546a15e25'; nativeAdContainer.appendChild(nativeAdScript); nativeAdContainer.appendChild(nativeDiv); };
const showInterstitialAd = (targetUrl, setLoginTimestamp) => { const { interstitialAdModal, interstitialAdContainer, skipAdButton, closeAdModalBtn } = allDOMElements; interstitialAdContainer.innerHTML = ''; const adScript1 = document.createElement('script'); adScript1.type = 'text/javascript'; adScript1.innerHTML = `atOptions = {'key' : 'de366f663355ebaa73712755e3876ab8','format' : 'iframe','height' : 250,'width' : 300,'params' : {}};`; const adScript2 = document.createElement('script'); adScript2.type = 'text/javascript'; adScript2.src = '//www.highperformanceformat.com/de366f663355ebaa73712755e3876ab8/invoke.js'; interstitialAdContainer.appendChild(adScript1); interstitialAdContainer.appendChild(adScript2); interstitialAdModal.classList.add('visible'); let timeLeft = 4; skipAdButton.textContent = `Skip Ad in ${timeLeft}s`; skipAdButton.disabled = true; const timerInterval = setInterval(() => { timeLeft--; skipAdButton.textContent = `Skip Ad in ${timeLeft}s`; if (timeLeft <= 0) { clearInterval(timerInterval); skipAdButton.disabled = false; skipAdButton.textContent = 'Skip Ad'; } }, 1000); const closeFunction = () => { clearInterval(timerInterval); interstitialAdModal.classList.remove('visible'); }; skipAdButton.onclick = () => { if (!skipAdButton.disabled) { closeFunction(); if (targetUrl) launchSite(targetUrl, setLoginTimestamp); } }; closeAdModalBtn.onclick = closeFunction; };
const resetInactivityTimer = () => { clearTimeout(appState.inactivityTimer); appState.inactivityTimer = setTimeout(() => { if (!allDOMElements.mainView.classList.contains('hidden')) { showInterstitialAd(null, false); } }, 150000); };
const checkLoginStatus = () => { const lastLogin = localStorage.getItem('sagarRajLoginTimestamp'); if (!lastLogin) return false; return (Date.now() - parseInt(lastLogin, 10)) < (36 * 60 * 60 * 1000); };
const showView = (viewId) => { ['main-view', 'app-view', 'support-view'].forEach(id => { document.getElementById(id)?.classList.toggle('hidden', id !== viewId); }); allDOMElements.commandCenterBtn?.classList.toggle('visible', viewId === 'app-view'); allDOMElements.rightAdBar?.classList.toggle('visible-view', viewId === 'app-view'); };
const launchSite = (url, setLoginTimestamp) => { if (setLoginTimestamp) localStorage.setItem('sagarRajLoginTimestamp', Date.now().toString()); if (url !== appState.currentUrl && appState.currentUrl) appState.iframeHistory.push(appState.currentUrl); appState.currentUrl = url; allDOMElements.websiteFrame.src = 'about:blank'; setTimeout(() => { allDOMElements.websiteFrame.src = url; showView('app-view'); allDOMElements.iframeLoader.classList.add('visible'); }, 50); };
const navigateBack = () => { if (appState.iframeHistory.length > 0) { const prevUrl = appState.iframeHistory.pop(); appState.currentUrl = prevUrl; allDOMElements.websiteFrame.src = prevUrl; allDOMElements.iframeLoader.classList.add('visible'); } else { showView('main-view'); allDOMElements.websiteFrame.src = 'about:blank'; appState.currentUrl = ''; } };
const setupLoginButton = () => { allDOMElements.loginButtonArea.innerHTML = ''; if (checkLoginStatus()) { allDOMElements.loginButtonArea.innerHTML = `<button class="styled-button" id="continue-study-btn">Continue Study</button><button class="styled-button support-button" id="force-login-btn">Force Login</button>`; document.getElementById('continue-study-btn').onclick = () => showInterstitialAd('https://www.rolexcoderz.xyz/Course', false); document.getElementById('force-login-btn').onclick = () => showInterstitialAd('https://rolexcoderz.live/36xsuccess/', true); } else { allDOMElements.loginButtonArea.innerHTML = `<button class="styled-button" id="login-btn">Login for 36 Hours</button>`; document.getElementById('login-btn').onclick = () => showInterstitialAd('https://rolexcoderz.live/36xsuccess/', true); } };
const makeDraggable = (elmnt, header) => { let p1=0, p2=0, p3=0, p4=0; const dragHeader = header.querySelector('.fa-arrows-alt') || header; dragHeader.onmousedown = e => { e.preventDefault(); p3 = e.clientX; p4 = e.clientY; document.onmouseup = ()=>{document.onmouseup=null;document.onmousemove=null;}; document.onmousemove = e => { p1=p3-e.clientX; p2=p4-e.clientY; p3=e.clientX; p4=e.clientY; elmnt.style.top=(elmnt.offsetTop-p2)+"px"; elmnt.style.left=(elmnt.offsetLeft-p1)+"px"; }; }; };
const handleCalculator = () => { allDOMElements.calcButtons.addEventListener('click', (e) => { const target = e.target.closest('.calc-btn'); if (!target) return; const key = target.textContent; const display = allDOMElements.calcDisplay; if (key === 'C') { display.value = ''; } else if (key === '=') { try { display.value = new Function('return ' + display.value.replace(/[^-()\d/*+.]/g, ''))(); } catch { display.value = 'Error'; } } else { if (display.value === 'Error') display.value = ''; display.value += key; } }); };
const filterDashboard = () => { const searchTerm = allDOMElements.searchBar.value.toLowerCase().trim(); const activeCategory = allDOMElements.categoryFilter.querySelector('.active').dataset.category; let resultsFound = false; document.querySelectorAll('#dashboard-grid .content-card').forEach(card => { const keywords = card.dataset.keywords.toLowerCase(); const category = card.dataset.category; const categoryMatch = activeCategory === 'all' || category === activeCategory; const searchMatch = searchTerm === '' || keywords.split(' ').some(k => k.startsWith(searchTerm)); card.classList.toggle('hidden', !(categoryMatch && searchMatch)); if (categoryMatch && searchMatch) resultsFound = true; }); allDOMElements.noResultsMessage.classList.toggle('hidden', resultsFound); };
const handleDirectAd = () => { const directAdLinks = ['https://www.profitableratecpm.com/z3cci824?key=3ad08b148f03cc313b5357f5e120feaf', 'https://www.profitableratecpm.com/ezn24hhv5?key=a7daf987a4d652e9dfb0fd1fe4cd1cd5']; const overlay = allDOMElements.directAdOverlay; if (!overlay) return; const activateAd = () => { overlay.classList.add('active'); setTimeout(() => overlay.classList.remove('active'), 10000); }; overlay.addEventListener('click', () => { window.open(directAdLinks[Math.floor(Math.random() * directAdLinks.length)], '_blank'); overlay.classList.remove('active'); }); setInterval(activateAd, Math.random() * 20000 + 25000); };

// --- NEXUS HUB SYSTEM ---
const Nexus = {
    async init() {
        onSnapshot(doc(appState.db, "users", appState.userId), async (doc) => {
            appState.userData = doc.data();
            if (!appState.userData) return;
            this.updateProfilePod();
            this.generateDailyMissions();
            if (appState.userData.squadId) {
                this.showSquadView();
                this.listenForSquadUpdates(appState.userData.squadId);
            } else {
                this.showNoSquadView();
            }
        });
    },

    updateProfilePod() {
        const user = appState.userData;
        allDOMElements.nexusUserName.textContent = user.name || 'Anonymous';
        allDOMElements.nexusUserAvatar.textContent = (user.name || 'A').charAt(0).toUpperCase();
        allDOMElements.nexusUserPoints.textContent = user.nexusPoints || 0;
        allDOMElements.nexusUserStreak.textContent = user.streak || 0;
    },

    async awardPoints(points, actionId) {
        // More logic can be added here to prevent spamming actions
        const newPoints = (appState.userData.nexusPoints || 0) + points;
        await trackUserData({ nexusPoints: newPoints });
        showNotification(`+${points} Nexus Points!`, 'success');
    },

    async checkStreak() {
        const today = new Date().toISOString().slice(0, 10);
        const lastLogin = appState.userData.lastLoginDate;
        if (today === lastLogin) return; // Already logged in today

        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const currentStreak = appState.userData.streak || 0;
        const newStreak = (lastLogin === yesterday) ? currentStreak + 1 : 1;
        
        await trackUserData({ streak: newStreak, lastLoginDate: today });
        if (newStreak > currentStreak && newStreak > 1) {
            showNotification(`${newStreak} Day Streak! Keep it up!`, 'info');
        }
    },

    generateDailyMissions() {
        const todayStr = new Date().toISOString().slice(0, 10);
        const missions = [
            { id: 'play_game', text: 'Play Neuro-Link 2 times', reward: 50, goal: 2 },
            { id: 'visit_library', text: 'Visit the Books Library', reward: 25, goal: 1 },
            { id: 'use_calculator', text: 'Use the Calculator', reward: 10, goal: 1 },
            { id: 'support_us', text: 'Visit the Support Us page', reward: 40, goal: 1 },
            { id: 'force_login', text: 'Use the Force Login button', reward: 75, goal: 1 },
        ];
        
        // Simple seeded random function to get same missions for everyone daily
        let seed = todayStr.split('-').reduce((acc, val) => acc + parseInt(val), 0);
        const random = () => {
            var x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };
        
        const dailyMissions = [...missions].sort(() => random() - 0.5).slice(0, 3);
        
        const progress = appState.userData.missionProgress || {};
        if (progress.date !== todayStr) { // Reset missions daily
            progress.date = todayStr;
            progress.missions = {};
        }

        allDOMElements.dailyMissionsList.innerHTML = dailyMissions.map(mission => {
            const currentCount = progress.missions[mission.id] || 0;
            const isCompleted = currentCount >= mission.goal;
            return `
                <div class="mission-item ${isCompleted ? 'completed' : ''}">
                    <div class="mission-info">
                        <p>${mission.text}</p>
                        <span>Progress: ${currentCount} / ${mission.goal}</span>
                    </div>
                    <div class="mission-reward">
                        ${isCompleted ? '<i class="fas fa-check-circle"></i>' : `+${mission.reward} NP`}
                    </div>
                </div>
            `;
        }).join('');
    },

    async logMissionProgress(missionId) {
        const todayStr = new Date().toISOString().slice(0, 10);
        const progress = appState.userData.missionProgress || { date: todayStr, missions: {} };
        if (progress.date !== todayStr) return; // Old missions

        const currentCount = (progress.missions[missionId] || 0) + 1;
        progress.missions[missionId] = currentCount;

        // Check if mission was just completed
        const missions = [ { id: 'play_game', goal: 2, reward: 50 }, { id: 'visit_library', goal: 1, reward: 25 }, { id: 'use_calculator', goal: 1, reward: 10 }, { id: 'support_us', goal: 1, reward: 40 }, { id: 'force_login', goal: 1, reward: 75 }];
        const missionInfo = missions.find(m => m.id === missionId);
        if (missionInfo && currentCount === missionInfo.goal) {
            this.awardPoints(missionInfo.reward, `mission_${missionId}`);
        }
        await trackUserData({ missionProgress: progress });
    },

    showNoSquadView() {
        allDOMElements.noSquadView.classList.remove('hidden');
        allDOMElements.inSquadView.classList.add('hidden');
    },
    
    showSquadView() {
        allDOMElements.noSquadView.classList.add('hidden');
        allDOMElements.inSquadView.classList.remove('hidden');
    },

    async createSquad(squadName) {
        const squadCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const squadRef = doc(appState.db, "squads", squadCode);
        const batch = writeBatch(appState.db);

        batch.set(squadRef, {
            name: squadName,
            code: squadCode,
            members: [appState.userId],
            totalPoints: appState.userData.nexusPoints || 0,
            createdAt: serverTimestamp()
        });
        
        const userRef = doc(appState.db, "users", appState.userId);
        batch.update(userRef, { squadId: squadCode });

        await batch.commit();
        showNotification(`Squad "${squadName}" created!`, 'success');
    },

    async joinSquad(squadCode) {
        const squadRef = doc(appState.db, "squads", squadCode);
        const squadSnap = await getDoc(squadRef);

        if (!squadSnap.exists()) { showNotification("Squad code not found.", "error"); return; }
        
        const squad = squadSnap.data();
        if (squad.members.length >= 4) { showNotification("This squad is full.", "error"); return; }
        if (squad.members.includes(appState.userId)) { showNotification("You are already in this squad.", "info"); return; }

        const batch = writeBatch(appState.db);
        const newMembers = [...squad.members, appState.userId];
        batch.update(squadRef, { members: newMembers });

        const userRef = doc(appState.db, "users", appState.userId);
        batch.update(userRef, { squadId: squadCode });

        await batch.commit();
        showNotification(`Joined squad "${squad.name}"!`, 'success');
    },

    async leaveSquad() {
        if (!appState.userData.squadId) return;
        const squadRef = doc(appState.db, "squads", appState.userData.squadId);
        const squadSnap = await getDoc(squadRef);
        if (!squadSnap.exists()) { await trackUserData({ squadId: null }); return; }

        const squad = squadSnap.data();
        const batch = writeBatch(appState.db);
        const newMembers = squad.members.filter(id => id !== appState.userId);

        if (newMembers.length === 0) {
            batch.delete(squadRef); // Delete squad if last member leaves
        } else {
            batch.update(squadRef, { members: newMembers });
        }

        const userRef = doc(appState.db, "users", appState.userId);
        batch.update(userRef, { squadId: null });

        await batch.commit();
        showNotification(`You have left the squad.`, 'info');
    },

    listenForSquadUpdates(squadId) {
        const squadRef = doc(appState.db, "squads", squadId);
        onSnapshot(squadRef, async (docSnap) => {
            if (!docSnap.exists()) { this.showNoSquadView(); return; }
            appState.squadData = docSnap.data();
            allDOMElements.squadNameDisplay.textContent = appState.squadData.name;
            allDOMElements.squadInviteCode.value = appState.squadData.code;
            
            const memberDocs = await Promise.all(appState.squadData.members.map(id => getDoc(doc(appState.db, "users", id))));
            const membersData = memberDocs.map(doc => doc.data());
            
            const totalPoints = membersData.reduce((sum, user) => sum + (user.nexusPoints || 0), 0);
            allDOMElements.squadPointsDisplay.textContent = totalPoints;

            allDOMElements.squadMembersList.innerHTML = membersData.map(member => `
                <div class="squad-member">
                    <div class="squad-member-info">
                        <div class="nexus-avatar" style="width:40px; height:40px; font-size:1.2rem;">${(member.name || 'A').charAt(0)}</div>
                        <span>${member.name || 'Anonymous'}</span>
                    </div>
                    <span>${member.nexusPoints || 0} NP</span>
                </div>
            `).join('');
        });
    },

    async renderLeaderboard(type) {
        const targetEl = document.getElementById(`leaderboard-${type}`);
        targetEl.innerHTML = '<div class="mission-item placeholder" style="height: 60px;"></div>'.repeat(5);
        
        let q;
        if (type === 'global') {
            q = query(collection(appState.db, "users"), orderBy("nexusPoints", "desc"), limit(50));
        } else if (type === 'local') {
            const country = appState.userData.location?.country || 'Unknown';
            q = query(collection(appState.db, "users"), where("location.country", "==", country), orderBy("nexusPoints", "desc"), limit(50));
        } else {
            q = query(collection(appState.db, "squads"), orderBy("totalPoints", "desc"), limit(50));
        }

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => doc.data());

        targetEl.innerHTML = `<ol class="leaderboard-list">${data.map((item, index) => `
            <li class="leaderboard-item ${item.id === appState.userId ? 'current-user' : ''}">
                <span class="leaderboard-rank">${index + 1}</span>
                <span class="leaderboard-name">${item.name || 'Anonymous Squad'}</span>
                <span class="leaderboard-points">${item.nexusPoints || item.totalPoints || 0} NP</span>
            </li>
        `).join('')}</ol>`;
    }
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
        
        await Nexus.init();
        await Nexus.checkStreak();
        
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
    allDOMElements.closeTelegramModal.onclick = () => { allDOMElements.telegramModal.classList.remove('visible'); if (!localStorage.getItem('sagarRajUserInfo')) { allDOMElements.userInfoModal.classList.add('visible'); } else { setupLoginButton(); } showView('main-view'); handleDirectAd(); };
    allDOMElements.userInfoForm.addEventListener('submit', (e) => { e.preventDefault(); const userInfo = { name: document.getElementById('user-name').value, class: document.getElementById('user-class').value, age: document.getElementById('user-age').value }; localStorage.setItem('sagarRajUserInfo', JSON.stringify(userInfo)); allDOMElements.userInfoModal.classList.remove('visible'); setupLoginButton(); trackUserData(); });
    allDOMElements.websiteFrame.addEventListener('load', () => allDOMElements.iframeLoader.classList.remove('visible'));
    allDOMElements.supportUsBtn.addEventListener('click', () => { showInterstitialAd(null, false); showView('support-view'); Nexus.logMissionProgress('support_us'); });
    allDOMElements.backToMainBtn.addEventListener('click', () => showView('main-view'));
    allDOMElements.commandCenterBtn.addEventListener('click', () => { allDOMElements.sidePanel.classList.toggle('visible'); allDOMElements.commandCenterBtn.classList.toggle('open'); });
    allDOMElements.sidePanelNav.addEventListener('click', (e) => { const button = e.target.closest('.side-panel-button'); if (!button) return; allDOMElements.sidePanel.classList.remove('visible'); allDOMElements.commandCenterBtn.classList.remove('open'); switch (button.id) { case 'side-panel-exit-btn': showView('main-view'); allDOMElements.websiteFrame.src = 'about:blank'; appState.iframeHistory = []; appState.currentUrl = ''; break; case 'side-panel-back-btn': navigateBack(); break; case 'side-panel-profile-btn': launchSite('https://fibergoddev.github.io/Sagar-Projects/Cont/profile.html', false); break; case 'side-panel-game-btn': showInterstitialAd('game.html', false); Nexus.logMissionProgress('play_game'); break; case 'side-panel-calculator-btn': allDOMElements.calculator.classList.toggle('visible'); Nexus.logMissionProgress('use_calculator'); break; case 'side-panel-notes-btn': allDOMElements.notesWidget.classList.toggle('visible'); break; case 'side-panel-focus-btn': allDOMElements.focusOverlay.classList.toggle('active'); button.querySelector('i').classList.toggle('fa-eye-slash'); break; case 'side-panel-permissions-btn': allDOMElements.permissionsModal.classList.add('visible'); break; } });
    allDOMElements.closePermissionsModal.addEventListener('click', () => allDOMElements.permissionsModal.classList.remove('visible'));
    allDOMElements.grantCameraBtn.addEventListener('click', async () => { try { await navigator.mediaDevices.getUserMedia({ video: true }); showNotification('Camera permission granted!', 'success'); } catch (err) { showNotification('Camera permission was denied.', 'error'); } });
    allDOMElements.grantNotifyBtn.addEventListener('click', async () => { /* Logic for push notifications will go here */ });
    allDOMElements.notesTextarea.value = localStorage.getItem('sagarRajNotes') || '';
    allDOMElements.notesTextarea.addEventListener('keyup', () => localStorage.setItem('sagarRajNotes', allDOMElements.notesTextarea.value));
    allDOMElements.searchBar.addEventListener('input', filterDashboard);
    allDOMElements.categoryFilter.addEventListener('click', (e) => { if (e.target.matches('.category-btn')) { allDOMElements.categoryFilter.querySelector('.active').classList.remove('active'); e.target.classList.add('active'); filterDashboard(); } });
    allDOMElements.playGameBtn.addEventListener('click', () => { showInterstitialAd('game.html', false); Nexus.logMissionProgress('play_game'); });
    allDOMElements.booksSectionLink.addEventListener('click', () => Nexus.logMissionProgress('visit_library'));
    allDOMElements.adBarToggle.addEventListener('click', () => allDOMElements.rightAdBar.classList.toggle('expanded'));
    makeDraggable(allDOMElements.notesWidget, allDOMElements.notesHeader);
    makeDraggable(allDOMElements.calculator, allDOMElements.calcHeader);
    handleCalculator();
    loadAds();
    filterDashboard();
    ['mousemove', 'keypress', 'scroll', 'click'].forEach(evt => window.addEventListener(evt, resetInactivityTimer));
    if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW registration failed:', err)); }); }

    // Nexus Hub Event Listeners
    allDOMElements.nexusHubBtn.addEventListener('click', () => allDOMElements.nexusHubModal.classList.add('visible'));
    allDOMElements.nexusHubCloseBtn.addEventListener('click', () => allDOMElements.nexusHubModal.classList.remove('visible'));
    allDOMElements.nexusNavBtns.forEach(btn => btn.addEventListener('click', () => {
        allDOMElements.nexusNavBtns.forEach(b => b.classList.remove('active'));
        allDOMElements.nexusViews.forEach(v => v.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
    }));
    allDOMElements.leaderboardTabs.forEach(btn => btn.addEventListener('click', () => {
        allDOMElements.leaderboardTabs.forEach(b => b.classList.remove('active'));
        allDOMElements.leaderboardContents.forEach(v => v.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.dataset.target;
        document.getElementById(targetId).classList.add('active');
        Nexus.renderLeaderboard(targetId.replace('leaderboard-', ''));
    }));
    allDOMElements.createSquadForm.addEventListener('submit', e => { e.preventDefault(); Nexus.createSquad(allDOMElements.createSquadName.value); });
    allDOMElements.joinSquadForm.addEventListener('submit', e => { e.preventDefault(); Nexus.joinSquad(allDOMElements.joinSquadCode.value.toUpperCase()); });
    allDOMElements.copySquadCodeBtn.addEventListener('click', () => { navigator.clipboard.writeText(allDOMElements.squadInviteCode.value); showNotification('Invite code copied!', 'success'); });
    allDOMElements.leaveSquadBtn.addEventListener('click', () => Nexus.leaveSquad());
});
