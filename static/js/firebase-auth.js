/**
 * AgroLink - Firebase Authentication Helper
 * Contains shared authentication functionality using Firebase
 */

// Initialize Firebase when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    initFirebase();
    
    // Check authentication state
    monitorAuthState();
});

/**
 * Initialize Firebase with configuration from template context
 */
function initFirebase() {
    // Check if Firebase is already initialized
    if (firebase.apps.length === 0) {
        // Firebase config should be injected into the page by the server
        // This is done in templates with context variables from krishiconnect/context_processors.py
        const firebaseConfig = {
            apiKey: window.firebaseConfig?.apiKey,
            authDomain: window.firebaseConfig?.authDomain,
            projectId: window.firebaseConfig?.projectId,
            storageBucket: window.firebaseConfig?.storageBucket,
            messagingSenderId: window.firebaseConfig?.messagingSenderId,
            appId: window.firebaseConfig?.appId
        };

        // Initialize Firebase if config is available
        if (firebaseConfig.apiKey) {
            firebase.initializeApp(firebaseConfig);
            console.log("Firebase initialized successfully");
        } else {
            console.warn("Firebase configuration not found. Authentication features will not work.");
        }
    }
}

/**
 * Monitor Firebase authentication state
 */
function monitorAuthState() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            console.log('User is signed in:', user.uid);
            updateUIForAuthenticatedUser(user);
        } else {
            console.log('No user is signed in');
            updateUIForUnauthenticatedUser();
        }
    });
}

/**
 * Update UI elements for authenticated users
 * @param {Object} user - Firebase user object
 */
function updateUIForAuthenticatedUser(user) {
    // Update any auth-dependent UI elements
    const authDependentElements = document.querySelectorAll('[data-auth-required]');
    if (authDependentElements.length > 0) {
        authDependentElements.forEach(el => {
            el.classList.remove('d-none');
        });
    }
    
    // Update any non-auth elements
    const nonAuthElements = document.querySelectorAll('[data-auth-not-required]');
    if (nonAuthElements.length > 0) {
        nonAuthElements.forEach(el => {
            el.classList.add('d-none');
        });
    }
    
    // Update any elements that should display user info
    const userDisplayElements = document.querySelectorAll('[data-user-display]');
    if (userDisplayElements.length > 0) {
        userDisplayElements.forEach(el => {
            // Check which attribute to display
            const displayAttr = el.getAttribute('data-user-display');
            if (displayAttr === 'email' && user.email) {
                el.textContent = user.email;
            } else if (displayAttr === 'name' && user.displayName) {
                el.textContent = user.displayName;
            } else if (displayAttr === 'photo' && user.photoURL) {
                // For image elements
                if (el.tagName === 'IMG') {
                    el.src = user.photoURL;
                }
            }
        });
    }
}

/**
 * Update UI elements for unauthenticated users
 */
function updateUIForUnauthenticatedUser() {
    // Hide auth-dependent elements
    const authDependentElements = document.querySelectorAll('[data-auth-required]');
    if (authDependentElements.length > 0) {
        authDependentElements.forEach(el => {
            el.classList.add('d-none');
        });
    }
    
    // Show non-auth elements
    const nonAuthElements = document.querySelectorAll('[data-auth-not-required]');
    if (nonAuthElements.length > 0) {
        nonAuthElements.forEach(el => {
            el.classList.remove('d-none');
        });
    }
}

/**
 * Sign in with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise} Promise that resolves with user credential
 */
function signInWithEmailPassword(email, password) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
}

/**
 * Sign up with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise} Promise that resolves with user credential
 */
function signUpWithEmailPassword(email, password) {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
}

/**
 * Sign in with Google
 * @returns {Promise} Promise that resolves with user credential
 */
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(provider);
}

/**
 * Sign in with phone number
 * @param {string} phoneNumber - User's phone number with country code (e.g., +919876543210)
 * @param {Object} recaptchaVerifier - Firebase RecaptchaVerifier instance
 * @returns {Promise} Promise that resolves with confirmation result
 */
function signInWithPhone(phoneNumber, recaptchaVerifier) {
    return firebase.auth().signInWithPhoneNumber(phoneNumber, recaptchaVerifier);
}

/**
 * Verify phone code from signInWithPhone
 * @param {string} verificationId - Verification ID from signInWithPhone
 * @param {string} code - Verification code sent to user's phone
 * @returns {Promise} Promise that resolves with user credential
 */
function verifyPhoneCode(verificationId, code) {
    const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code);
    return firebase.auth().signInWithCredential(credential);
}

/**
 * Send password reset email
 * @param {string} email - User's email
 * @returns {Promise} Promise that resolves when email is sent
 */
function sendPasswordResetEmail(email) {
    return firebase.auth().sendPasswordResetEmail(email);
}

/**
 * Sign out the current user
 * @returns {Promise} Promise that resolves when sign out is complete
 */
function signOut() {
    return firebase.auth().signOut();
}

/**
 * Get the current user's ID token
 * @param {boolean} forceRefresh - Whether to force refresh the token
 * @returns {Promise} Promise that resolves with ID token
 */
function getUserIdToken(forceRefresh = false) {
    const user = firebase.auth().currentUser;
    if (user) {
        return user.getIdToken(forceRefresh);
    } else {
        return Promise.reject(new Error('No user is signed in'));
    }
}

/**
 * Check if user has specific custom claims/roles
 * @param {string} role - Role to check for (e.g., 'farmer', 'buyer', 'admin')
 * @returns {Promise} Promise that resolves with boolean
 */
async function userHasRole(role) {
    const user = firebase.auth().currentUser;
    if (!user) {
        return false;
    }
    
    try {
        const idTokenResult = await user.getIdTokenResult();
        return idTokenResult.claims.role === role;
    } catch (error) {
        console.error('Error checking user role:', error);
        return false;
    }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initFirebase,
        monitorAuthState,
        signInWithEmailPassword,
        signUpWithEmailPassword,
        signInWithGoogle,
        signInWithPhone,
        verifyPhoneCode,
        sendPasswordResetEmail,
        signOut,
        getUserIdToken,
        userHasRole
    };
}