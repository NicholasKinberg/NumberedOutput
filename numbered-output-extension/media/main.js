/* global acquireVsCodeApi */
(function() {
    const vscode = acquireVsCodeApi();
    
    // DOM elements
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const clearBtn = document.getElementById('clear-btn');
    const typingIndicator = document.getElementById('typing-indicator');
    const typingText = document.getElementById('typing-text');

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    clearBtn.addEventListener('click', clearHistory);
    messageInput.addEventListener('keydown', handleKeyDown);

    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessageToChat('user', message);
        
        // Clear input
        messageInput.value = '';
        
        // Send to extension
        vscode.postMessage({
            command: 'sendMessage',
            text: message
        });
    }

    function clearHistory() {
        vscode.postMessage({
            command: 'clearHistory'
        });
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    function addMessageToChat(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = formatMessageContent(content);
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function formatMessageContent(content) {
        // Convert markdown-like formatting to HTML
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/\n/g, '<br>');
        
        return formatted;
    }

    function showTyping(message) {
        typingText.textContent = message;
        typingIndicator.style.display = 'block';
    }

    function hideTyping() {
        typingIndicator.style.display = 'none';
    }

    // Listen for messages from the extension
    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.command) {
            case 'addMessage':
                addMessageToChat(message.message.role, message.message.content);
                hideTyping();
                break;
                
            case 'showTyping':
                showTyping(message.message);
                break;
                
            case 'historyCleared':
                chatMessages.innerHTML = `
                    <div class="message assistant-message">
                        <div class="message-content">
                            Chat history cleared. How can I help you today?
                        </div>
                    </div>
                `;
                hideTyping();
                break;
        }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    // Focus input on load
    messageInput.focus();
})();
