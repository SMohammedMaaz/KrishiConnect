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
    
    // Initialize counter animations
    initCounters();
    
    // Initialize weather and market updates
    initRealTimeUpdates();
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

/**
 * Initialize the counter animations on stats section
 */
function initCounters() {
    const counters = document.querySelectorAll('.counter-value');
    if (counters.length > 0) {
        // Define the final counter values
        const counterValues = {
            'farmerCount': 15842,
            'buyerCount': 3267,
            'productCount': 24936
        };
        
        // Create an intersection observer to trigger counter animation when in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const id = counter.id;
                    const targetValue = counterValues[id] || parseInt(counter.innerText) || 0;
                    
                    // Only animate if not already animated
                    if (counter.innerText === '0') {
                        animateCounter(counter, 0, targetValue, 2000);
                    }
                    
                    // Unobserve after animation starts
                    observer.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        // Observe each counter element
        counters.forEach(counter => {
            // Skip elements with non-numeric final values
            if (counter.innerText.indexOf('+') === -1) {
                observer.observe(counter);
            }
        });
    }
}

/**
 * Animate a counter from start to end value
 * @param {HTMLElement} element - The counter element
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} duration - Animation duration in milliseconds
 */
function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = Math.floor(progress * (end - start) + start);
        element.innerText = currentValue.toLocaleString('en-IN');
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

/**
 * Initialize real-time weather and market updates
 */
function initRealTimeUpdates() {
    // Weather dropdown handler
    const weatherDropdown = document.querySelector('.weather-forecast .dropdown-menu');
    if (weatherDropdown) {
        weatherDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const selectedLocation = this.textContent;
                this.closest('.dropdown').querySelector('.dropdown-toggle').textContent = selectedLocation;
                
                // In a real implementation, this would fetch weather data for the selected location
                // For demo, just show a loading state and then update with simulated data
                simulateWeatherUpdate(selectedLocation);
            });
        });
    }
    
    // Market timeframe dropdown handler
    const marketDropdown = document.querySelector('.market-trends .dropdown-menu');
    if (marketDropdown) {
        marketDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const selectedTimeframe = this.textContent;
                this.closest('.dropdown').querySelector('.dropdown-toggle').textContent = selectedTimeframe;
                
                // In a real implementation, this would fetch market data for the selected timeframe
                // For demo, show loading state
                const chartContainer = document.querySelector('.market-trends .chart-container');
                if (chartContainer) {
                    chartContainer.classList.add('loading');
                    setTimeout(() => {
                        chartContainer.classList.remove('loading');
                        // Chart would be updated with new data in a real implementation
                    }, 1500);
                }
            });
        });
    }
}

/**
 * Simulate weather data update for demo purposes
 * @param {string} location - Selected location name
 */
function simulateWeatherUpdate(location) {
    const weatherContainer = document.querySelector('.current-weather');
    const forecastContainer = document.querySelector('.forecast');
    
    if (weatherContainer && forecastContainer) {
        // Add loading state
        weatherContainer.classList.add('loading');
        forecastContainer.classList.add('loading');
        
        // Simulate API delay
        setTimeout(() => {
            // Remove loading state
            weatherContainer.classList.remove('loading');
            forecastContainer.classList.remove('loading');
            
            // Update weather advisory based on location (for demo)
            const advisoryElement = document.querySelector('.farming-advice p');
            if (advisoryElement) {
                if (location.includes('Delhi')) {
                    advisoryElement.textContent = 'Hot and dry conditions expected. Consider evening irrigation for crops. Protect seedlings from heat stress.';
                } else if (location.includes('Mumbai')) {
                    advisoryElement.textContent = 'Monsoon patterns predicted with high humidity. Watch for fungal diseases in crops. Good time for rice cultivation.';
                } else if (location.includes('Chennai')) {
                    advisoryElement.textContent = 'Moderate temperatures with occasional showers. Ideal conditions for vegetable farming. Monitor soil moisture levels.';
                }
                // Default Bangalore advisory is already set in the HTML
            }
            
            // In a real app, we would update the weather icon, temperature, and forecast
        }, 1000);
    }
}