/**
 * AgroLink AI Assistant
 * Intelligent chatbot to help farmers and buyers navigate the platform
 */
class AgroLinkChatbot {
    constructor() {
        this.container = null;
        this.button = null;
        this.chat = null;
        this.messages = null;
        this.input = null;
        this.sendButton = null;
        this.voiceButton = null;
        this.languageSelect = null;
        this.isOpen = false;
        this.currentLanguage = 'en';
        this.isListening = false;
        this.recognition = null;
        this.suggestedReplies = [
            'How do I sell my crops?',
            'How to verify my account?',
            'Market prices today',
            'Weather forecast',
            'Connect with buyers',
            'Get crop suggestions'
        ];
        
        // Translations for multilingual support
        this.translations = {
            en: {
                title: 'KrishiBot',
                welcome: 'Hello! 👋 I\'m KrishiBot, your farming assistant. How can I help you today?',
                inputPlaceholder: 'Type your message here...',
                send: 'Send',
                voice: 'Voice',
                close: 'Close',
                suggestions: 'You can ask me about:',
                typingIndicator: 'KrishiBot is typing...'
            },
            hi: {
                title: 'कृषिबॉट',
                welcome: 'नमस्ते! 👋 मैं कृषिबॉट हूँ, आपका कृषि सहायक। आज मैं आपकी कैसे मदद कर सकता हूँ?',
                inputPlaceholder: 'अपना संदेश यहां लिखें...',
                send: 'भेजें',
                voice: 'आवाज़',
                close: 'बंद करें',
                suggestions: 'आप मुझसे पूछ सकते हैं:',
                typingIndicator: 'कृषिबॉट टाइप कर रहा है...'
            },
            ta: {
                title: 'கிருஷிபாட்',
                welcome: 'வணக்கம்! 👋 நான் கிருஷிபாட், உங்கள் விவசாய உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
                inputPlaceholder: 'உங்கள் செய்தியை இங்கே தட்டச்சு செய்யவும்...',
                send: 'அனுப்புக',
                voice: 'குரல்',
                close: 'மூடு',
                suggestions: 'நீங்கள் என்னிடம் கேட்கலாம்:',
                typingIndicator: 'கிருஷிபாட் தட்டச்சு செய்கிறது...'
            }
        };
        
        // Quick replies translations
        this.quickRepliesTranslations = {
            en: [
                'How do I sell my crops?',
                'How to verify my account?',
                'Market prices today',
                'Weather forecast',
                'Connect with buyers',
                'Get crop suggestions'
            ],
            hi: [
                'मैं अपनी फसल कैसे बेचूं?',
                'अपना खाता कैसे सत्यापित करें?',
                'आज के बाजार भाव',
                'मौसम का पूर्वानुमान',
                'खरीदारों से जुड़ें',
                'फसल सुझाव प्राप्त करें'
            ],
            ta: [
                'எனது பயிர்களை எப்படி விற்பது?',
                'எனது கணக்கை எப்படி சரிபார்ப்பது?',
                'இன்றைய சந்தை விலைகள்',
                'வானிலை முன்னறிவிப்பு',
                'வாங்குபவர்களுடன் இணைக',
                'பயிர் பரிந்துரைகளைப் பெறுக'
            ]
        };
        
        // Predefined responses
        this.responses = {
            en: {
                'sell_crops': `To sell your crops on KrishiConnect:
                    1. Log in to your farmer account
                    2. Click on "Add New Product" on your dashboard
                    3. Fill in details like crop type, quantity, price, etc.
                    4. Upload clear photos of your produce
                    5. Submit your listing
                    
                    Your listing will be visible to buyers in your area!`,
                    
                'verify_account': `To verify your account:
                    
                    For Farmers:
                    1. Complete your profile with accurate details
                    2. Enter your Aadhar number
                    3. Complete the verification process via OTP
                    4. Our team will verify your details within 24-48 hours
                    
                    For Buyers:
                    1. Complete your profile with accurate details
                    2. Upload any business registration documents if applicable
                    3. Verification usually takes 24-48 hours`,
                    
                'market_prices': `Current market prices (₹ per quintal):
                    
                    Rice: ₹2,240 (↑ 2.5%)
                    Wheat: ₹2,100 (↓ 1.2%)
                    Maize: ₹1,850 (↑ 0.8%)
                    Soybeans: ₹3,600 (↑ 3.2%)
                    Cotton: ₹6,500 (↓ 0.5%)
                    
                    These prices are updated daily. For more detailed information, check the Market Prices section on the dashboard.`,
                    
                'weather': `Today's weather forecast for your region:
                    
                    Temperature: 32°C
                    Humidity: 45%
                    Wind: 12 km/h
                    
                    Agricultural Advisory:
                    Good conditions for wheat harvest. Complete harvesting within 2-3 days to avoid potential rain.
                    
                    For more detailed weather information and advisories, check the Weather section on the dashboard.`,
                    
                'connect_buyers': `To connect with buyers:
                    
                    1. Ensure your products are listed with accurate details
                    2. Check the "Inquiries" section on your dashboard for buyer messages
                    3. Respond promptly to inquiries
                    4. You can also view nearby buyers in the "Nearby Buyers" section
                    5. Use the chat feature to communicate directly
                    
                    Pro tip: Listings with clear photos and detailed descriptions get more buyer interest!`,
                    
                'crop_suggestions': `Based on current market trends and your location, here are some crop suggestions:
                    
                    1. Soybeans - High demand and good price trend
                    2. Pulses (especially Moong and Urad) - Limited supply in markets
                    3. Vegetables (Tomatoes, Onions) - Good off-season prices
                    
                    For personalized crop suggestions based on your specific location, soil type, and other factors, please go to the "Crop Advisory" section in your dashboard.`,
                    
                'default': `I'm not sure I understand. Could you please rephrase your question or choose from one of these topics?`
            },
            // Hindi responses
            hi: {
                'sell_crops': `कृषिकनेक्ट पर अपनी फसल बेचने के लिए:
                    1. अपने किसान खाते में लॉग इन करें
                    2. अपने डैशबोर्ड पर "नया उत्पाद जोड़ें" पर क्लिक करें
                    3. फसल प्रकार, मात्रा, मूल्य आदि जैसे विवरण भरें
                    4. अपनी उपज की स्पष्ट तस्वीरें अपलोड करें
                    5. अपनी लिस्टिंग सबमिट करें
                    
                    आपकी लिस्टिंग आपके क्षेत्र के खरीदारों को दिखाई देगी!`,
                    
                'verify_account': `अपने खाते को सत्यापित करने के लिए:
                    
                    किसानों के लिए:
                    1. सटीक विवरण के साथ अपना प्रोफ़ाइल पूरा करें
                    2. अपना आधार नंबर दर्ज करें
                    3. OTP के माध्यम से सत्यापन प्रक्रिया पूरी करें
                    4. हमारी टीम 24-48 घंटों के भीतर आपके विवरणों का सत्यापन करेगी
                    
                    खरीदारों के लिए:
                    1. सटीक विवरण के साथ अपना प्रोफ़ाइल पूरा करें
                    2. यदि लागू हो तो कोई भी व्यापार पंजीकरण दस्तावेज़ अपलोड करें
                    3. सत्यापन आमतौर पर 24-48 घंटे लेता है`,
                    
                'market_prices': `वर्तमान बाजार मूल्य (₹ प्रति क्विंटल):
                    
                    चावल: ₹2,240 (↑ 2.5%)
                    गेहूं: ₹2,100 (↓ 1.2%)
                    मक्का: ₹1,850 (↑ 0.8%)
                    सोयाबीन: ₹3,600 (↑ 3.2%)
                    कपास: ₹6,500 (↓ 0.5%)
                    
                    ये कीमतें रोजाना अपडेट की जाती हैं। अधिक विस्तृत जानकारी के लिए, डैशबोर्ड पर मार्केट प्राइज़ सेक्शन देखें।`,
                    
                'weather': `आपके क्षेत्र के लिए आज का मौसम पूर्वानुमान:
                    
                    तापमान: 32°C
                    आर्द्रता: 45%
                    हवा: 12 किमी/घंटा
                    
                    कृषि सलाह:
                    गेहूं की कटाई के लिए अच्छी स्थिति। संभावित बारिश से बचने के लिए 2-3 दिनों के भीतर कटाई पूरी करें।
                    
                    अधिक विस्तृत मौसम जानकारी और सलाह के लिए, डैशबोर्ड पर मौसम अनुभाग देखें।`,
                    
                'connect_buyers': `खरीदारों से जुड़ने के लिए:
                    
                    1. सुनिश्चित करें कि आपके उत्पाद सटीक विवरण के साथ सूचीबद्ध हैं
                    2. खरीदार संदेशों के लिए अपने डैशबोर्ड पर "पूछताछ" अनुभाग देखें
                    3. पूछताछ का तुरंत जवाब दें
                    4. आप "निकटवर्ती खरीदार" अनुभाग में पास के खरीदारों को भी देख सकते हैं
                    5. सीधे संवाद करने के लिए चैट सुविधा का उपयोग करें
                    
                    प्रो टिप: स्पष्ट फोटो और विस्तृत विवरण वाली लिस्टिंग को अधिक खरीदार का रुचि मिलता है!`,
                    
                'crop_suggestions': `वर्तमान बाजार रुझानों और आपके स्थान के आधार पर, यहां कुछ फसल सुझाव हैं:
                    
                    1. सोयाबीन - उच्च मांग और अच्छा मूल्य रुझान
                    2. दालें (विशेषकर मूंग और उड़द) - बाजारों में सीमित आपूर्ति
                    3. सब्जियां (टमाटर, प्याज) - अच्छे ऑफ-सीजन मूल्य
                    
                    आपके विशिष्ट स्थान, मिट्टी के प्रकार, और अन्य कारकों के आधार पर व्यक्तिगत फसल सुझावों के लिए, कृपया अपने डैशबोर्ड में "फसल सलाह" अनुभाग पर जाएं।`,
                    
                'default': `मुझे समझ नहीं आया। कृपया अपना प्रश्न दोबारा फिर से पूछें या इनमें से किसी एक विषय का चयन करें?`
            },
            // Tamil responses
            ta: {
                'sell_crops': `கிருஷிகனெக்ட்டில் உங்கள் பயிர்களை விற்பது எப்படி:
                    1. உங்கள் விவசாயி கணக்கில் உள்நுழையவும்
                    2. உங்கள் டாஷ்போர்டில் "புதிய தயாரிப்பு சேர்" என்பதைக் கிளிக் செய்யவும்
                    3. பயிர் வகை, அளவு, விலை போன்ற விவரங்களை நிரப்பவும்
                    4. உங்கள் விளைபொருட்களின் தெளிவான புகைப்படங்களைப் பதிவேற்றவும்
                    5. உங்கள் பட்டியலை சமர்ப்பிக்கவும்
                    
                    உங்கள் பட்டியல் உங்கள் பகுதியில் உள்ள வாங்குபவர்களுக்குத் தெரியும்!`,
                    
                'verify_account': `உங்கள் கணக்கைச் சரிபார்க்க:
                    
                    விவசாயிகளுக்கு:
                    1. துல்லியமான விவரங்களுடன் உங்கள் சுயவிவரத்தை முடிக்கவும்
                    2. உங்கள் ஆதார் எண்ணை உள்ளிடவும்
                    3. OTP மூலம் சரிபார்ப்புச் செயல்முறையை முடிக்கவும்
                    4. எங்கள் குழு 24-48 மணிநேரத்திற்குள் உங்கள் விவரங்களைச் சரிபார்க்கும்
                    
                    வாங்குபவர்களுக்கு:
                    1. துல்லியமான விவரங்களுடன் உங்கள் சுயவிவரத்தை முடிக்கவும்
                    2. பொருந்தக்கூடிய வணிகப் பதிவு ஆவணங்களைப் பதிவேற்றவும்
                    3. சரிபார்ப்பு பொதுவாக 24-48 மணிநேரம் எடுக்கும்`,
                    
                'market_prices': `தற்போதைய சந்தை விலைகள் (₹ குவிண்டால்):
                    
                    அரிசி: ₹2,240 (↑ 2.5%)
                    கோதுமை: ₹2,100 (↓ 1.2%)
                    சோளம்: ₹1,850 (↑ 0.8%)
                    சோயாபீன்ஸ்: ₹3,600 (↑ 3.2%)
                    பருத்தி: ₹6,500 (↓ 0.5%)
                    
                    இந்த விலைகள் தினமும் புதுப்பிக்கப்படுகின்றன. மேலும் விரிவான தகவலுக்கு, டாஷ்போர்டில் சந்தை விலைகள் பிரிவைப் பார்க்கவும்.`,
                    
                'weather': `உங்கள் பகுதிக்கான இன்றைய வானிலை முன்னறிவிப்பு:
                    
                    வெப்பநிலை: 32°C
                    ஈரப்பதம்: 45%
                    காற்று: 12 கிமீ/மணி
                    
                    விவசாய ஆலோசனை:
                    கோதுமை அறுவடைக்கு நல்ல நிலைமைகள். சாத்தியமான மழையைத் தவிர்க்க 2-3 நாட்களுக்குள் அறுவடையை முடிக்கவும்.
                    
                    மேலும் விரிவான வானிலை தகவல் மற்றும் ஆலோசனைகளுக்கு, டாஷ்போர்டில் வானிலை பிரிவைப் பார்க்கவும்.`,
                    
                'connect_buyers': `வாங்குபவர்களுடன் இணைவது எப்படி:
                    
                    1. உங்கள் தயாரிப்புகள் துல்லியமான விவரங்களுடன் பட்டியலிடப்பட்டுள்ளதை உறுதிசெய்யவும்
                    2. வாங்குபவர் செய்திகளுக்கு உங்கள் டாஷ்போர்டில் "விசாரணைகள்" பிரிவைப் பார்க்கவும்
                    3. விசாரணைகளுக்கு உடனடியாக பதிலளிக்கவும்
                    4. "அருகிலுள்ள வாங்குபவர்கள்" பிரிவில் அருகிலுள்ள வாங்குபவர்களையும் பார்க்கலாம்
                    5. நேரடியாகத் தொடர்பு கொள்ள அரட்டை அம்சத்தைப் பயன்படுத்தவும்
                    
                    முக்கிய குறிப்பு: தெளிவான புகைப்படங்கள் மற்றும் விரிவான விளக்கங்களுடன் கூடிய பட்டியல்கள் அதிக வாங்குபவர் ஆர்வத்தைப் பெறுகின்றன!`,
                    
                'crop_suggestions': `தற்போதைய சந்தை போக்குகள் மற்றும் உங்கள் இருப்பிடத்தின் அடிப்படையில், இங்கே சில பயிர் பரிந்துரைகள் உள்ளன:
                    
                    1. சோயாபீன்ஸ் - அதிக தேவை மற்றும் நல்ல விலை போக்கு
                    2. பருப்பு வகைகள் (குறிப்பாக பாசிப்பயறு மற்றும் உளுந்து) - சந்தைகளில் குறைந்த விநியோகம்
                    3. காய்கறிகள் (தக்காளி, வெங்காயம்) - நல்ல ஆஃப்-சீசன் விலைகள்
                    
                    உங்கள் குறிப்பிட்ட இருப்பிடம், மண் வகை மற்றும் பிற காரணிகளின் அடிப்படையில் தனிப்பயனாக்கப்பட்ட பயிர் பரிந்துரைகளுக்கு, உங்கள் டாஷ்போர்டில் "பயிர் ஆலோசனை" பிரிவுக்குச் செல்லவும்.`,
                    
                'default': `எனக்கு புரியவில்லை. தயவுசெய்து உங்கள் கேள்வியை மறுபடியும் சொல்லுங்கள் அல்லது இந்த தலைப்புகளில் ஒன்றைத் தேர்ந்தெடுங்கள்?`
            }
        };
    }
    
