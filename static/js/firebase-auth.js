/**
 * KrishiConnect Firebase Authentication
 * Provides common Firebase Auth functionality
 */

// Initialize Firebase if not already initialized
function initializeFirebaseAuth() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded');
        return false;
    }
    
    // Check if Firebase is already initialized
    if (firebase.apps.length === 0) {
        // Get Firebase config from backend
        fetch('/api/firebase-config/')
            .then(response => response.json())
            .then(config => {
                firebase.initializeApp(config);
            })
            .catch(error => {
                console.error('Error initializing Firebase:', error);
            });
    }
    
    return true;
}

/**
 * Check if a user is authenticated
 * @returns {Promise} Promise resolving to user object or null
 */
function checkAuthState() {
    return new Promise((resolve) => {
        if (!initializeFirebaseAuth()) {
            resolve(null);
            return;
        }
        
        firebase.auth().onAuthStateChanged(user => {
            resolve(user);
        });
    });
}

/**
 * Get Firebase ID token for authenticated user
 * @param {boolean} forceRefresh - Whether to force refresh the token
 * @returns {Promise} Promise resolving to ID token or null
 */
async function getAuthToken(forceRefresh = false) {
    const user = await checkAuthState();
    
    if (!user) {
        return null;
    }
    
    try {
        return await user.getIdToken(forceRefresh);
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
}

/**
 * Send OTP to phone number
 * @param {string} phoneNumber - Phone number with country code
 * @param {Object} recaptchaVerifier - reCAPTCHA verifier object
 * @returns {Promise} Promise resolving to confirmation result
 */
function sendOTP(phoneNumber, recaptchaVerifier) {
    if (!initializeFirebaseAuth()) {
        return Promise.reject(new Error('Firebase not initialized'));
    }
    
    return firebase.auth().signInWithPhoneNumber(phoneNumber, recaptchaVerifier);
}

/**
 * Verify OTP code
 * @param {string} verificationId - Verification ID from sendOTP
 * @param {string} code - OTP code entered by user
 * @returns {Promise} Promise resolving to user credential
 */
function verifyOTP(verificationId, code) {
    if (!initializeFirebaseAuth()) {
        return Promise.reject(new Error('Firebase not initialized'));
    }
    
    const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code);
    return firebase.auth().signInWithCredential(credential);
}

/**
 * Sign in with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise} Promise resolving to user credential
 */
function signInWithEmail(email, password) {
    if (!initializeFirebaseAuth()) {
        return Promise.reject(new Error('Firebase not initialized'));
    }
    
    return firebase.auth().signInWithEmailAndPassword(email, password);
}

/**
 * Sign up with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise} Promise resolving to user credential
 */
function signUpWithEmail(email, password) {
    if (!initializeFirebaseAuth()) {
        return Promise.reject(new Error('Firebase not initialized'));
    }
    
    return firebase.auth().createUserWithEmailAndPassword(email, password);
}

/**
 * Sign in with Google
 * @returns {Promise} Promise resolving to user credential
 */
function signInWithGoogle() {
    if (!initializeFirebaseAuth()) {
        return Promise.reject(new Error('Firebase not initialized'));
    }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(provider);
}

/**
 * Sign out the current user
 * @returns {Promise} Promise resolving when sign out is complete
 */
function signOut() {
    if (!initializeFirebaseAuth()) {
        return Promise.reject(new Error('Firebase not initialized'));
    }
    
    return firebase.auth().signOut();
}

/**
 * Reset password for email
 * @param {string} email - User's email
 * @returns {Promise} Promise resolving when password reset email is sent
 */
function resetPassword(email) {
    if (!initializeFirebaseAuth()) {
        return Promise.reject(new Error('Firebase not initialized'));
    }
    
    return firebase.auth().sendPasswordResetEmail(email);
}

/**
 * Update user profile
 * @param {Object} profileUpdates - Profile updates
 * @param {string} profileUpdates.displayName - New display name
 * @param {string} profileUpdates.photoURL - New photo URL
 * @returns {Promise} Promise resolving when update is complete
 */
function updateProfile(profileUpdates) {
    return checkAuthState()
        .then(user => {
            if (!user) {
                throw new Error('User not authenticated');
            }
            
            return user.updateProfile(profileUpdates);
        });
}

/**
 * Update email address
 * @param {string} newEmail - New email address
 * @returns {Promise} Promise resolving when update is complete
 */
