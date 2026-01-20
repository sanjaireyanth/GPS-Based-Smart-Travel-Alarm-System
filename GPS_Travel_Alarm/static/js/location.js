/**
 * location.js - GPS Location Tracking Module
 * Handles browser Geolocation API and live tracking updates
 */

class LocationTracker {
    constructor() {
        this.watchId = null;
        this.currentLocation = null;
        this.destination = null;
        this.alertDistance = null;
        this.isTracking = false;
        this.checkInterval = 1000; // Check every 1 second
    }

    /**
     * Start location tracking
     */
    async startTracking() {
        try {
            // Fetch destination from server
            const response = await fetch('/api/get-destination');
            if (!response.ok) {
                throw new Error('No destination set');
            }

            const dest = await response.json();
            this.destination = {
                lat: dest.lat,
                lon: dest.lon
            };
            this.alertDistance = dest.alert_distance;

            // Check browser geolocation support
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported by your browser');
            }

            this.isTracking = true;
            document.getElementById('status').textContent = 'Getting your location...';
            document.getElementById('gpsStatus').classList.add('active');
            document.getElementById('gpsText').textContent = 'GPS Active';

            // Start watching location
            this.watchId = navigator.geolocation.watchPosition(
                (position) => this.onLocationSuccess(position),
                (error) => this.onLocationError(error),
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );

        } catch (error) {
            console.error('Tracking error:', error);
            document.getElementById('status').textContent = `Error: ${error.message}`;
            document.getElementById('gpsStatus').classList.remove('active');
            document.getElementById('gpsStatus').classList.add('danger');
        }
    }

    /**
     * Handle successful location retrieval
     */
    onLocationSuccess(position) {
        const { latitude, longitude, accuracy } = position.coords;
        
        this.currentLocation = {
            lat: latitude,
            lon: longitude,
            accuracy: accuracy,
            timestamp: new Date().getTime()
        };

        // Update UI
        this.updateUI();

        // Check if alarm should trigger
        this.checkAlarmCondition();
    }

    /**
     * Handle location error
     */
    onLocationError(error) {
        console.error('Geolocation error:', error);
        document.getElementById('status').textContent = `Location Error: ${error.message}`;
        document.getElementById('gpsStatus').classList.remove('active');
        document.getElementById('gpsStatus').classList.add('danger');
    }

    /**
     * Update UI with current location data
     */
    updateUI() {
        if (!this.currentLocation) return;

        // Update latitude and longitude
        document.getElementById('currentLat').textContent = 
            this.currentLocation.lat.toFixed(4);
        document.getElementById('currentLon').textContent = 
            this.currentLocation.lon.toFixed(4);

        // Update alert distance
        document.getElementById('alertDistance').textContent = 
            this.alertDistance.toFixed(2) + ' KM';

        // Calculate distance to destination
        const distance = this.calculateDistance(
            this.currentLocation.lat,
            this.currentLocation.lon,
            this.destination.lat,
            this.destination.lon
        );

        // Update distance display
        document.getElementById('distance').textContent = distance.toFixed(3) + ' KM';

        // Update progress bar
        const progress = Math.max(0, (1 - (distance / (this.alertDistance * 2))) * 100);
        document.getElementById('progressFill').style.width = progress + '%';

        // Update progress text
        const remaining = Math.max(0, distance - this.alertDistance);
        if (remaining > 0) {
            document.getElementById('progressText').textContent = 
                `${remaining.toFixed(2)} KM remaining before alert`;
        } else {
            document.getElementById('progressText').textContent = 
                `Alert triggered! ${distance.toFixed(2)} KM from destination`;
        }

        // Update status
        if (distance <= this.alertDistance) {
            document.getElementById('status').textContent = 
                '⚠️ ALERT DISTANCE REACHED!';
            document.getElementById('infoBox').style.display = 'block';
            document.getElementById('warningBox').style.display = 'block';
        } else {
            document.getElementById('status').textContent = 
                `Distance to destination: ${distance.toFixed(2)} KM`;
            document.getElementById('infoBox').style.display = 'block';
            document.getElementById('warningBox').style.display = 'none';
        }
    }

    /**
     * Check if alarm condition is met (distance <= alert distance)
     */
    checkAlarmCondition() {
        if (!this.currentLocation || !this.destination) return;

        const distance = this.calculateDistance(
            this.currentLocation.lat,
            this.currentLocation.lon,
            this.destination.lat,
            this.destination.lon
        );

        // Trigger alarm if within alert distance
        if (distance <= this.alertDistance) {
            this.triggerAlarm();
        }
    }

    /**
     * Calculate distance using Haversine formula
     * @param {number} lat1 - Current latitude
     * @param {number} lon1 - Current longitude
     * @param {number} lat2 - Destination latitude
     * @param {number} lon2 - Destination longitude
     * @returns {number} Distance in kilometers
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        return DistanceCalculator.haversine(lat1, lon1, lat2, lon2);
    }

    /**
     * Trigger alarm - save location and redirect to alarm page
     */
    async triggerAlarm() {
        // Stop tracking
        this.stopTracking();

        // Save alarm location to localStorage
        localStorage.setItem('lastAlarmLocation', JSON.stringify(this.currentLocation));
        localStorage.setItem('alarmDestination', JSON.stringify(this.destination));

        // Log alarm to server
        try {
            await fetch('/api/log-alarm-triggered', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    location: this.currentLocation,
                    destination: this.destination,
                    distance: this.calculateDistance(
                        this.currentLocation.lat,
                        this.currentLocation.lon,
                        this.destination.lat,
                        this.destination.lon
                    )
                })
            });
        } catch (error) {
            console.error('Error logging alarm:', error);
        }

        // Redirect to alarm page
        window.location.href = '/alarm';
    }

    /**
     * Stop location tracking
     */
    stopTracking() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            this.isTracking = false;
        }
    }
}

// Create global tracker instance
let locationTracker;

// Initialize tracker when page loads
document.addEventListener('DOMContentLoaded', () => {
    locationTracker = new LocationTracker();
    locationTracker.startTracking();

    // Stop tracking button
    const stopBtn = document.getElementById('stopBtn');
    if (stopBtn) {
        stopBtn.style.display = 'block';
        stopBtn.addEventListener('click', () => {
            locationTracker.stopTracking();
            window.location.href = '/home';
        });
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (locationTracker) {
        locationTracker.stopTracking();
    }
});
