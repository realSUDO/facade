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
            chatMessages.innerHTML = `<div class="message system-msg">Persona switched to ${currentPersonaName}!</div>`;
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
            
            // Remove loading
            document.getElementById(loadingId).remove();
            
            // Add AI message to UI
            addMessageToUI('ai', aiReply.content);
            
            // Add to state
            messages.push(aiReply);

        } catch (error) {
            console.error(error);
            document.getElementById(loadingId).remove();
            addMessageToUI('system', 'Error: Could not reach the AI. Check server logs.');
            messages.pop(); // Remove the user message from state since it failed
        } finally {
            messageInput.disabled = false;
            messageInput.focus();
        }
    });

    function addMessageToUI(role, content, id = null) {
        const div = document.createElement('div');
        div.classList.add('message');
        
        if (role === 'user') {
            div.classList.add('user-msg');
        } else if (role === 'ai') {
            div.classList.add('ai-msg');
            div.classList.add(currentPersona + '-msg');
        } else {
            div.classList.add('system-msg');
        }

        if (id) {
            div.id = id;
        }

        div.textContent = content;
        chatMessages.appendChild(div);
        
        // Scroll to bottom
        const chatContainer = document.getElementById('chat-container');
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});
