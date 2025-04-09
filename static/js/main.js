/**
 * KrishiConnect Main JavaScript
 * Contains common utility functions used across the application
 */

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Add active class to current navigation item
    setActiveNavItem();
    
    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined' && typeof bootstrap.Tooltip !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Handle mobile navigation toggle
    setupMobileNav();
    
    // Setup logout functionality
    setupLogout();
});

/**
 * Sets the active class on the current navigation item based on URL
 */
function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath === href) {
            link.classList.add('active');
        } else if (href && currentPath.startsWith(href) && href !== '/') {
            link.classList.add('active');
        }
    });
}

/**
 * Setup mobile navigation
 */
function setupMobileNav() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            // Re-initialize Feather icons when mobile nav is toggled
            setTimeout(() => {
                if (typeof feather !== 'undefined') {
                    feather.replace();
                }
            }, 100);
        });
    }
}

/**
 * Setup logout functionality for auth-required pages
 */
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn && typeof firebase !== 'undefined') {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                firebase.auth().signOut()
                    .then(() => {
                        // Redirect to home page
                        window.location.href = '/';
                    })
                    .catch(error => {
                        console.error('Error signing out:', error);
                        alert('Failed to log out. Please try again.');
                    });
            }
        });
    }
}

/**
 * Format date string for display
 * @param {Date|string|number} date - Date object, ISO string, or timestamp
 * @param {boolean} includeTime - Whether to include time in the formatted string
 * @returns {string} Formatted date string
 */
function formatDate(date, includeTime = false) {
    if (!date) return 'N/A';
    
    let dateObj;
    
    if (date instanceof Date) {
        dateObj = date;
    } else if (typeof date === 'object' && date._seconds) {
        // Firestore timestamp
        dateObj = new Date(date._seconds * 1000);
    } else if (typeof date === 'string') {
        dateObj = new Date(date);
    } else if (typeof date === 'number') {
        dateObj = new Date(date);
    } else {
        return 'Invalid Date';
    }
    
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return dateObj.toLocaleDateString('en-IN', options);
}

/**
 * Format currency for display (Indian Rupees)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    if (typeof amount !== 'number') return 'N/A';
    
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Truncate text to a specific length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Get URL parameters as an object
 * @returns {Object} URL parameters as key-value pairs
 */
function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    
    for (let i = 0; i < pairs.length; i++) {
        if (!pairs[i]) continue;
        
        const pair = pairs[i].split('=');
        const key = decodeURIComponent(pair[0]);
        const value = pair.length > 1 ? decodeURIComponent(pair[1]) : null;
        
        params[key] = value;
    }
    
    return params;
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'success', duration = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.top = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.classList.add('toast', 'show');
    toast.style.minWidth = '250px';
    
    // Set background color based on type
    let bgColor, textColor, icon;
    switch (type) {
        case 'success':
            bgColor = '#d4edda';
            textColor = '#155724';
            icon = 'check-circle';
            break;
        case 'error':
            bgColor = '#f8d7da';
            textColor = '#721c24';
            icon = 'alert-circle';
            break;
        case 'warning':
            bgColor = '#fff3cd';
            textColor = '#856404';
            icon = 'alert-triangle';
            break;
        case 'info':
        default:
            bgColor = '#d1ecf1';
            textColor = '#0c5460';
            icon = 'info';
            break;
    }
    
    toast.style.backgroundColor = bgColor;
    toast.style.color = textColor;
    toast.style.margin = '10px';
    toast.style.padding = '15px';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    
    // Add icon if Feather is available
    if (typeof feather !== 'undefined') {
        const iconSvg = feather.icons[icon].toSvg({ width: 24, height: 24 });
        toast.innerHTML = `<div style="margin-right: 10px;">${iconSvg}</div><div>${message}</div>`;
    } else {
        toast.textContent = message;
    }
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.style.marginLeft = 'auto';
    closeBtn.style.backgroundColor = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = textColor;
    closeBtn.style.fontSize = '1.5rem';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
        toastContainer.removeChild(toast);
    });
    toast.appendChild(closeBtn);
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Remove after duration
    setTimeout(() => {
        if (toastContainer.contains(toast)) {
            toastContainer.removeChild(toast);
        }
    }, duration);
}

/**
 * Validates phone number format (10 digits for Indian numbers)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidPhoneNumber(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

/**
 * Validates Indian Aadhar number (12 digits)
 * @param {string} aadhar - Aadhar number to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidAadhar(aadhar) {
    const aadharRegex = /^[0-9]{12}$/;
    return aadharRegex.test(aadhar);
}

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
        
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees to convert
 * @returns {number} Radians
 */
function toRad(degrees) {
    return degrees * Math.PI / 180;
}
