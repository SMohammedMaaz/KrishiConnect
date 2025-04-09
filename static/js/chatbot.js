/**
 * KrishiConnect AI Assistant
 * Intelligent chatbot to help farmers and buyers navigate the platform
 */
class KrishiConnectChatbot {
    constructor() {
        this.chatContainer = null;
        this.chatLauncher = null;
        this.chatBody = null;
        this.chatInput = null;
        this.sendButton = null;
        this.isOpen = false;
        this.isTyping = false;
        this.currentLanguage = 'en';
        this.initMessages = {
            'en': 'Hello! I\'m KrishiBot, your agriculture assistant. How can I help you today?',
            'hi': 'नमस्ते! मैं कृषिबॉट हूँ, आपका कृषि सहायक। आज मैं आपकी कैसे मदद कर सकता हूँ?',
            'ta': 'வணக்கம்! நான் கிருஷிபாட், உங்கள் விவசாய உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
            'te': 'హలో! నేను కృషిబాట్, మీ వ్యవసాయ సహాయకుడిని. నేడు నేను మీకు ఎలా సహాయం చేయగలను?',
            'kn': 'ನಮಸ್ಕಾರ! ನಾನು ಕೃಷಿಬಾಟ್, ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
            'ml': 'ഹലോ! ഞാൻ കൃഷിബോട്ട്, നിങ്ങളുടെ കാർഷിക സഹായി. ഇന്ന് എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാൻ കഴിയും?',
            'mr': 'नमस्कार! मी कृषिबॉट आहे, तुमचा कृषी मदतनीस. आज मी तुम्हाला कशी मदत करू शकतो?',
            'gu': 'નમસ્તે! હું કૃષિબોટ છું, તમારો કૃષિ સહાયક. આજે હું તમને કેવી રીતે મદદ કરી શકું?'
        };
    }

    /**
     * Initialize the chatbot UI and functionality
     */
    init() {
        this._createChatbotUI();
        this._attachEventListeners();
        
        // Add initial message after a delay
        setTimeout(() => {
            this._addBotMessage(this.initMessages[this.currentLanguage]);
            this._suggestQuickReplies([
                { text: 'How to sell crops?', language: 'en' },
                { text: 'Weather forecast', language: 'en' },
                { text: 'Find buyers nearby', language: 'en' },
                { text: 'Crop price trends', language: 'en' }
            ]);
        }, 1000);
    }

    /**
     * Create the chatbot UI elements
     */
    _createChatbotUI() {
        // Add chat launcher button (shown when chat is closed)
        this.chatLauncher = document.createElement('div');
        this.chatLauncher.className = 'chat-launcher';
        this.chatLauncher.innerHTML = '<div class="notification-dot"></div><i data-feather="message-circle"></i>';
        document.body.appendChild(this.chatLauncher);

        // Create the main chatbot container
        this.chatContainer = document.createElement('div');
        this.chatContainer.className = 'chatbot-container';
        this.chatContainer.innerHTML = `
            <div class="chat-header">
                <div class="chat-title">
                    <span class="chat-icon"><i data-feather="cpu"></i></span>
                    <span>KrishiBot AI Assistant</span>
                </div>
                <div class="language-selector">
                    <select id="chat-language">
                        <option value="en">English</option>
                        <option value="hi">हिंदी</option>
                        <option value="ta">தமிழ்</option>
                        <option value="te">తెలుగు</option>
                        <option value="kn">ಕನ್ನಡ</option>
                        <option value="ml">മലയാളം</option>
                        <option value="mr">मराठी</option>
                        <option value="gu">ગુજરાતી</option>
                    </select>
                </div>
                <button class="chat-toggle">
                    <i data-feather="chevron-down"></i>
                </button>
            </div>
            <div class="chat-body"></div>
            <div class="chat-footer">
                <input type="text" class="chat-input" placeholder="Type a message...">
                <button class="voice-input-btn">
                    <i data-feather="mic"></i>
                </button>
                <button class="chat-send" disabled>
                    <i data-feather="send"></i>
                </button>
            </div>
        `;
        document.body.appendChild(this.chatContainer);

        // Initialize references to UI elements
        this.chatBody = this.chatContainer.querySelector('.chat-body');
        this.chatInput = this.chatContainer.querySelector('.chat-input');
        this.sendButton = this.chatContainer.querySelector('.chat-send');
        this.voiceButton = this.chatContainer.querySelector('.voice-input-btn');
        this.languageSelector = this.chatContainer.querySelector('#chat-language');
        
        // Initialize Feather icons in the chatbot
        if (window.feather) {
            feather.replace('.chatbot-container [data-feather]');
            feather.replace('.chat-launcher [data-feather]');
        }
    }

