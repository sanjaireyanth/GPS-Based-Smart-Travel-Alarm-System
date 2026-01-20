/**
 * TRACKING.JS - Live GPS Tracking & Alarm Trigger
 * Tracks user location and triggers alarm when destination is reached
 */

class GPSTracker {
    constructor() {
        this.watchId = null;
        this.journeyData = null;
        this.isTracking = false;
        this.lastUpdateTime = 0;
        this.updateInterval = 1000; // Update every 1 second
        this.alarmTriggered = false;
        this.init();
    }

    async init() {
        await this.loadJourneyData();
        await this.startTracking();
        this.attachEventListeners();
        this.updateUI();
    }

    /**
     * Load journey data from backend
     */
    async loadJourneyData() {
        try {
            const response = await fetch('/api/get-journey');
            if (!response.ok) throw new Error('Failed to load journey');
            
            this.journeyData = await response.json();
            console.log('Journey data loaded:', this.journeyData);
        } catch (error) {
            console.error('Journey load error:', error);
            window.location.href = '/home';
        }
    }

    /**
     * Start GPS tracking
     */
    startTracking() {
        if (!navigator.geolocation) {
            this.showError('Geolocation not supported');
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.onLocationUpdate(position),
            (error) => this.onLocationError(error),
            options
        );

        this.isTracking = true;
        this.updateGPSStatus(true);
    }

    /**
     * Stop GPS tracking
     */
    stopTracking() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.isTracking = false;
            this.updateGPSStatus(false);
        }
    }

    /**
     * Handle location update
     */
    async onLocationUpdate(position) {
        const now = Date.now();
        if (now - this.lastUpdateTime < this.updateInterval) return;
        this.lastUpdateTime = now;

        const { latitude, longitude, accuracy } = position.coords;

        try {
            // Send location to backend and get distance
            const response = await fetch('/api/update-location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude,
                    longitude,
                    accuracy
                })
            });

            if (!response.ok) throw new Error('Location update failed');

            const data = await response.json();
            this.updateTrackingDisplay(data);
            
            // Check if alarm should trigger
            if (!this.alarmTriggered && data.distance_to_destination <= data.alarm_distance) {
                this.triggerAlarm();
            }
        } catch (error) {
            console.error('Location update error:', error);
        }
    }

    /**
     * Handle location error
     */
    onLocationError(error) {
        console.error('Geolocation error:', error);
        
        let message = 'Location error';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = 'Location permission denied. Please enable GPS.';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Location unavailable. Check GPS signal.';
                break;
            case error.TIMEOUT:
                message = 'Location request timeout. Retrying...';
                break;
        }
        
        this.showError(message);
    }

    /**
     * Update tracking display with location data
     */
    updateTrackingDisplay(data) {
        // Update distance display
        const distanceDisplay = document.getElementById('distanceDisplay');
        if (distanceDisplay) {
            distanceDisplay.textContent = data.distance_to_destination.toFixed(2);
        }

        // Update progress bar
        const totalDistance = this.journeyData.route_data.distance;
        const progress = ((totalDistance - data.distance_to_destination) / totalDistance) * 100;
        const progressBar = document.querySelector('.progress-bar-fill');
        if (progressBar) {
            progressBar.style.width = Math.min(progress, 100) + '%';
        }

        // Update coordinates
        const currentLat = document.getElementById('currentLat');
        const currentLon = document.getElementById('currentLon');
        if (currentLat) currentLat.textContent = data.latitude.toFixed(4);
        if (currentLon) currentLon.textContent = data.longitude.toFixed(4);

        // Show warning when close to destination
        const warningBox = document.querySelector('.warning-box');
        if (warningBox && data.distance_to_destination <= 2) {
            warningBox.classList.add('show');
        }

        // Store last location for emergency
        sessionStorage.setItem('emergency_data', JSON.stringify({
            lat: data.latitude.toFixed(4),
            lon: data.longitude.toFixed(4),
            timestamp: new Date().toISOString()
        }));
    }

    /**
     * Update GPS status indicator
     */
    updateGPSStatus(active) {
        const statusDot = document.querySelector('.gps-indicator');
        if (statusDot) {
            if (active) {
                statusDot.innerHTML = `
                    <div class="gps-indicator" style="width: 10px; height: 10px; border-radius: 50%; 
                    background: #10b981; animation: pulse 2s ease-in-out infinite;"></div>
                    <span>📍 GPS Active</span>
                `;
            } else {
                statusDot.innerHTML = `
                    <div style="width: 10px; height: 10px; border-radius: 50%; 
                    background: #94a3b8;"></div>
                    <span>📍 GPS Inactive</span>
                `;
            }
        }
    }

    /**
     * Trigger alarm
     */
    async triggerAlarm() {
        this.alarmTriggered = true;
        this.stopTracking();

        try {
            await fetch('/api/trigger-alarm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Alarm trigger error:', error);
        }

        // Navigate to alarm page
        setTimeout(() => {
            window.location.href = '/alarm';
        }, 500);
    }

    /**
     * Update UI elements
     */
    updateUI() {
        if (!this.journeyData) return;

        const { route_data } = this.journeyData;

        // Update route summary
        const fromElement = document.querySelector('.route-from');
        const toElement = document.querySelector('.route-to');
        if (fromElement) fromElement.textContent = route_data.source;
        if (toElement) toElement.textContent = route_data.destination;

        // Initialize distance display
        const distanceDisplay = document.getElementById('distanceDisplay');
        if (distanceDisplay) {
            distanceDisplay.textContent = route_data.distance.toFixed(2);
        }
    }

    /**
     * End journey
     */
    async endJourney() {
        this.stopTracking();

        try {
            await fetch('/api/reset', { method: 'POST' });
        } catch (error) {
            console.error('Reset error:', error);
        }

        window.location.href = '/';
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const endBtn = document.getElementById('endJourneyBtn');
        if (endBtn) {
            endBtn.addEventListener('click', () => {
                if (confirm('End this journey?')) {
                    this.endJourney();
                }
            });
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorDiv = document.querySelector('.form-error') || this.createErrorDiv();
        errorDiv.textContent = '⚠️ ' + message;
        errorDiv.classList.add('show');
    }

    /**
     * Create error div
     */
    createErrorDiv() {
        const div = document.createElement('div');
        div.className = 'form-error';
        div.style.cssText = `
            padding: 1rem;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 0.5rem;
            color: #fca5a5;
            margin-bottom: 1rem;
        `;
        const main = document.querySelector('main') || document.querySelector('.tracking-container');
        if (main) {
            main.insertBefore(div, main.firstChild);
        }
        return div;
    }
}

// Initialize tracker when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('/tracking')) {
        window.tracker = new GPSTracker();
    }
});
