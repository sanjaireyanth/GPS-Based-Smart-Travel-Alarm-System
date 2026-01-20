/**
 * NAVIGATION.JS - Client-Side Navigation & Routing
 * Handles navigation between pages and session validation
 */

class Navigator {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.sessionData = null;
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.setupBackButtons();
        this.validateSessionData();
    }

    /**
     * Detect current page based on URL
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('/tracking')) return 'tracking';
        if (path.includes('/alarm')) return 'alarm';
        if (path.includes('/emergency')) return 'emergency';
        if (path.includes('/alarm-setup')) return 'alarm-setup';
        if (path.includes('/route-selection')) return 'route-selection';
        if (path.includes('/home')) return 'home';
        return 'home';
    }

    /**
     * Navigate to a specific page
     */
    async navigateTo(path, validateSession = true) {
        try {
            if (validateSession) {
                const hasSession = await this.checkSessionData();
                if (!hasSession && !['/', '/home', '/route-selection'].includes(path)) {
                    console.warn('Session data missing, redirecting to home');
                    window.location.href = '/home';
                    return;
                }
            }
            window.location.href = path;
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }

    /**
     * Go back with validation
     */
    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/home';
        }
    }

    /**
     * Check if session data exists
     */
    async checkSessionData() {
        try {
            const response = await fetch('/api/get-journey');
            return response.ok;
        } catch (error) {
            console.error('Session check error:', error);
            return false;
        }
    }

    /**
     * Validate session data for current page
     */
    async validateSessionData() {
        const pagesRequiringSession = [
            'route-selection',
            'alarm-setup',
            'tracking',
            'alarm',
            'emergency'
        ];

        if (pagesRequiringSession.includes(this.currentPage)) {
            const hasSession = await this.checkSessionData();
            if (!hasSession) {
                console.warn('No session data, redirecting to home');
                window.location.href = '/home';
            }
        }
    }

    /**
     * Attach event listeners for navigation
     */
    attachEventListeners() {
        // Handle form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'routeForm') {
                e.preventDefault();
                this.handleRouteFormSubmit(e.target);
            }
        });

        // Handle button clicks
        document.addEventListener('click', (e) => {
            // Back buttons
            if (e.target.classList.contains('btn-back')) {
                e.preventDefault();
                this.goBack();
            }

            // Navigation links
            if (e.target.classList.contains('nav-link')) {
                const href = e.target.getAttribute('href');
                if (href) {
                    e.preventDefault();
                    this.navigateTo(href);
                }
            }

            // Continue buttons on setup pages
            if (e.target.id === 'continueBtn') {
                const nextPage = e.target.getAttribute('data-next');
                if (nextPage) {
                    this.navigateTo(nextPage);
                }
            }

            // Change route button
            if (e.target.id === 'changeRouteBtn') {
                this.navigateTo('/home');
            }

            // Start journey button
            if (e.target.id === 'startJourneyBtn') {
                this.setupAlarmAndNavigate();
            }

            // End journey button
            if (e.target.id === 'endJourneyBtn') {
                this.resetAndNavigate('/');
            }
        });
    }

    /**
     * Setup back buttons on all pages
     */
    setupBackButtons() {
        const backButtons = document.querySelectorAll('.btn-back');
        backButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goBack();
            });
        });
    }

    /**
     * Handle route form submission
     */
    async handleRouteFormSubmit(form) {
        const source = form.querySelector('input[name="source"]')?.value;
        const destination = form.querySelector('input[name="destination"]')?.value;

        if (!source || !destination) {
            this.showError('Please enter both source and destination');
            return;
        }

        try {
            const loader = this.showLoader('Searching locations...');
            const response = await fetch('/api/geocode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    source,
                    destination
                })
            });

            loader?.remove();

            if (!response.ok) {
                this.showError('Unable to find locations. Please check spelling and try again.');
                return;
            }

            const data = await response.json();
            this.navigateTo('/route-selection');
        } catch (error) {
            console.error('Geocoding error:', error);
            this.showError('Error searching locations. Please try again.');
        }
    }

    /**
     * Setup alarm and navigate to tracking
     */
    async setupAlarmAndNavigate() {
        try {
            const alarmDistance = document.querySelector('input[type="range"]')?.value;
            if (!alarmDistance) {
                this.showError('Please set alarm distance');
                return;
            }

            const loader = this.showLoader('Setting up alarm...');
            const response = await fetch('/api/setup-alarm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    alarm_distance_before: parseFloat(alarmDistance)
                })
            });

            loader?.remove();

            if (!response.ok) {
                this.showError('Error setting up alarm');
                return;
            }

            this.navigateTo('/tracking');
        } catch (error) {
            console.error('Alarm setup error:', error);
            this.showError('Error setting up alarm');
        }
    }

    /**
     * Reset session and navigate
     */
    async resetAndNavigate(path) {
        try {
            await fetch('/api/reset', { method: 'POST' });
            window.location.href = path;
        } catch (error) {
            console.error('Reset error:', error);
            window.location.href = path;
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorDiv = document.querySelector('.form-error') || this.createErrorDiv();
        errorDiv.textContent = '⚠️ ' + message;
        errorDiv.classList.add('show');
        
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 4000);
    }

    /**
     * Create error display element
     */
    createErrorDiv() {
        const div = document.createElement('div');
        div.className = 'form-error';
        const form = document.querySelector('form') || document.querySelector('main');
        if (form) {
            form.insertBefore(div, form.firstChild);
        }
        return div;
    }

    /**
     * Show loader overlay
     */
    showLoader(message = 'Loading...') {
        const loader = document.createElement('div');
        loader.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(15, 23, 42, 0.95);
            padding: 2rem;
            border-radius: 1rem;
            border: 1px solid rgba(99, 102, 241, 0.3);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            backdrop-filter: blur(10px);
        `;

        const spinner = document.createElement('div');
        spinner.style.cssText = `
            width: 40px;
            height: 40px;
            border: 4px solid rgba(99, 102, 241, 0.2);
            border-top: 4px solid #818cf8;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        `;

        const text = document.createElement('div');
        text.textContent = message;
        text.style.cssText = 'color: #cbd5e1; font-weight: 500;';

        loader.appendChild(spinner);
        loader.appendChild(text);
        document.body.appendChild(loader);

        return loader;
    }
}

// Initialize navigator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.navigator = new Navigator();
});
