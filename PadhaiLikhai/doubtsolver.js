/* * Designed & Developed by Sagar Raj
 * Version 42: Definitive AI Doubt-Solver Core - Limit Break Edition
 */

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
    const apiKey = ""; // This will be provided by the execution environment.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${AIzaSyBhePX5IDdCVBRwaM9u0KAHF58mb3T3GjU}`;

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
    // Use a regex that is safer against HTML injection
    element.innerHTML = element.innerHTML.replace(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g, (match) => {
        const isBlock = match.startsWith('$$');
        const cleanExpr = match.substring(isBlock ? 2 : 1, match.length - (isBlock ? 2 : 1));
        try {
            return katex.renderToString(cleanExpr, {
                throwOnError: false,
                displayMode: isBlock
            });
        } catch (e) {
            console.error("KaTeX rendering error:", e);
            return match; // Return original string on error
        }
    });
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

const handleMic = { /* Voice recognition logic can be added here */ };

// ** THE FIX **: Mobile Keyboard Handling
const handleVirtualKeyboard = () => {
    if (!('visualViewport' in window)) return;
    
    const setViewHeight = () => {
        const vh = window.visualViewport.height;
        ui.view.style.height = `${vh}px`;
        scrollToBottom();
    };

    window.visualViewport.addEventListener('resize', setViewHeight);
    setViewHeight(); // Set initial height
};

// --- App Initialization Sequence ---
function initializeSolverApp(firebase) {
    state.auth = firebase.auth;
    state.db = firebase.db;
    state.userId = firebase.userId;

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
    
    handleVirtualKeyboard();
}

// --- Event-Driven Application Start ---
document.addEventListener('solverFirebaseReady', (e) => {
    console.log("Solver Firebase is ready. Initializing AI Doubt-Solver.");
    initializeSolverApp(e.detail);
});

document.addEventListener('solverFirebaseFailed', (e) => {
    console.error("Solver Firebase failed to initialize. App cannot start.", e.detail.error);
    const conversation = document.getElementById('conversation-container');
    conversation.innerHTML = ''; // Clear any existing messages
    addMessage('ai', `<p>A critical error occurred while connecting to the AI services. Please check your connection and refresh the page. (Developed by Sagar Raj)</p>`);
    document.getElementById('input-area').style.display = 'none'; // Hide input on failure
});
