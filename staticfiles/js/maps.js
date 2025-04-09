/**
 * KrishiConnect Maps Utility
 * Provides functions for Google Maps integration
 */

/**
 * Initialize a Google Map in the specified container
 * @param {string} containerId - ID of the container element
 * @param {Object} options - Map initialization options
 * @param {Object} options.center - Center coordinates {lat, lng}
 * @param {number} options.zoom - Zoom level
 * @param {Function} options.onLoad - Callback function when map is loaded
 * @returns {Object} The created Google Map instance
 */
function initializeMap(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Map container not found: ${containerId}`);
        return null;
    }
    
    const defaultOptions = {
        center: { lat: 20.5937, lng: 78.9629 }, // Default center (India)
        zoom: 5,
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
            }
        ]
    };
    
    const mapOptions = Object.assign({}, defaultOptions, options);
    
    // Create the map
    const map = new google.maps.Map(container, mapOptions);
    
    // Call onLoad callback if provided
    if (typeof options.onLoad === 'function') {
        options.onLoad(map);
    }
    
    return map;
}

/**
 * Add a marker to a Google Map
 * @param {Object} map - Google Map instance
 * @param {Object} options - Marker options
 * @param {Object} options.position - Position {lat, lng}
 * @param {string} options.title - Marker title
 * @param {string} options.icon - Custom icon URL
 * @param {Function} options.onClick - Click event handler
 * @returns {Object} The created marker
 */
function addMapMarker(map, options = {}) {
    if (!map) {
        console.error('Map is required to add a marker');
        return null;
    }
    
    if (!options.position) {
        console.error('Position is required for a marker');
        return null;
    }
    
    const markerOptions = {
        position: options.position,
        map: map,
        title: options.title || '',
    };
    
    if (options.icon) {
        markerOptions.icon = options.icon;
    }
    
    const marker = new google.maps.Marker(markerOptions);
    
    if (typeof options.onClick === 'function') {
        marker.addListener('click', () => {
            options.onClick(marker);
        });
    }
    
    return marker;
}

/**
 * Add an info window to a marker
 * @param {Object} map - Google Map instance
 * @param {Object} marker - Google Maps Marker
 * @param {string|HTMLElement} content - Info window content
 * @param {boolean} openOnClick - Whether to open info window on marker click
 * @returns {Object} The created info window
 */
function addInfoWindow(map, marker, content, openOnClick = true) {
    if (!map || !marker) {
        console.error('Map and marker are required for info window');
        return null;
    }
    
    const infoWindow = new google.maps.InfoWindow({
        content: content
    });
    
    if (openOnClick) {
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    }
    
    return infoWindow;
}

/**
 * Get user's current location
 * @returns {Promise} Promise resolving to {lat, lng} coordinates
 */
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            reject(new Error('Geolocation is not supported by this browser.'));
        }
    });
}

/**
 * Create a circle overlay on the map (for nearby search visualization)
 * @param {Object} map - Google Map instance
 * @param {Object} center - Center coordinates {lat, lng}
 * @param {number} radius - Radius in kilometers
 * @param {Object} options - Circle options (color, opacity, etc.)
 * @returns {Object} The created circle
 */
function createRadiusCircle(map, center, radius, options = {}) {
    if (!map || !center) {
        console.error('Map and center are required for radius circle');
        return null;
    }
    
    const defaultOptions = {
        strokeColor: '#28a745',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#28a745',
        fillOpacity: 0.1
    };
    
    const circleOptions = Object.assign({}, defaultOptions, options, {
        map: map,
        center: center,
        radius: radius * 1000 // Convert km to meters
    });
    
    return new google.maps.Circle(circleOptions);
}

/**
 * Create a marker cluster for grouping multiple markers
 * @param {Object} map - Google Map instance
 * @param {Array} markers - Array of Google Maps Markers
 * @returns {Object} The created marker cluster
 */
function createMarkerCluster(map, markers) {
    if (!map || !markers || !markers.length) {
        console.error('Map and markers array are required for clustering');
        return null;
    }
    
    // Note: Requires MarkerClusterer library
    if (typeof MarkerClusterer !== 'undefined') {
        return new MarkerClusterer(map, markers, {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
        });
    } else {
        console.error('MarkerClusterer library is not loaded');
        return null;
    }
}

/**
 * Geocode an address to coordinates
 * @param {string} address - Address to geocode
 * @returns {Promise} Promise resolving to {lat, lng} coordinates
 */
function geocodeAddress(address) {
    return new Promise((resolve, reject) => {
        if (!google || !google.maps || !google.maps.Geocoder) {
            reject(new Error('Google Maps Geocoder not available'));
            return;
        }
        
        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
                const location = results[0].geometry.location;
                resolve({
                    lat: location.lat(),
                    lng: location.lng()
                });
            } else {
                reject(new Error(`Geocoding failed: ${status}`));
            }
        });
    });
}

/**
 * Reverse geocode coordinates to address
 * @param {Object} location - Coordinates {lat, lng}
 * @returns {Promise} Promise resolving to address details
 */
function reverseGeocode(location) {
    return new Promise((resolve, reject) => {
        if (!google || !google.maps || !google.maps.Geocoder) {
            reject(new Error('Google Maps Geocoder not available'));
            return;
        }
        
        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({ location: location }, (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
                resolve(results[0]);
            } else {
                reject(new Error(`Reverse geocoding failed: ${status}`));
            }
        });
    });
}

/**
 * Extract district and state from a geocoded result
 * @param {Object} geocodeResult - Result from Google Maps Geocoder
 * @returns {Object} Object with district and state properties
 */
function extractDistrictAndState(geocodeResult) {
    if (!geocodeResult || !geocodeResult.address_components) {
        return { district: null, state: null };
    }
    
    const addressComponents = geocodeResult.address_components;
    let district = null;
    let state = null;
    
    for (const component of addressComponents) {
        if (component.types.includes('administrative_area_level_2')) {
            district = component.long_name;
        }
        
        if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
        }
    }
    
    return { district, state };
}

/**
 * Create a heatmap layer to visualize density of points
 * @param {Object} map - Google Map instance
 * @param {Array} points - Array of {lat, lng} coordinates
 * @param {Object} options - Heatmap options
 * @returns {Object} The created heatmap layer
 */
function createHeatmap(map, points, options = {}) {
    if (!map || !points || !points.length) {
        console.error('Map and points array are required for heatmap');
        return null;
    }
    
    // Convert points to LatLng objects
    const heatmapData = points.map(point => 
        new google.maps.LatLng(point.lat, point.lng)
    );
    
    const defaultOptions = {
        radius: 20,
        opacity: 0.7,
        gradient: [
            'rgba(0, 255, 0, 0)',
            'rgba(0, 255, 0, 1)',
            'rgba(0, 191, 0, 1)',
            'rgba(0, 127, 0, 1)',
            'rgba(0, 63, 0, 1)'
        ]
    };
    
    const heatmapOptions = Object.assign({}, defaultOptions, options, {
        data: heatmapData
    });
    
    // Create heatmap layer
    return new google.maps.visualization.HeatmapLayer(heatmapOptions);
}