    /**
     * Attach event listeners to chatbot elements
     */
    _attachEventListeners() {
        // Toggle chatbot open/closed
        this.chatLauncher.addEventListener('click', () => this._openChat());
        this.chatContainer.querySelector('.chat-toggle').addEventListener('click', () => this._toggleChat());
        
        // Send message on button click
        this.sendButton.addEventListener('click', () => this._handleUserInput());
        
        // Send message on Enter key
        this.chatInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this._handleUserInput();
            }
            // Enable/disable send button based on input
            this.sendButton.disabled = this.chatInput.value.trim() === '';
        });
        
        // Enable/disable send button on input change
        this.chatInput.addEventListener('input', () => {
            this.sendButton.disabled = this.chatInput.value.trim() === '';
        });
        
        // Voice input button
        this.voiceButton.addEventListener('click', () => this._toggleVoiceInput());
        
        // Language selector
        this.languageSelector.addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            this._addBotMessage(this.initMessages[this.currentLanguage]);
            
            // Change quick reply language for demo
            const quickReplies = {
                'en': [
                    { text: 'How to sell crops?', language: 'en' },
                    { text: 'Weather forecast', language: 'en' },
                    { text: 'Find buyers nearby', language: 'en' },
                    { text: 'Crop price trends', language: 'en' }
                ],
                'hi': [
                    { text: 'फसल कैसे बेचें?', language: 'hi' },
                    { text: 'मौसम का पूर्वानुमान', language: 'hi' },
                    { text: 'आस-पास के खरीदार', language: 'hi' },
                    { text: 'फसल मूल्य प्रवृत्ति', language: 'hi' }
                ],
                'ta': [
                    { text: 'பயிர்களை எப்படி விற்பது?', language: 'ta' },
                    { text: 'வானிலை முன்னறிவிப்பு', language: 'ta' },
                    { text: 'அருகில் உள்ள வாங்குபவர்கள்', language: 'ta' },
                    { text: 'பயிர் விலை போக்குகள்', language: 'ta' }
                ],
                // Default to English for other languages in demo
                'default': [
                    { text: 'How to sell crops?', language: 'en' },
                    { text: 'Weather forecast', language: 'en' },
                    { text: 'Find buyers nearby', language: 'en' },
                    { text: 'Crop price trends', language: 'en' }
                ]
            };
            
            this._suggestQuickReplies(quickReplies[this.currentLanguage] || quickReplies['default']);
        });
    }

    /**
     * Handle user message input
     */
    _handleUserInput() {
        const userMessage = this.chatInput.value.trim();
        if (userMessage === '') return;
        
        // Add user message to chat
        this._addUserMessage(userMessage);
        
        // Clear input
        this.chatInput.value = '';
        this.sendButton.disabled = true;
        
        // Show bot typing indicator
        this._showTypingIndicator();
        
        // Process the message and get response (with artificial delay for realistic effect)
        setTimeout(() => {
            this._processUserInput(userMessage);
        }, 1500);
    }

    /**
     * Add user message to chat
     */
    _addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageElement.innerHTML = `
            <div class="user-message">
                ${message}
                <span class="message-time">${time}</span>
            </div>
        `;
        
        this.chatBody.appendChild(messageElement);
        this._scrollToBottom();
    }

    /**
     * Add bot message to chat
     */
    _addBotMessage(message) {
        // Remove typing indicator if it exists
        this._hideTypingIndicator();
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageElement.innerHTML = `
            <div class="bot-message">
                ${message}
                <span class="message-time">${time}</span>
            </div>
        `;
        
        this.chatBody.appendChild(messageElement);
        this._scrollToBottom();
    }

    /**
     * Show bot typing indicator
     */
    _showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const typingElement = document.createElement('div');
        typingElement.className = 'chat-message';
        typingElement.id = 'bot-typing';
        
        typingElement.innerHTML = `
            <div class="bot-typing">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        
        this.chatBody.appendChild(typingElement);
        this._scrollToBottom();
    }

    /**
     * Hide bot typing indicator
     */
    _hideTypingIndicator() {
        this.isTyping = false;
        const typingElement = document.getElementById('bot-typing');
        if (typingElement) {
            typingElement.remove();
        }
    }

    /**
     * Process user input and generate appropriate response
     */
    _processUserInput(message) {
        // In a real application, this would call a backend API or use a chatbot service
        // For demo purposes, using simple keyword matching
        
        message = message.toLowerCase();
        
        if (message.includes('sell') || message.includes('selling') || message.includes('फसल बेचें')) {
            this._addBotMessage('To sell your crops on KrishiConnect: 1) Register and verify your account 2) Add your product with photos and details 3) Wait for buyer inquiries or browse available buyers in your area.');
            this._suggestQuickReplies([
                { text: 'How to register?', language: 'en' },
                { text: 'Upload product photos', language: 'en' },
                { text: 'Contact buyers', language: 'en' }
            ]);
        }
        else if (message.includes('weather') || message.includes('forecast') || message.includes('मौसम')) {
            this._addBotMessage('The weather forecast for your region shows sunny conditions with a high of 32°C for the next 3 days. Ideal conditions for harvesting wheat and rice crops.');
            this._suggestQuickReplies([
                { text: 'Weekly forecast', language: 'en' },
                { text: 'Crop suggestions', language: 'en' },
                { text: 'Rain predictions', language: 'en' }
            ]);
        }
        else if (message.includes('buyer') || message.includes('खरीदार')) {
            this._addBotMessage('I\'ve found 12 potential buyers within 50km of your location. Top matches include Singh Food Processors (buying rice, 5 tons) and Mehta Exports (buying wheat, 10 tons).');
            this._suggestQuickReplies([
                { text: 'Contact buyers', language: 'en' },
                { text: 'Filter by crop', language: 'en' },
                { text: 'Price negotiations', language: 'en' }
            ]);
        }
        else if (message.includes('price') || message.includes('prices') || message.includes('मूल्य')) {
            this._addBotMessage('Current market prices in your region: Rice: ₹2,250-2,400/quintal (↑5% from last week), Wheat: ₹2,100/quintal (stable), Tomatoes: ₹1,800/quintal (↓10% due to seasonal surplus)');
            this._suggestQuickReplies([
                { text: 'Price predictions', language: 'en' },
                { text: 'Price alerts', language: 'en' },
                { text: 'Compare markets', language: 'en' }
            ]);
        }
        else if (message.includes('register') || message.includes('account') || message.includes('login') || message.includes('पंजीकरण')) {
            this._addBotMessage('To register on KrishiConnect: 1) Click "Join as Farmer" or "Join as Buyer" on the home page 2) Provide your details and verify your identity 3) Complete your profile with location and preferences');
            this._suggestQuickReplies([
                { text: 'Farmer registration', language: 'en' },
                { text: 'Buyer registration', language: 'en' },
                { text: 'Forgot password', language: 'en' }
            ]);
        }
        else if (message.includes('crop') || message.includes('grow') || message.includes('plant') || message.includes('फसल')) {
            this._addBotMessage('Based on your location, soil type, and current market demand, the most profitable crops to grow this season would be: 1) Turmeric (high market demand) 2) Pulses (government subsidy available) 3) Sweet Corn (rising urban market demand)');
            this._suggestQuickReplies([
                { text: 'Soil testing', language: 'en' },
                { text: 'Seed suppliers', language: 'en' },
                { text: 'Organic farming', language: 'en' }
            ]);
        }
        else if (message.includes('loan') || message.includes('finance') || message.includes('credit') || message.includes('ऋण')) {
            this._addBotMessage('KrishiConnect partners with several financial institutions offering agricultural loans. Current options include: NABARD Kisan Credit Card (7% interest), SBI Agri Gold Loan (8.5% interest), and Microfinance options starting at ₹25,000.');
            this._suggestQuickReplies([
                { text: 'Loan eligibility', language: 'en' },
                { text: 'Apply for credit', language: 'en' },
                { text: 'Govt subsidies', language: 'en' }
            ]);
        }
        else {
            this._addBotMessage('I\'m here to help with questions about selling crops, finding buyers, checking market prices, and getting agricultural advice. What would you like to know about?');
            this._suggestQuickReplies([
                { text: 'Sell my crops', language: 'en' },
                { text: 'Find buyers', language: 'en' },
                { text: 'Check prices', language: 'en' },
                { text: 'Farming advice', language: 'en' }
            ]);
        }
    }

    /**
     * Add quick reply suggestions
     */
    _suggestQuickReplies(replies) {
        const quickRepliesContainer = document.createElement('div');
        quickRepliesContainer.className = 'quick-replies';
        
        replies.forEach(reply => {
            const button = document.createElement('button');
            button.className = 'quick-reply-btn';
            button.textContent = reply.text;
            button.addEventListener('click', () => {
                this._addUserMessage(reply.text);
                this._showTypingIndicator();
                setTimeout(() => {
                    this._processUserInput(reply.text);
                }, 1000);
            });
            quickRepliesContainer.appendChild(button);
        });
        
        this.chatBody.appendChild(quickRepliesContainer);
        this._scrollToBottom();
    }

    /**
     * Open the chat
     */
    _openChat() {
        this.isOpen = true;
        this.chatContainer.classList.add('open');
        this.chatLauncher.style.display = 'none';
        this._scrollToBottom();
    }

    /**
     * Toggle chat open/closed
     */
    _toggleChat() {
        if (this.isOpen) {
            this.chatContainer.classList.remove('open');
            this.chatLauncher.style.display = 'flex';
        } else {
            this.chatContainer.classList.add('open');
            this.chatLauncher.style.display = 'none';
        }
        this.isOpen = !this.isOpen;
    }

    /**
     * Toggle voice input
     */
    _toggleVoiceInput() {
        // In a real implementation, this would use the Web Speech API
        this.voiceButton.classList.toggle('recording');
        
        if (this.voiceButton.classList.contains('recording')) {
            // Simulate recording for demo purposes
            setTimeout(() => {
                this.voiceButton.classList.remove('recording');
                this.chatInput.value = "What are the current rice prices?";
                this.sendButton.disabled = false;
            }, 3000);
        }
    }

    /**
     * Scroll chat to bottom
     */
    _scrollToBottom() {
        this.chatBody.scrollTop = this.chatBody.scrollHeight;
    }
}

// Initialize the chatbot when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a moment for other scripts to load
    setTimeout(() => {
        const krishiBot = new KrishiConnectChatbot();
        krishiBot.init();
    }, 1000);
});