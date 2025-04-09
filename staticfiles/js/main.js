/**
 * KrishiConnect - Main JavaScript
 * Contains shared functionality across the platform
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the back to top button
    initBackToTop();
    
    // Initialize navbar scroll effect
    initNavbarScroll();
    
    // Initialize form enhancements
    enhanceForms();
    
    // Initialize animation on scroll
    initScrollAnimations();
});

/**
 * Initialize back to top button functionality
 */
function initBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        // Show/hide back to top button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });
        
        // Smooth scroll to top when button is clicked
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
    }
}

/**
 * Initialize navbar scroll effect
 */
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        });
    }
}

/**
 * Enhance form interactions
 */
function enhanceForms() {
    // Add validation styles to forms with 'needs-validation' class
    const forms = document.querySelectorAll('.needs-validation');
    if (forms.length > 0) {
        Array.from(forms).forEach(form => {
            form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }
    
    // Add floating label behavior
    const formControls = document.querySelectorAll('.form-control');
    if (formControls.length > 0) {
        Array.from(formControls).forEach(input => {
            // Check if input has value on load
            if (input.value.length > 0) {
                input.classList.add('has-value');
            }
            
            // Check for input changes
            input.addEventListener('input', () => {
                if (input.value.length > 0) {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            });
        });
    }
}

/**
 * Initialize animations on scroll
 */
function initScrollAnimations() {
    // Check if AOS is available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }
}

/**
 * Format currency as Indian Rupees
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format date in Indian format
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short', 
        year: 'numeric'
    }).format(date);
}

/**
 * Create a toast notification
 * @param {string} message - Message to show
 * @param {string} type - Type of toast (success, error, warning, info)
 */
function showToast(message, type = 'info') {
    // Check if Bootstrap toast functionality is available
    if (typeof bootstrap !== 'undefined') {
        const toastContainer = document.getElementById('toast-container');
        
        // Create container if it doesn't exist
        if (!toastContainer) {
            const newContainer = document.createElement('div');
            newContainer.id = 'toast-container';
            newContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(newContainer);
        }
        
        // Create toast element
        const toastEl = document.createElement('div');
        toastEl.className = `toast align-items-center border-0 text-white bg-${type}`;
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        
        // Create toast content
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        // Add to container
        document.getElementById('toast-container').appendChild(toastEl);
        
        // Initialize and show toast
        const toast = new bootstrap.Toast(toastEl, {
            autohide: true,
            delay: 5000
        });
        toast.show();
        
        // Remove from DOM after hiding
        toastEl.addEventListener('hidden.bs.toast', function() {
            toastEl.remove();
        });
    } else {
        // Fallback if Bootstrap is not available
        alert(message);
    }
}

/**
 * Add CSS styles for back to top button if not already defined
 */
(function() {
    // Only add if the element exists and styles are not in main.css
    if (document.getElementById('back-to-top')) {
        const style = document.createElement('style');
        style.textContent = `
            .back-to-top {
                position: fixed;
                bottom: -60px;
                right: 30px;
                width: 45px;
                height: 45px;
                background: var(--primary-color, #2E7D32);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                z-index: 99;
                opacity: 0;
                transition: all 0.5s ease;
            }
            
            .back-to-top.show {
                bottom: 30px;
                opacity: 1;
            }
            
            .back-to-top:hover {
                background: var(--primary-dark, #1B5E20);
                transform: translateY(-5px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            }
            
            @media (max-width: 768px) {
                .back-to-top {
                    right: 20px;
                    width: 40px;
                    height: 40px;
                }
                
                .back-to-top.show {
                    bottom: 20px;
                }
            }
        `;
        document.head.append(style);
    }
})();