    /**
     * Initialize the chatbot UI and functionality
     */
    init() {
        this._createChatbotUI();
        this._attachEventListeners();
        setTimeout(() => {
            this._addBotMessage(this.translations[this.currentLanguage].welcome);
            this._suggestQuickReplies(this.quickRepliesTranslations[this.currentLanguage]);
        }, 1000);
    }
    
    /**
     * Create the chatbot UI elements
     */
    _createChatbotUI() {
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'krishibot-container';
        
        // Create chat button
        this.button = document.createElement('div');
        this.button.className = 'krishibot-button';
        this.button.innerHTML = '<i data-feather="message-circle"></i>';
        
        // Create chat window
        this.chat = document.createElement('div');
        this.chat.className = 'krishibot-chat';
        
        // Create chat header
        const header = document.createElement('div');
        header.className = 'krishibot-header';
        
        // Create title
        const title = document.createElement('div');
        title.className = 'krishibot-title';
        
        const avatar = document.createElement('div');
        avatar.className = 'krishibot-avatar';
        avatar.innerHTML = '<i data-feather="cpu"></i>';
        
        const headerTitle = document.createElement('h4');
        headerTitle.textContent = this.translations[this.currentLanguage].title;
        
        title.appendChild(avatar);
        title.appendChild(headerTitle);
        
        // Create language selector
        const languageDiv = document.createElement('div');
        languageDiv.className = 'krishibot-language';
        
        this.languageSelect = document.createElement('select');
        
        const languages = [
            { code: 'en', name: 'English' },
            { code: 'hi', name: 'हिंदी' },
            { code: 'ta', name: 'தமிழ்' }
        ];
        
        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = lang.name;
            if (lang.code === this.currentLanguage) {
                option.selected = true;
            }
            this.languageSelect.appendChild(option);
        });
        
        languageDiv.appendChild(this.languageSelect);
        
        // Create close button
        const closeButton = document.createElement('div');
        closeButton.className = 'krishibot-close';
        closeButton.innerHTML = '<i data-feather="x"></i>';
        
        header.appendChild(title);
        header.appendChild(languageDiv);
        header.appendChild(closeButton);
        
        // Create messages container
        this.messages = document.createElement('div');
        this.messages.className = 'krishibot-messages';
        
        // Create input area
        const inputArea = document.createElement('div');
        inputArea.className = 'krishibot-input';
        
        this.voiceButton = document.createElement('div');
        this.voiceButton.className = 'krishibot-voice';
        this.voiceButton.innerHTML = '<i data-feather="mic"></i>';
        
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = this.translations[this.currentLanguage].inputPlaceholder;
        
        this.sendButton = document.createElement('button');
        this.sendButton.innerHTML = '<i data-feather="send"></i>';
        
        inputArea.appendChild(this.voiceButton);
        inputArea.appendChild(this.input);
        inputArea.appendChild(this.sendButton);
        
        // Assemble chat window
        this.chat.appendChild(header);
        this.chat.appendChild(this.messages);
        this.chat.appendChild(inputArea);
        
        // Add to container
        this.container.appendChild(this.button);
        this.container.appendChild(this.chat);
        
        // Add to document
        const targetContainer = document.getElementById('krishibot-container');
        if (targetContainer) {
            targetContainer.appendChild(this.container);
        } else {
            document.body.appendChild(this.container);
        }
        
        // Initialize Feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
    
    /**
     * Attach event listeners to chatbot elements
     */
    _attachEventListeners() {
        // Toggle chat on button click
        this.button.addEventListener('click', () => {
            this._toggleChat();
        });
        
        // Close chat on close button click
        const closeButton = this.chat.querySelector('.krishibot-close');
        closeButton.addEventListener('click', () => {
            this._toggleChat();
        });
        
        // Send message on button click
        this.sendButton.addEventListener('click', () => {
            this._handleUserInput();
        });
        
        // Send message on Enter key
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this._handleUserInput();
            }
        });
        
        // Toggle voice input
        this.voiceButton.addEventListener('click', () => {
            this._toggleVoiceInput();
        });
        
        // Language change
        this.languageSelect.addEventListener('change', () => {
            this.currentLanguage = this.languageSelect.value;
            
            // Update UI with selected language
            const headerTitle = this.chat.querySelector('.krishibot-header h4');
            headerTitle.textContent = this.translations[this.currentLanguage].title;
            
            this.input.placeholder = this.translations[this.currentLanguage].inputPlaceholder;
            
            // Add welcome message in new language
            this._addBotMessage(this.translations[this.currentLanguage].welcome);
            
            // Add quick replies in new language
            this._suggestQuickReplies(this.quickRepliesTranslations[this.currentLanguage]);
        });
    }
    
    /**
     * Handle user message input
     */
    _handleUserInput() {
        const message = this.input.value.trim();
        
        if (message) {
            // Add user message to chat
            this._addUserMessage(message);
            
            // Clear input
            this.input.value = '';
            
            // Process user input and generate response
            this._processUserInput(message);
        }
    }
    
    /**
     * Add user message to chat
     */
    _addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'krishibot-message krishibot-user-message';
        messageElement.textContent = message;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'krishibot-timestamp';
        timestamp.textContent = this._getCurrentTime();
        
        messageElement.appendChild(timestamp);
        this.messages.appendChild(messageElement);
        
        this._scrollToBottom();
    }
    
    /**
     * Add bot message to chat
     */
    _addBotMessage(message) {
        // Show typing indicator
        this._showTypingIndicator();
        
        // Add bot message after a delay to simulate typing
        setTimeout(() => {
            // Remove typing indicator
            this._hideTypingIndicator();
            
            const messageElement = document.createElement('div');
            messageElement.className = 'krishibot-message krishibot-bot-message';
            
            // Support for multiline messages (replace \n with <br>)
            messageElement.innerHTML = message.replace(/\n/g, '<br>');
            
            const timestamp = document.createElement('div');
            timestamp.className = 'krishibot-timestamp';
            timestamp.textContent = this._getCurrentTime();
            
            messageElement.appendChild(timestamp);
            this.messages.appendChild(messageElement);
            
            this._scrollToBottom();
        }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
    }
    
    /**
     * Show bot typing indicator
     */
    _showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'krishibot-typing';
        typingIndicator.id = 'krishibot-typing';
        
        typingIndicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        this.messages.appendChild(typingIndicator);
        this._scrollToBottom();
    }
    
    /**
     * Hide bot typing indicator
     */
    _hideTypingIndicator() {
        const typingIndicator = document.getElementById('krishibot-typing');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    /**
     * Process user input and generate appropriate response
     */
    _processUserInput(message) {
        const lowercaseMessage = message.toLowerCase();
        let responseKey = 'default';
        
        // Simple keyword matching for demo purposes
        // In a real application, this would use NLP or be connected to a backend
        if (lowercaseMessage.includes('sell') || lowercaseMessage.includes('selling') || 
            lowercaseMessage.includes('market') || lowercaseMessage.includes('crop') && lowercaseMessage.includes('sell')) {
            responseKey = 'sell_crops';
        } else if (lowercaseMessage.includes('verify') || lowercaseMessage.includes('account') || 
                   lowercaseMessage.includes('verification') || lowercaseMessage.includes('aadhar')) {
            responseKey = 'verify_account';
        } else if (lowercaseMessage.includes('price') || lowercaseMessage.includes('market') || 
                   lowercaseMessage.includes('rate') || lowercaseMessage.includes('cost')) {
            responseKey = 'market_prices';
        } else if (lowercaseMessage.includes('weather') || lowercaseMessage.includes('rain') || 
                   lowercaseMessage.includes('forecast') || lowercaseMessage.includes('temperature')) {
            responseKey = 'weather';
        } else if (lowercaseMessage.includes('buyer') || lowercaseMessage.includes('connect') || 
                   lowercaseMessage.includes('purchase') || lowercaseMessage.includes('contact')) {
            responseKey = 'connect_buyers';
        } else if (lowercaseMessage.includes('suggestion') || lowercaseMessage.includes('recommend') || 
                   lowercaseMessage.includes('advice') || lowercaseMessage.includes('which crop')) {
            responseKey = 'crop_suggestions';
        }
        
        // Get response based on current language
        const response = this.responses[this.currentLanguage][responseKey];
        
        // Add bot response
        this._addBotMessage(response);
        
        // Add quick replies after response
        setTimeout(() => {
            this._suggestQuickReplies(this.quickRepliesTranslations[this.currentLanguage]);
        }, 2500);
    }
    
    /**
     * Add quick reply suggestions
     */
    _suggestQuickReplies(replies) {
        // Create container for quick replies if it doesn't exist
        let quickRepliesElement = this.messages.querySelector('.krishibot-quick-replies-container');
        
        if (quickRepliesElement) {
            quickRepliesElement.remove();
        }
        
        quickRepliesElement = document.createElement('div');
        quickRepliesElement.className = 'krishibot-message krishibot-bot-message krishibot-quick-replies-container';
        
        const heading = document.createElement('div');
        heading.className = 'quick-replies-heading';
        heading.textContent = this.translations[this.currentLanguage].suggestions;
        
        const quickReplies = document.createElement('div');
        quickReplies.className = 'krishibot-quick-replies';
        
        // Add quick reply buttons
        replies.forEach(reply => {
            const quickReply = document.createElement('div');
            quickReply.className = 'krishibot-quick-reply';
            quickReply.textContent = reply;
            
            quickReply.addEventListener('click', () => {
                this.input.value = reply;
                this._handleUserInput();
            });
            
            quickReplies.appendChild(quickReply);
        });
        
        quickRepliesElement.appendChild(heading);
        quickRepliesElement.appendChild(quickReplies);
        this.messages.appendChild(quickRepliesElement);
        
        this._scrollToBottom();
    }
    
    /**
     * Open the chat
     */
    _openChat() {
        this.chat.style.display = 'flex';
        this.isOpen = true;
        setTimeout(() => {
            this.input.focus();
        }, 300);
    }
    
    /**
     * Toggle chat open/closed
     */
    _toggleChat() {
        if (this.isOpen) {
            this.chat.style.display = 'none';
            this.isOpen = false;
        } else {
            this._openChat();
        }
    }
    
    /**
     * Toggle voice input
     */
    _toggleVoiceInput() {
        if (!this.isListening) {
            // Start listening
            this._startVoiceRecognition();
        } else {
            // Stop listening
            this._stopVoiceRecognition();
        }
    }
    
    /**
     * Start voice recognition
     */
    _startVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            // Set language based on current selected language
            switch (this.currentLanguage) {
                case 'hi':
                    this.recognition.lang = 'hi-IN';
                    break;
                case 'ta':
                    this.recognition.lang = 'ta-IN';
                    break;
                default:
                    this.recognition.lang = 'en-IN';
            }
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.voiceButton.classList.add('active');
                this.input.placeholder = '🎤 Listening...';
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.input.value = transcript;
                
                // Process after a short delay
                setTimeout(() => {
                    this._handleUserInput();
                }, 500);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                this._stopVoiceRecognition();
            };
            
            this.recognition.onend = () => {
                this._stopVoiceRecognition();
            };
            
            this.recognition.start();
        } else {
            alert('Speech recognition is not supported in your browser.');
        }
    }
    
    /**
     * Stop voice recognition
     */
    _stopVoiceRecognition() {
        if (this.recognition) {
            this.recognition.stop();
        }
        
        this.isListening = false;
        this.voiceButton.classList.remove('active');
        this.input.placeholder = this.translations[this.currentLanguage].inputPlaceholder;
    }
    
    /**
     * Get current time formatted as HH:MM
     */
    _getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    /**
     * Scroll chat to bottom
     */
    _scrollToBottom() {
        this.messages.scrollTop = this.messages.scrollHeight;
    }
}

// Initialize the chatbot when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if the container exists
    if (document.getElementById('krishibot-container')) {
        const chatbot = new KrishiConnectChatbot();
        chatbot.init();
    }
});