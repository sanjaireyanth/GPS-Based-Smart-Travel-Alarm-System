/**
 * distance.js - Distance Calculation Module
 * Implements Haversine formula for GPS distance calculation
 */

class DistanceCalculator {
    /**
     * Haversine Formula - Calculate great circle distance between two points
     * on Earth given their longitudes and latitudes
     * 
     * @param {number} lat1 - Latitude of point 1 (degrees)
     * @param {number} lon1 - Longitude of point 1 (degrees)
     * @param {number} lat2 - Latitude of point 2 (degrees)
     * @param {number} lon2 - Longitude of point 2 (degrees)
     * @returns {number} Distance in kilometers
     * 
     * Formula: a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
     *          c = 2 × atan2(√a, √(1−a))
     *          d = R × c  (where R is Earth's radius = 6371 km)
     */
    static haversine(lat1, lon1, lat2, lon2) {
        // Earth's radius in kilometers
        const R = 6371;

        // Convert degrees to radians
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        
        const lat1Rad = this.toRad(lat1);
        const lat2Rad = this.toRad(lat2);

        // Haversine formula
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    }

    /**
     * Convert degrees to radians
     * @param {number} degrees 
     * @returns {number} Radians
     */
    static toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Convert kilometers to meters
     * @param {number} km 
     * @returns {number} Meters
     */
    static kmToMeters(km) {
        return km * 1000;
    }

    /**
     * Convert meters to kilometers
     * @param {number} meters 
     * @returns {number} Kilometers
     */
    static metersToKm(meters) {
        return meters / 1000;
    }

    /**
     * Calculate distance and return in user-friendly format
     * @param {number} lat1 
     * @param {number} lon1 
     * @param {number} lat2 
     * @param {number} lon2 
     * @returns {object} Distance in various units
     */
    static getDistance(lat1, lon1, lat2, lon2) {
        const distanceKm = this.haversine(lat1, lon1, lat2, lon2);
        
        return {
            kilometers: distanceKm,
            meters: this.kmToMeters(distanceKm),
            miles: distanceKm * 0.621371,
            formatted: `${distanceKm.toFixed(2)} KM`
        };
    }

    /**
     * Validate GPS coordinates
     * @param {number} latitude 
     * @param {number} longitude 
     * @returns {boolean} True if valid
     */
    static isValidCoordinates(latitude, longitude) {
        return latitude >= -90 && 
               latitude <= 90 && 
               longitude >= -180 && 
               longitude <= 180;
    }

    /**
     * Check if two locations are within a certain distance
     * @param {number} lat1 
     * @param {number} lon1 
     * @param {number} lat2 
     * @param {number} lon2 
     * @param {number} distanceKm - Distance in kilometers
     * @returns {boolean} True if within distance
     */
    static isWithinDistance(lat1, lon1, lat2, lon2, distanceKm) {
        const actualDistance = this.haversine(lat1, lon1, lat2, lon2);
        return actualDistance <= distanceKm;
    }

    /**
     * Calculate bearing between two points (optional feature)
     * Returns direction from point 1 to point 2
     * @param {number} lat1 
     * @param {number} lon1 
     * @param {number} lat2 
     * @param {number} lon2 
     * @returns {number} Bearing in degrees (0-360)
     */
    static calculateBearing(lat1, lon1, lat2, lon2) {
        const lat1Rad = this.toRad(lat1);
        const lat2Rad = this.toRad(lat2);
        const dLon = this.toRad(lon2 - lon1);

        const y = Math.sin(dLon) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
                  Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

        const bearing = Math.atan2(y, x);
        return ((this.toRad(bearing) + 360) % 360); // Convert to degrees (0-360)
    }
}

// Export for testing purposes (in Node.js environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DistanceCalculator;
}
