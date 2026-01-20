/**
 * GEOCODING.JS - Place Search & Autocomplete
 * Integrates with Nominatim API for place name to coordinates conversion
 */

class GeocodingService {
    constructor() {
        this.debounceTimer = null;
        this.lastSearchQuery = '';
        this.minChars = 3;
        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    /**
     * Attach event listeners to input fields
     */
    attachEventListeners() {
        const inputs = document.querySelectorAll('input[data-autocomplete="true"]');
        
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.handleInputChange(e.target);
            });

            input.addEventListener('blur', () => {
                setTimeout(() => {
                    const dropdown = input.parentElement.querySelector('.autocomplete-dropdown');
                    if (dropdown) dropdown.classList.remove('show');
                }, 200);
            });
        });

        // Swap button functionality
        const swapBtn = document.querySelector('.swap-btn');
        if (swapBtn) {
            swapBtn.addEventListener('click', () => this.swapInputs());
        }
    }

    /**
     * Handle input change with debouncing
     */
    handleInputChange(input) {
        const query = input.value.trim();

        // Clear debounce timer
        clearTimeout(this.debounceTimer);

        if (query.length < this.minChars) {
            const dropdown = input.parentElement.querySelector('.autocomplete-dropdown');
            if (dropdown) dropdown.classList.remove('show');
            return;
        }

        // Debounce search requests
        this.debounceTimer = setTimeout(() => {
            this.searchPlaces(query, input);
        }, 500);
    }

    /**
     * Search places using Nominatim API
     */
    async searchPlaces(query, input) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'SafeTravelAlarm/1.0'
                    }
                }
            );

            if (!response.ok) throw new Error('Search failed');

            const results = await response.json();
            this.displayResults(results, input);
        } catch (error) {
            console.error('Geocoding error:', error);
            this.displayError(input);
        }
    }

    /**
     * Display autocomplete results
     */
    displayResults(results, input) {
        const dropdown = input.parentElement.querySelector('.autocomplete-dropdown') ||
                        this.createDropdown(input);

        dropdown.innerHTML = '';

        if (results.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'autocomplete-item';
            noResults.textContent = '❌ No places found';
            noResults.style.color = '#cbd5e1';
            dropdown.appendChild(noResults);
            dropdown.classList.add('show');
            return;
        }

        results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.innerHTML = `
                <strong>${result.name}</strong><br>
                <small style="color: #94a3b8; font-size: 0.85em;">
                    ${result.address?.country || result.address?.city || ''}
                </small>
            `;

            item.addEventListener('click', () => {
                this.selectPlace(result, input);
            });

            dropdown.appendChild(item);
        });

        dropdown.classList.add('show');
    }

    /**
     * Select a place from results
     */
    selectPlace(place, input) {
        input.value = place.name;
        input.dataset.latitude = place.lat;
        input.dataset.longitude = place.lon;

        const dropdown = input.parentElement.querySelector('.autocomplete-dropdown');
        if (dropdown) dropdown.classList.remove('show');

        // Trigger change event for form validation
        input.dispatchEvent(new Event('change'));
    }

    /**
     * Display error message
     */
    displayError(input) {
        const dropdown = input.parentElement.querySelector('.autocomplete-dropdown') ||
                        this.createDropdown(input);

        dropdown.innerHTML = `
            <div class="autocomplete-item" style="color: #ef4444;">
                ❌ Error searching locations. Please try again.
            </div>
        `;
        dropdown.classList.add('show');
    }

    /**
     * Create dropdown element if not exists
     */
    createDropdown(input) {
        let dropdown = input.parentElement.querySelector('.autocomplete-dropdown');
        if (dropdown) return dropdown;

        dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        input.parentElement.appendChild(dropdown);
        return dropdown;
    }

    /**
     * Swap source and destination inputs
     */
    swapInputs() {
        const inputs = document.querySelectorAll('input[data-autocomplete="true"]');
        if (inputs.length < 2) return;

        const source = inputs[0];
        const destination = inputs[1];

        // Swap values
        [source.value, destination.value] = [destination.value, source.value];
        [source.dataset.latitude, destination.dataset.latitude] = 
            [destination.dataset.latitude, source.dataset.latitude];
        [source.dataset.longitude, destination.dataset.longitude] = 
            [destination.dataset.longitude, source.dataset.longitude];

        // Trigger change events
        source.dispatchEvent(new Event('change'));
        destination.dispatchEvent(new Event('change'));

        // Close dropdowns
        document.querySelectorAll('.autocomplete-dropdown').forEach(dd => {
            dd.classList.remove('show');
        });
    }

    /**
     * Get selected place coordinates
     */
    getSelectedPlace(input) {
        const name = input.value.trim();
        const lat = input.dataset.latitude;
        const lon = input.dataset.longitude;

        if (!name || !lat || !lon) {
            return null;
        }

        return {
            name,
            latitude: parseFloat(lat),
            longitude: parseFloat(lon)
        };
    }

    /**
     * Validate both source and destination are selected
     */
    validateBothSelected() {
        const inputs = document.querySelectorAll('input[data-autocomplete="true"]');
        if (inputs.length < 2) return false;

        const source = this.getSelectedPlace(inputs[0]);
        const destination = this.getSelectedPlace(inputs[1]);

        return source && destination;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.geocoding = new GeocodingService();
});
