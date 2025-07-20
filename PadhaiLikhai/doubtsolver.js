/* * Designed & Developed by Sagar Raj
 * Version 42: Definitive AI Doubt-Solver Core - Limit Break Edition
 */

// Import all necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
    view: document.getElementById('solver-view'),
    conversationContainer: document.getElementById('conversation-container'),
    inputArea: document.getElementById('input-area'),
    textInput: document.getElementById('text-input'),
    sendBtn: document.getElementById('send-btn'),
    cameraBtn: document.getElementById('camera-btn'),
    micBtn: document.getElementById('mic-btn'),
    cameraModal: document.getElementById('camera-modal'),
    closeCameraBtn: document.getElementById('close-camera-btn'),
    cameraFeed: document.getElementById('camera-feed'),
    photoCanvas: document.getElementById('photo-canvas'),
    captureBtn: document.getElementById('capture-btn'),
    notificationContainer: document.getElementById('notification-container'),
};

// --- App State ---
const state = {
    db: null,
    auth: null,
    userId: null,
    isRecognizing: false,
    recognition: null,
    cameraStream: null,
};

// --- Core Functions ---
const showNotification = (message, type = 'info') => {
    const n = document.createElement('div');
    n.className = `notification ${type}`;
    n.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-times-circle'}"></i><span>${message}</span>`;
    ui.notificationContainer.appendChild(n);
    setTimeout(() => n.remove(), 5000);
};

const autoResizeTextarea = () => {
    ui.textInput.style.height = 'auto';
    ui.textInput.style.height = ui.textInput.scrollHeight + 'px';
    ui.sendBtn.disabled = ui.textInput.value.trim().length === 0;
};

const scrollToBottom = () => {
    ui.conversationContainer.scrollTop = ui.conversationContainer.scrollHeight;
};

// --- Chat UI Management ---
const addMessage = (sender, content) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;

    const avatarClass = sender === 'ai' ? 'ai-avatar' : 'user-avatar';
    const storedUserInfo = JSON.parse(localStorage.getItem('sagarRajUserInfo') || '{}');
    const userNameInitial = (storedUserInfo.name || 'U').charAt(0).toUpperCase();
    const avatarIcon = sender === 'ai' ? '<i class="fas fa-robot"></i>' : userNameInitial;

    messageDiv.innerHTML = `
        <div class="chat-avatar ${avatarClass}">${avatarIcon}</div>
        <div class="chat-bubble">${content}</div>
    `;
    ui.conversationContainer.appendChild(messageDiv);
    scrollToBottom();
    return messageDiv.querySelector('.chat-bubble');
};

// --- AI Interaction ---
const askAI = async (prompt, base64ImageData = null) => {
    const typingBubble = addMessage('ai', '<div class="typing-indicator"><span></span><span></span><span></span></div>');
    ui.sendBtn.disabled = true;
    ui.textInput.disabled = true;

    // This is my personal prompt engineering, Sagar Raj.
    const engineeredPrompt = `
        **Persona:** You are Sagar-AI, an expert AI tutor personally developed by the legendary coder Sagar Raj for the PadhaiLikhai app. Your tone is helpful, encouraging, and highly intelligent. You are here to solve any academic doubt.

        **Task:** Solve the following problem step-by-step. Explain your reasoning clearly and concisely. 
        
        **Formatting Rules:**
        1.  For mathematical equations, you MUST use KaTeX format.
        2.  Enclose display-style formulas (on their own line) in double dollar signs, like this: \`$$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}$$\`.
        3.  Enclose inline formulas (within a sentence) in single dollar signs, like this: \`The value is $v = d/t$.\`.
        4.  Use Markdown for lists, bold text, and code blocks where appropriate.

        **User's Question:**
        ${prompt}
    `;

    let chatHistory = [];
    const parts = [{ text: engineeredPrompt }];
    if (base64ImageData) {
        parts.push({
            inlineData: {
                mimeType: "image/jpeg",
                data: base64ImageData
            }
        });
    }
    chatHistory.push({ role: "user", parts });

    const payload = { contents: chatHistory };
    const apiKey = ""; // Provided by the environment
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const result = await response.json();
        let aiResponse = "I apologize, I couldn't process that request. Please try again.";
        if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts.length > 0) {
            aiResponse = result.candidates[0].content.parts[0].text;
        }
        
        typingBubble.innerHTML = aiResponse;
        renderMathInElement(typingBubble);

    } catch (error) {
        console.error("AI Error:", error);
        typingBubble.innerHTML = `<p>Sorry, an error occurred while connecting to the AI. Please check your connection and try again. (Developed by Sagar Raj)</p>`;
    } finally {
        ui.sendBtn.disabled = ui.textInput.value.trim().length === 0;
        ui.textInput.disabled = false;
        ui.textInput.focus();
        scrollToBottom();
    }
};

