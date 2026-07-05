document.addEventListener('DOMContentLoaded', async () => {
    const appScreen = document.getElementById('app-screen');
    const loginScreen = document.getElementById('login-screen');
    let isAuthenticated = false;

    function updateDots(usedMessages) {
        const tracker = document.getElementById('message-tracker');
        if (!tracker) return;
        tracker.innerHTML = '';
        
        const remaining = 10 - usedMessages;
        let color = '#4ade80'; // Green
        if (remaining <= 6) color = '#facc15'; // Yellow
        if (remaining <= 3) color = '#ef4444'; // Red

        for (let i = 0; i < 10; i++) {
            const dot = document.createElement('div');
            dot.classList.add('tracker-dot');
            if (i < remaining) {
                dot.classList.add('active');
                dot.style.backgroundColor = color;
            } else {
                dot.classList.add('inactive');
            }
            tracker.appendChild(dot);
        }
    }

    function updateAuthUI(isAuth) {
        const tracker = document.getElementById('message-tracker');
        const logoutBtn = document.getElementById('logout-btn');
        const personaDropdown = document.getElementById('persona-dropdown');
        
        if (tracker) tracker.style.display = isAuth ? 'flex' : 'none';
        if (logoutBtn) logoutBtn.style.display = isAuth ? 'flex' : 'none';
        if (personaDropdown) personaDropdown.style.display = isAuth ? 'flex' : 'none';
    }

    if (appScreen && loginScreen) {
        try {
            const res = await axios.get('/api/auth/me');
            isAuthenticated = true;
            updateDots(res.data.message_count || 0);
            updateAuthUI(true);
            appScreen.style.display = 'flex';
            loginScreen.style.display = 'none';
        } catch (e) {
            isAuthenticated = false;
            updateAuthUI(false);
            appScreen.style.display = 'none';
            loginScreen.style.display = 'flex';
        }
    }

    const loginForm = document.getElementById('login-form');
    const loginEmail = document.getElementById('login-email');
    const loginMsg = document.getElementById('login-msg');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginEmail.value.trim();
            if (!email) return;

            loginMsg.textContent = "Sending magic link...";
            
            try {
                const res = await axios.post('/api/auth/login', { email });
                loginMsg.textContent = res.data.message || "Check your email for the magic link!";
                loginEmail.value = '';
            } catch (err) {
                console.error(err);
                if (err.response && err.response.data && err.response.data.error) {
                    loginMsg.textContent = "Error: " + err.response.data.error;
                } else {
                    loginMsg.textContent = "Failed to send magic link. Try again.";
                }
            }
        });
    }

    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    let messages = [];
    let currentPersona = 'persona1';
    
    async function loadHistory() {
        if (!isAuthenticated) return;
        try {
            chatMessages.innerHTML = `<div class="message-row" style="justify-content: center;"><div class="message system-msg">Loading history...</div></div>`;
            const res = await axios.get(`/api/chat?persona=${currentPersona}`);
            
            chatMessages.innerHTML = '';
            messages = [];
            
            const history = res.data.messages || [];
            if (history.length === 0) {
                const name = currentPersona === 'persona1' ? 'Hitesh Choudhary' : 'Piyush Garg';
                chatMessages.innerHTML = `<div class="message-row" style="justify-content: center;"><div class="message system-msg">Say hi to ${name}!</div></div>`;
            } else {
                history.forEach(msg => {
                    messages.push({ role: msg.role, content: msg.content });
                    addMessageToUI(msg.role, msg.content);
                });
            }
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (e) {
            console.error("Failed to load history", e);
            chatMessages.innerHTML = `<div class="message-row" style="justify-content: center;"><div class="message system-msg">Error loading history.</div></div>`;
        }
    }

    if (isAuthenticated) {
        loadHistory();
    }
    
    const dropdownSelected = document.getElementById('dropdown-selected');
    const dropdownOptions = document.getElementById('dropdown-options');
    
    dropdownSelected.addEventListener('click', (e) => {
        dropdownOptions.classList.toggle('show');
        e.stopPropagation();
    });
    
    document.addEventListener('click', () => {
        dropdownOptions.classList.remove('show');
    });
    
    document.querySelectorAll('.dropdown-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const newPersona = e.target.getAttribute('data-value');
            const currentPersonaName = e.target.textContent;
            
            if (newPersona !== currentPersona) {
                currentPersona = newPersona;
                dropdownSelected.textContent = currentPersonaName;
                loadHistory();
            }
        });
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await axios.post('/api/auth/logout');
                isAuthenticated = false;
                messages = [];
                chatMessages.innerHTML = '';
                appScreen.style.display = 'none';
                loginScreen.style.display = 'flex';
                updateAuthUI(false);
                if (loginMsg) loginMsg.textContent = "Logged out successfully.";
            } catch (e) {
                console.error("Logout failed", e);
            }
        });
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const text = messageInput.value.trim();
        if (!text) return;

        // Clear initial/system message if this is the first message
        if (messages.length === 0) {
            chatMessages.innerHTML = '';
        }

        // Add user message to UI
        addMessageToUI('user', text);
        messageInput.value = '';
        messageInput.disabled = true;

        // Add to state
        messages.push({ role: 'user', content: text });

        // Show loading
        const loadingId = 'loading-' + Date.now();
        addMessageToUI('ai', '...', loadingId);

        try {
            const response = await axios.post('/api/chat', {
                persona: currentPersona,
                messages: messages
            });

            if (response.data.message_count !== undefined) {
                updateDots(response.data.message_count);
            }

            const aiReply = response.data.reply;
            
            // Update the existing loading row instead of creating a new one
            const loadingRow = document.getElementById(loadingId);
            if (loadingRow) {
                const msgDiv = loadingRow.querySelector('.message');
                msgDiv.textContent = aiReply.content;
                loadingRow.removeAttribute('id');
            }
            
            // Add to state
            messages.push(aiReply);

        } catch (error) {
            console.error(error);
            const loadingRow = document.getElementById(loadingId);
            if (loadingRow) loadingRow.remove();
            
            const errMsg = error.response && error.response.data && error.response.data.error 
                ? error.response.data.error 
                : 'Error: Could not reach the AI. Check server logs.';
                
            addMessageToUI('system', errMsg);
            messages.pop(); // Remove the user message from state since it failed
        } finally {
            messageInput.disabled = false;
            messageInput.focus();
        }
    });

    function addMessageToUI(role, content, id = null) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('message-row');
        
        const avatarImg = document.createElement('img');
        avatarImg.classList.add('avatar');
        
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');
        msgDiv.textContent = content;

        if (id) {
            rowDiv.id = id;
        }

        if (role === 'user') {
            rowDiv.classList.add('user-row');
            msgDiv.classList.add('user-msg');
            avatarImg.src = 'user.png';
            avatarImg.setAttribute('data-tooltip', 'You');
            rowDiv.appendChild(msgDiv);
            rowDiv.appendChild(avatarImg);
        } else if (role === 'ai' || role === 'assistant') {
            rowDiv.classList.add('ai-row');
            msgDiv.classList.add('ai-msg');
            msgDiv.classList.add(currentPersona + '-msg');
            const isHitesh = currentPersona === 'persona1';
            avatarImg.src = isHitesh ? 'Hitesh.png' : 'Piyush.png';
            avatarImg.setAttribute('data-tooltip', isHitesh ? 'Hitesh Choudhary' : 'Piyush Garg');
            rowDiv.appendChild(avatarImg);
            rowDiv.appendChild(msgDiv);
        } else {
            msgDiv.classList.add('system-msg');
            rowDiv.appendChild(msgDiv);
            rowDiv.style.justifyContent = 'center';
        }
        
        chatMessages.appendChild(rowDiv);
        
        // Scroll to bottom
        const chatContainer = document.getElementById('chat-container');
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});
