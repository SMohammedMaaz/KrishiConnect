/**
 * AgroLink - Main JavaScript
 * 
 * This file contains the core JavaScript functionality for the AgroLink platform.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
    }

    // Initialize tooltips
    initializeTooltips();

    // Initialize animated counters
    initializeCounters();

    // Initialize weather widget if it exists
    if (document.getElementById('get-weather-btn')) {
        initializeWeatherWidget();
    }

    // Initialize market price data if the element exists
    if (document.getElementById('market-prices-container')) {
        initializeMarketPrices();
    }
});

/**
 * Initialize Bootstrap tooltips
 */
function initializeTooltips() {
    // Select all elements with data-bs-toggle="tooltip" attribute
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    
    if (tooltipTriggerList.length > 0 && typeof bootstrap !== 'undefined') {
        // Create tooltips
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }
}

/**
 * Initialize animated counter elements
 */
function initializeCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // The lower the slower (milliseconds)
    
    counters.forEach(counter => {
        const animate = () => {
            const value = +counter.getAttribute('data-target');
            const data = +counter.innerText;
            
            const time = value / speed;
            if (data < value) {
                counter.innerText = Math.ceil(data + time);
                setTimeout(animate, 1);
            } else {
                counter.innerText = value;
            }
        }
        
        // Use Intersection Observer to start animation when element is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animate();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

/**
 * Initialize weather widget functionality
 */
function initializeWeatherWidget() {
    const weatherCity = document.getElementById('weather-city');
    const weatherDate = document.getElementById('weather-date');
    const weatherTemp = document.getElementById('weather-temp');
    const weatherFeelsLike = document.getElementById('weather-feels-like');
    const weatherHumidity = document.getElementById('weather-humidity');
    const weatherWind = document.getElementById('weather-wind');
    const weatherIcon = document.getElementById('weather-icon');
    const weatherAdvisory = document.getElementById('weather-advisory');
    const getWeatherBtn = document.getElementById('get-weather-btn');
    
    // Set current date
    const today = new Date();
    const options = { month: 'long', day: 'numeric' };
    weatherDate.textContent = today.toLocaleDateString('en-US', options);
    
    // Sample weather data (would be replaced with actual API data)
    const demoWeatherData = [
        {
            city: 'Delhi',
            temp: 32,
            feels_like: 34,
            humidity: 45,
            wind: 12,
            icon: '01d',
            advisory: 'Good conditions for wheat harvest. Complete harvesting within 2-3 days to avoid potential rain.'
        },
        {
            city: 'Mumbai',
            temp: 29,
            feels_like: 32,
            humidity: 78,
            wind: 14,
            icon: '02d',
            advisory: 'High humidity levels may affect crop storage. Ensure proper ventilation for stored grains.'
        },
        {
            city: 'Bangalore',
            temp: 26,
            feels_like: 27,
            humidity: 60,
            wind: 8,
            icon: '03d',
            advisory: 'Moderate temperatures are ideal for vegetable cultivation. Consider planting tomatoes and peppers.'
        },
        {
            city: 'Chennai',
            temp: 33,
            feels_like: 36,
            humidity: 70,
            wind: 10,
            icon: '01d',
            advisory: 'Hot conditions expected. Increase irrigation frequency for paddy fields to prevent drying.'
        },
        {
            city: 'Kolkata',
            temp: 31,
            feels_like: 33,
            humidity: 65,
            wind: 9,
            icon: '04d',
            advisory: 'Partly cloudy conditions with possible light showers. Good for rice transplantation.'
        }
    ];
    
    // Function to update weather
    function updateWeather(data) {
        weatherCity.textContent = data.city;
        weatherTemp.textContent = data.temp;
        weatherFeelsLike.textContent = data.feels_like;
        weatherHumidity.textContent = data.humidity;
        weatherWind.textContent = data.wind;
        weatherIcon.src = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
        weatherAdvisory.innerHTML = `<i data-feather="info" class="feather-small me-2"></i> ${data.advisory}`;
        feather.replace();
    }
    
    // Get weather button click
    if (getWeatherBtn) {
        getWeatherBtn.addEventListener('click', function() {
            // In a real app, this would use geolocation and a weather API
            const randomIndex = Math.floor(Math.random() * demoWeatherData.length);
            updateWeather(demoWeatherData[randomIndex]);
        });
    }
}

/**
 * Initialize market prices data and visualization
 */
function initializeMarketPrices() {
    const container = document.getElementById('market-prices-container');
    
    if (!container) return;
    
    // Sample market price data (would be replaced with actual API data)
    const marketPriceData = [
        { crop: 'Rice', price: 2240, change: 2.5, trend: 'up' },
        { crop: 'Wheat', price: 2100, change: -1.2, trend: 'down' },
        { crop: 'Maize', price: 1850, change: 0.8, trend: 'up' },
        { crop: 'Soybeans', price: 3600, change: 3.2, trend: 'up' },
        { crop: 'Cotton', price: 6500, change: -0.5, trend: 'down' },
        { crop: 'Sugarcane', price: 350, change: 1.5, trend: 'up' },
        { crop: 'Potatoes', price: 1200, change: 4.2, trend: 'up' },
        { crop: 'Onions', price: 1800, change: -2.3, trend: 'down' }
    ];
    
    // Create and populate market price items
    marketPriceData.forEach(item => {
        const priceItem = document.createElement('div');
        priceItem.className = 'price-item';
        
        const trendIcon = item.trend === 'up' 
            ? '<i data-feather="trending-up" class="text-success feather-small"></i>'
            : '<i data-feather="trending-down" class="text-danger feather-small"></i>';
            
        const changeClass = item.trend === 'up' ? 'price-change-up' : 'price-change-down';
        const changePrefix = item.trend === 'up' ? '+' : '';
        
        priceItem.innerHTML = `
            <div class="crop-name">${item.crop}</div>
            <div class="price-info">
                <span class="crop-price">₹${item.price}/q</span>
                <span class="${changeClass}">${trendIcon} ${changePrefix}${item.change}%</span>
            </div>
        `;
        
        container.appendChild(priceItem);
    });
    
    // Re-initialize Feather icons
    feather.replace();
}

/**
 * Function for checking if an element is in viewport
 * @param {HTMLElement} el - The element to check
 * @returns {boolean} - True if element is in viewport
 */
function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Format currency in Indian Rupee format
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted amount
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Handle form validation with custom styling
 * @param {HTMLFormElement} form - The form to validate
 * @returns {boolean} - True if form is valid
 */
function validateForm(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
        
        // Add event listener to remove invalid class on input
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('is-invalid');
            }
        });
    });
    
    return isValid;
}

/**
 * Format date in Indian format
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date
 */
function formatDate(date) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

/**
 * Calculate distance between two coordinates (in km)
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return Math.round(distance * 10) / 10;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

/**
 * Get current location using browser's geolocation API
 * @returns {Promise} - Promise that resolves with coordinates
 */
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                error => {
                    reject(new Error(`Geolocation error: ${error.message}`));
                }
            );
        } else {
            reject(new Error('Geolocation is not supported by this browser'));
        }
    });
}