// --- Math Rendering ---
const renderMathInElement = (element) => {
    if (typeof katex === 'undefined') return;
    const mathExpressions = element.innerHTML.match(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
    if (mathExpressions) {
        mathExpressions.forEach(expr => {
            const isBlock = expr.startsWith('$$');
            const cleanExpr = expr.substring(isBlock ? 2 : 1, expr.length - (isBlock ? 2 : 1));
            try {
                const renderedMath = katex.renderToString(cleanExpr, {
                    throwOnError: false,
                    displayMode: isBlock
                });
                element.innerHTML = element.innerHTML.replace(expr, renderedMath);
            } catch (e) {
                console.error("KaTeX rendering error:", e);
            }
        });
    }
};

// --- Input Handlers ---
const handleSend = () => {
    const prompt = ui.textInput.value.trim();
    if (!prompt) return;

    addMessage('user', `<p>${prompt.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`);
    ui.textInput.value = '';
    autoResizeTextarea();
    askAI(prompt);
};

const handleCamera = {
    async open() {
        try {
            state.cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            ui.cameraFeed.srcObject = state.cameraStream;
            ui.cameraModal.classList.remove('hidden');
        } catch (err) {
            showNotification("Camera access denied. Please enable it in your browser settings.", "error");
        }
    },
    close() {
        state.cameraStream?.getTracks().forEach(track => track.stop());
        ui.cameraModal.classList.add('hidden');
    },
    capture() {
        const canvas = ui.photoCanvas;
        canvas.width = ui.cameraFeed.videoWidth;
        canvas.height = ui.cameraFeed.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(ui.cameraFeed, 0, 0, canvas.width, canvas.height);
        
        const base64ImageData = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
        this.close();

        addMessage('user', `<p>Solving the problem in the image...</p><img src="data:image/jpeg;base64,${base64ImageData}" style="max-width: 100%; border-radius: 10px; margin-top: 10px;">`);
        askAI("Solve the problem shown in this image.", base64ImageData);
    }
};

const handleMic = { /* ... unchanged ... */ };

// ** THE FIX **: Mobile Keyboard Handling
const handleVirtualKeyboard = () => {
    if (!('visualViewport' in window)) return;
    const initialHeight = window.innerHeight;
    window.visualViewport.addEventListener('resize', () => {
        const newHeight = window.visualViewport.height;
        // If keyboard is open, shrink the view
        if (newHeight < initialHeight - 100) {
            const offset = window.visualViewport.offsetTop;
            ui.view.style.height = `${newHeight}px`;
            scrollToBottom();
        } else {
            // Keyboard is closed, restore height
            ui.view.style.height = '100vh';
        }
    });
};

// --- App Initialization Sequence ---
async function initializeSolverApp() {
    try {
        const app = initializeApp(firebaseConfig, "doubtSolverApp");
        state.auth = getAuth(app);
        state.db = getFirestore(app);
        const userCredential = await signInAnonymously(state.auth);
        state.userId = userCredential.user.uid;

        // Attach all event listeners
        ui.sendBtn.addEventListener('click', handleSend);
        ui.textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });
        ui.textInput.addEventListener('input', autoResizeTextarea);
        ui.cameraBtn.addEventListener('click', () => handleCamera.open());
        ui.closeCameraBtn.addEventListener('click', () => handleCamera.close());
        ui.captureBtn.addEventListener('click', () => handleCamera.capture());
        
        // handleMic.init();
        // ui.micBtn.addEventListener('click', () => handleMic.toggle());
        
        handleVirtualKeyboard();
        
    } catch (error) {
        console.error("Firebase Initialization Error:", error);
        addMessage('ai', `<p>A critical error occurred while connecting to the AI services. Please check your connection and refresh the page. (Developed by Sagar Raj)</p>`);
    }
}

// --- Main Execution Block ---
document.addEventListener('DOMContentLoaded', initializeSolverApp);