function updateEmail(newEmail) {
    return checkAuthState()
        .then(user => {
            if (!user) {
                throw new Error('User not authenticated');
            }
            
            return user.updateEmail(newEmail);
        });
}

/**
 * Update password
 * @param {string} newPassword - New password
 * @returns {Promise} Promise resolving when update is complete
 */
function updatePassword(newPassword) {
    return checkAuthState()
        .then(user => {
            if (!user) {
                throw new Error('User not authenticated');
            }
            
            return user.updatePassword(newPassword);
        });
}

/**
 * Verify user's email
 * @returns {Promise} Promise resolving when verification email is sent
 */
function sendEmailVerification() {
    return checkAuthState()
        .then(user => {
            if (!user) {
                throw new Error('User not authenticated');
            }
            
            return user.sendEmailVerification();
        });
}

/**
 * Re-authenticate user
 * @param {Object} credential - Auth credential
 * @returns {Promise} Promise resolving when re-authentication is complete
 */
function reauthenticate(credential) {
    return checkAuthState()
        .then(user => {
            if (!user) {
                throw new Error('User not authenticated');
            }
            
            return user.reauthenticateWithCredential(credential);
        });
}

/**
 * Delete current user account
 * @returns {Promise} Promise resolving when account is deleted
 */
function deleteAccount() {
    return checkAuthState()
        .then(user => {
            if (!user) {
                throw new Error('User not authenticated');
            }
            
            return user.delete();
        });
}

/**
 * Check if email is already in use
 * @param {string} email - Email to check
 * @returns {Promise} Promise resolving to boolean
 */
function isEmailInUse(email) {
    return new Promise((resolve) => {
        if (!initializeFirebaseAuth()) {
            resolve(false);
            return;
        }
        
        // Try to sign in with a fake password, if it fails with 'auth/user-not-found'
        // then the email is not in use
        firebase.auth().signInWithEmailAndPassword(email, 'temporary-password')
            .then(() => {
                // This should not happen (wrong password)
                resolve(true);
            })
            .catch(error => {
                if (error.code === 'auth/user-not-found') {
                    resolve(false); // Email not in use
                } else if (error.code === 'auth/wrong-password') {
                    resolve(true); // Email in use
                } else {
                    console.error('Error checking email:', error);
                    resolve(false);
                }
            });
    });
}

/**
 * Create a reCAPTCHA verifier
 * @param {string} containerId - ID of container element
 * @param {Object} options - reCAPTCHA options
 * @returns {Object} reCAPTCHA verifier
 */
function createRecaptchaVerifier(containerId, options = {}) {
    if (!initializeFirebaseAuth()) {
        throw new Error('Firebase not initialized');
    }
    
    const defaultOptions = {
        size: 'invisible',
        callback: () => {}
    };
    
    const recaptchaOptions = Object.assign({}, defaultOptions, options);
    
    return new firebase.auth.RecaptchaVerifier(containerId, recaptchaOptions);
}

/**
 * Get user role from custom claims
 * @returns {Promise} Promise resolving to user role
 */
async function getUserRole() {
    const user = await checkAuthState();
    
    if (!user) {
        return null;
    }
    
    try {
        const idTokenResult = await user.getIdTokenResult();
        return idTokenResult.claims.role;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
}

/**
 * Check if user has specific role
 * @param {string} role - Role to check
 * @returns {Promise} Promise resolving to boolean
 */
async function hasRole(role) {
    const userRole = await getUserRole();
    return userRole === role;
}

/**
 * Redirect if user is not authenticated
 * @param {string} redirectUrl - URL to redirect to if not authenticated
 * @returns {Promise} Promise resolving when check is complete
 */
async function requireAuth(redirectUrl = '/login') {
    const user = await checkAuthState();
    
    if (!user) {
        window.location.href = redirectUrl;
    }
    
    return user;
}

/**
 * Redirect if user does not have specific role
 * @param {string} role - Required role
 * @param {string} redirectUrl - URL to redirect to if role doesn't match
 * @returns {Promise} Promise resolving when check is complete
 */
async function requireRole(role, redirectUrl = '/login') {
    const user = await requireAuth(redirectUrl);
    
    if (!user) {
        return null;
    }
    
    const hasRequiredRole = await hasRole(role);
    
    if (!hasRequiredRole) {
        window.location.href = redirectUrl;
        return null;
    }
    
    return user;
}
