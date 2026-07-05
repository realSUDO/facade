document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    let messages = [];
    let currentPersona = 'persona1';
    
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
            currentPersona = e.target.getAttribute('data-value');
            const currentPersonaName = e.target.textContent;
            dropdownSelected.textContent = currentPersonaName;
            
            // Clear chat when persona changes
            messages = [];
            chatMessages.innerHTML = `<div class="message-row" style="justify-content: center;"><div class="message system-msg">Persona switched to ${currentPersonaName}!</div></div>`;
        });
    });

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
            addMessageToUI('system', 'Error: Could not reach the AI. Check server logs.');
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
            rowDiv.appendChild(msgDiv);
            rowDiv.appendChild(avatarImg);
        } else if (role === 'ai') {
            rowDiv.classList.add('ai-row');
            msgDiv.classList.add('ai-msg');
            msgDiv.classList.add(currentPersona + '-msg');
            avatarImg.src = currentPersona === 'persona1' ? 'Hitesh.png' : 'Piyush.png';
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
