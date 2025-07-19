/* * Designed & Developed by Sagar Raj
 * Version 40: Definitive Nexus Hub Core Logic - Limit Break Edition
 */

// Import all necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, writeBatch, orderBy, limit, onSnapshot, updateDoc, arrayUnion, arrayRemove, deleteField } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- DOM Element Cache ---
const ui = {
    loaderOverlay: document.getElementById('loader-overlay'), loaderStatus: document.getElementById('loader-status'), nexusHubView: document.getElementById('nexus-hub-view'), notificationContainer: document.getElementById('notification-container'),
    nexusUserAvatar: document.getElementById('nexus-user-avatar'), nexusUserName: document.getElementById('nexus-user-name'), nexusUserPoints: document.getElementById('nexus-user-points'), nexusUserStreak: document.getElementById('nexus-user-streak'), userBadgesContainer: document.getElementById('user-badges-container'),
    nexusNavBtns: document.querySelectorAll('.nexus-nav-btn'), nexusViews: document.querySelectorAll('.nexus-view'),
    dailyMissionsList: document.getElementById('daily-missions-list'),
    noSquadView: document.getElementById('no-squad-view'), inSquadView: document.getElementById('in-squad-view'), createSquadForm: document.getElementById('create-squad-form'), joinSquadForm: document.getElementById('join-squad-form'), createSquadName: document.getElementById('create-squad-name'), joinSquadCode: document.getElementById('join-squad-code'),
    squadNameDisplay: document.getElementById('squad-name-display'), squadPointsDisplay: document.getElementById('squad-points-display'), squadInviteCode: document.getElementById('squad-invite-code'), copySquadCodeBtn: document.getElementById('copy-squad-code-btn'), squadMemberCount: document.getElementById('squad-member-count'), squadMembersList: document.getElementById('squad-members-list'), leaveSquadBtn: document.getElementById('leave-squad-btn'), squadManagementPanel: document.getElementById('squad-management-panel'), deleteSquadBtn: document.getElementById('delete-squad-btn'),
    leaderboardTabs: document.querySelectorAll('.leaderboard-tab-btn'), leaderboardContents: document.querySelectorAll('.leaderboard-content'), leaderboardAdSlot: document.getElementById('leaderboard-ad-slot'),
    rewardOverlay: document.getElementById('reward-overlay'), rewardTitle: document.querySelector('.reward-title'), rewardPoints: document.querySelector('.reward-points'),
};

// --- App State ---
const state = {
    db: null, auth: null, userId: null, userData: null, squadData: null,
};

// --- Core Functions ---
const showNotification = (message, type = 'info') => { const n = document.createElement('div'); n.className = `notification ${type}`; n.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}"></i><span>${message}</span>`; ui.notificationContainer.appendChild(n); setTimeout(() => n.remove(), 5000); };

const playRewardAnimation = (rewardText, title = "Mission Complete!") => {
    ui.rewardTitle.textContent = title;
    ui.rewardPoints.textContent = rewardText;
    ui.rewardOverlay.classList.remove('hidden');
    setTimeout(() => {
        ui.rewardOverlay.classList.add('hidden');
    }, 2500);
};

// --- The Unimaginable Nexus System ---
const Nexus = {
    async init(firebase) {
        state.db = firebase.db;
        state.auth = firebase.auth;
        state.userId = firebase.userId;

        onSnapshot(doc(state.db, "users", state.userId), async (doc) => {
            if (!doc.exists() || !doc.data().name) {
                await this.createUserDocument();
                return;
            }
            state.userData = doc.data();
            this.updateProfilePod();
            this.updateBadges();
            this.generateDailyMissions();

            if (state.userData.squadId) {
                this.listenForSquadUpdates(state.userData.squadId);
                this.showSquadView();
            } else {
                this.showNoSquadView();
            }
        });
    },

    async createUserDocument() {
        const userRef = doc(state.db, "users", state.userId);
        const storedUserInfo = JSON.parse(localStorage.getItem('sagarRajUserInfo') || '{}');
        await setDoc(userRef, {
            id: state.userId,
            name: storedUserInfo.name || `User-${state.userId.slice(0, 4)}`,
            nexusPoints: 0,
            streak: 0,
            lastLoginDate: '1970-01-01',
            badges: [],
            createdAt: serverTimestamp()
        }, { merge: true });
    },

    updateProfilePod() { /* ... unchanged ... */ },
    updateBadges() { /* ... unchanged ... */ },
    async awardPoints(points, title) { /* ... unchanged ... */ },
    generateDailyMissions() { /* ... unchanged ... */ },
    async logMissionProgress(missionId) { /* ... unchanged ... */ },
    showNoSquadView() { /* ... unchanged ... */ },
    showSquadView() { /* ... unchanged ... */ },
    async createSquad(squadName) { /* ... unchanged ... */ },
    async joinSquad(squadCode) { /* ... unchanged ... */ },
    async leaveSquad() { /* ... unchanged ... */ },
    listenForSquadUpdates(squadId) { /* ... unchanged ... */ },
    async renderLeaderboard(type) { /* ... unchanged ... */ },
};

// --- Main Execution Block ---
document.addEventListener('nexusFirebaseReady', (e) => {
    console.log("Nexus Firebase is ready. Initializing Nexus Hub.");
    Nexus.init(e.detail);
    
    // Hide loader and show the app
    setTimeout(() => {
        ui.loaderOverlay.classList.add('hidden');
        ui.nexusHubView.classList.remove('hidden');
    }, 500);
});

document.addEventListener('nexusFirebaseFailed', (e) => {
    console.error("Nexus Firebase failed to initialize. Hub cannot start.", e.detail.error);
    ui.loaderStatus.innerHTML = `<div style="text-align: center; color: var(--danger-color);"><p>Connection Failed</p><button id="retry-btn" class="styled-button support-button" style="margin-top: 20px;">Retry</button></div>`;
    document.getElementById('retry-btn').onclick = () => window.location.reload();
});

// Attach all other event listeners
document.addEventListener('DOMContentLoaded', () => {
    ui.nexusNavBtns.forEach(btn => btn.addEventListener('click', () => {
        ui.nexusNavBtns.forEach(b => b.classList.remove('active'));
        ui.nexusViews.forEach(v => v.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
    }));
    
    ui.leaderboardTabs.forEach(btn => btn.addEventListener('click', () => {
        ui.leaderboardTabs.forEach(b => b.classList.remove('active'));
        ui.leaderboardContents.forEach(v => v.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.dataset.target;
        document.getElementById(targetId).classList.add('active');
        Nexus.renderLeaderboard(targetId.replace('leaderboard-', ''));
    }));

    ui.createSquadForm.addEventListener('submit', e => { e.preventDefault(); Nexus.createSquad(ui.createSquadName.value); });
    ui.joinSquadForm.addEventListener('submit', e => { e.preventDefault(); Nexus.joinSquad(ui.joinSquadCode.value.toUpperCase()); });
    ui.copySquadCodeBtn.addEventListener('click', () => { navigator.clipboard.writeText(ui.squadInviteCode.value); showNotification('Invite code copied!', 'success'); });
    ui.leaveSquadBtn.addEventListener('click', () => Nexus.leaveSquad());
});
