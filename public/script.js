document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const personaSelect = document.getElementById('persona');

    let messages = [];

    // Clear chat when persona changes
    personaSelect.addEventListener('change', () => {
        messages = [];
        chatMessages.innerHTML = `<div class="message system-msg">Persona switched to ${personaSelect.options[personaSelect.selectedIndex].text}!</div>`;
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const text = messageInput.value.trim();
        if (!text) return;

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
                persona: personaSelect.value,
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
