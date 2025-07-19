/* * Designed & Developed by Sagar Raj
 * Version 37: Definitive Nexus Hub System - Limit Break Edition
 */

// Import all necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, writeBatch, orderBy, limit, onSnapshot, updateDoc, arrayUnion, arrayRemove, deleteField } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

const playRewardAnimation = (rewardText) => {
    ui.rewardPoints.textContent = rewardText;
    ui.rewardOverlay.classList.remove('hidden');
    setTimeout(() => {
        ui.rewardOverlay.classList.add('hidden');
    }, 2500); // Animation duration
};

// --- The Unimaginable Nexus System ---
const Nexus = {
    async init() {
        // Listen for real-time updates to the user's data document
        onSnapshot(doc(state.db, "users", state.userId), async (doc) => {
            if (!doc.exists()) {
                // This is a failsafe for new users, ensuring a document is created.
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
            name: storedUserInfo.name || 'Anonymous',
            nexusPoints: 0,
            streak: 0,
            lastLoginDate: '1970-01-01',
            badges: [],
            createdAt: serverTimestamp()
        }, { merge: true });
    },

    updateProfilePod() {
        const user = state.userData;
        ui.nexusUserName.textContent = user.name || 'Anonymous';
        ui.nexusUserAvatar.textContent = (user.name || 'A').charAt(0).toUpperCase();
        ui.nexusUserPoints.textContent = user.nexusPoints || 0;
        ui.nexusUserStreak.textContent = user.streak || 0;
    },

    updateBadges() {
        const badges = [
            { id: 'founder', icon: 'fas fa-crown', title: 'Founder Badge (Top 100 User)' },
            { id: 'streak_7', icon: 'fas fa-fire-alt', title: '7 Day Streak' },
            { id: 'points_1k', icon: 'fas fa-star-of-life', title: '1000+ Nexus Points' },
            { id: 'squad_leader', icon: 'fas fa-shield-alt', title: 'Squad Owner' }
        ];
        
        const earnedBadges = state.userData.badges || [];
        ui.userBadgesContainer.innerHTML = badges.map(badge => `
            <div class="badge ${earnedBadges.includes(badge.id) ? 'earned' : ''}" title="${badge.title}">
                <i class="${badge.icon}"></i>
            </div>
        `).join('');
    },

    async awardPoints(points, actionId) {
        const newPoints = (state.userData.nexusPoints || 0) + points;
        await updateDoc(doc(state.db, "users", state.userId), { nexusPoints: newPoints });
        playRewardAnimation(`+${points} NP`);
    },

    generateDailyMissions() {
        const todayStr = new Date().toISOString().slice(0, 10);
        const missions = [
            { id: 'play_game', text: 'Play Neuro-Link 3 times', reward: 50, goal: 3, type: 'action' },
            { id: 'visit_library', text: 'Visit the Books Library', reward: 25, goal: 1, type: 'action' },
            { id: 'tracer_notify', text: 'Secure Your Account: Enable Notifications', reward: 150, goal: 1, type: 'permission' },
            { id: 'revenue_ad', text: 'Watch a Rewarded Ad for a Bonus', reward: 100, goal: 1, type: 'revenue' },
            { id: 'squad_up', text: 'Join or Create a Squad', reward: 200, goal: 1, type: 'action' },
        ];
        let seed = todayStr.split('-').reduce((acc, val) => acc + parseInt(val), 0);
        const random = () => { let x = Math.sin(seed++) * 10000; return x - Math.floor(x); };
        const dailyMissions = [...missions].sort(() => random() - 0.5).slice(0, 3);
        
        const progress = state.userData.missionProgress || {};
        if (progress.date !== todayStr) { progress.date = todayStr; progress.missions = {}; }

        ui.dailyMissionsList.innerHTML = dailyMissions.map(mission => {
            const currentCount = progress.missions[mission.id] || 0;
            const isCompleted = currentCount >= mission.goal;
            return `
                <div class="mission-item ${isCompleted ? 'completed' : ''}">
                    <div class="mission-info">
                        <p>${mission.text}</p>
                        <span>Progress: ${currentCount} / ${mission.goal}</span>
                    </div>
                    <button class="mission-claim-btn" data-mission-id="${mission.id}" ${isCompleted ? 'disabled' : ''}>
                        ${isCompleted ? '<i class="fas fa-check-circle"></i> Claimed' : `+${mission.reward} NP`}
                    </button>
                </div>`;
        }).join('');
    },
    
    // ... other Nexus functions ...
    showNoSquadView() { ui.noSquadView.classList.remove('hidden'); ui.inSquadView.classList.add('hidden'); },
    showSquadView() { ui.noSquadView.classList.add('hidden'); ui.inSquadView.classList.remove('hidden'); },
    
    async createSquad(squadName) { /* ... logic ... */ },
    async joinSquad(squadCode) { /* ... logic ... */ },
    async leaveSquad() { /* ... logic ... */ },
    listenForSquadUpdates(squadId) { /* ... logic ... */ },
    async renderLeaderboard(type) { /* ... logic ... */ },
};

// --- App Initialization Sequence ---
async function main() {
    try {
        const app = initializeApp(firebaseConfig);
        state.db = getFirestore(app);
        state.auth = getAuth(app);
        
        const userCredential = await signInAnonymously(state.auth);
        state.userId = userCredential.user.uid;
        
        await Nexus.init();
        
        ui.loaderOverlay.classList.add('hidden');
        ui.nexusHubView.classList.remove('hidden');
        
    } catch (error) {
        console.error("Firebase Initialization Error:", error);
        ui.loaderStatus.innerHTML = `<div style="text-align: center; color: var(--danger-color);"><p>Connection Failed</p><button id="retry-btn" class="styled-button support-button" style="margin-top: 20px;">Retry</button></div>`;
        document.getElementById('retry-btn').onclick = () => window.location.reload();
    }
}

// --- Main Execution Block ---
document.addEventListener('DOMContentLoaded', () => {
    main();

    // Event Listeners for Nexus Hub
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
