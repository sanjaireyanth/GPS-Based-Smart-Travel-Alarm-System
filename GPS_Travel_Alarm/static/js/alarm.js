/**
 * ALARM.JS - Alarm Sound & Emergency Trigger
 * Handles alarm sound playback and emergency redirect countdown
 */

class AlarmManager {
    constructor() {
        this.countdownDuration = 30; // 30 seconds before emergency
        this.countdownRemaining = this.countdownDuration;
        this.countdownInterval = null;
        this.alarmSound = null;
        this.journeyData = null;
        this.init();
    }

    async init() {
        await this.loadJourneyData();
        this.setupAlarmSound();
        this.playAlarm();
        this.startCountdown();
        this.attachEventListeners();
        this.displayAlarmInfo();
    }

    /**
     * Load journey data from backend
     */
    async loadJourneyData() {
        try {
            const response = await fetch('/api/get-journey');
            if (!response.ok) throw new Error('Failed to load journey');
            this.journeyData = await response.json();
        } catch (error) {
            console.error('Journey load error:', error);
        }
    }

    /**
     * Setup alarm sound
     */
    setupAlarmSound() {
        // Create Web Audio Context for alarm sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Alarm frequency (880 Hz - high pitch)
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        
        // Modulate frequency for alarm effect
        const lfo = audioContext.createOscillator();
        lfo.frequency.setValueAtTime(6, audioContext.currentTime); // 6 Hz modulation
        const lfoGain = audioContext.createGain();
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        lfoGain.gain.setValueAtTime(100, audioContext.currentTime);
        
        // Set volume
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        
        this.audioContext = audioContext;
        this.oscillator = oscillator;
        this.lfo = lfo;
        this.gainNode = gainNode;
    }

    /**
     * Play alarm sound
     */
    playAlarm() {
        try {
            this.oscillator.start();
            this.lfo.start();
            
            // Pulsing effect
            setInterval(() => {
                const now = this.audioContext.currentTime;
                this.gainNode.gain.setValueAtTime(0.3, now);
                this.gainNode.gain.linearRampToValueAtTime(0.1, now + 0.3);
                this.gainNode.gain.linearRampToValueAtTime(0.3, now + 0.6);
            }, 600);
        } catch (error) {
            console.log('Web Audio API not available, using fallback');
            this.playFallbackAlarm();
        }
    }

    /**
     * Fallback alarm using HTML5 audio element
     */
    playFallbackAlarm() {
        const audio = document.querySelector('audio[data-alarm]');
        if (audio) {
            audio.loop = true;
            audio.play().catch(err => {
                console.log('Audio playback failed:', err);
                // Use visual alarm only
            });
        }
    }

    /**
     * Stop alarm sound
     */
    stopAlarm() {
        try {
            this.oscillator?.stop();
            this.lfo?.stop();
        } catch (error) {
            console.log('Alarm already stopped');
        }

        const audio = document.querySelector('audio[data-alarm]');
        if (audio) {
            audio.pause();
        }
    }

    /**
     * Start countdown timer
     */
    startCountdown() {
        const timerDisplay = document.querySelector('.alarm-countdown-timer');
        
        this.countdownInterval = setInterval(() => {
            this.countdownRemaining--;
            
            if (timerDisplay) {
                timerDisplay.textContent = this.countdownRemaining + 's';
            }

            if (this.countdownRemaining <= 0) {
                this.triggerEmergency();
            }
        }, 1000);
    }

    /**
     * Stop countdown
     */
    stopCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
    }

    /**
     * Trigger emergency alert
     */
    async triggerEmergency() {
        this.stopCountdown();
        this.stopAlarm();

        try {
            await fetch('/api/trigger-emergency', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Emergency trigger error:', error);
        }

        // Redirect to emergency page
        window.location.href = '/emergency';
    }

    /**
     * User acknowledged alarm - go to emergency
     */
    acknowledgeAlarm() {
        this.stopCountdown();
        this.stopAlarm();
        this.triggerEmergency();
    }

    /**
     * Display alarm information
     */
    displayAlarmInfo() {
        if (!this.journeyData) return;

        const { route_data } = this.journeyData;

        // Update route info
        const routeElements = document.querySelectorAll('.alarm-route p');
        if (routeElements.length >= 2) {
            routeElements[0].innerHTML = `<span class="route-from">${route_data.source}</span> → <span class="route-to">${route_data.destination}</span>`;
        }

        // Update countdown display
        const countdownDisplay = document.querySelector('.alarm-countdown-timer');
        if (countdownDisplay) {
            countdownDisplay.textContent = this.countdownRemaining + 's';
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const stopBtn = document.getElementById('stopAlarmBtn') || 
                       document.querySelector('.btn-emergency');
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.acknowledgeAlarm();
            });
        }

        // Stop alarm and countdown if user leaves page
        window.addEventListener('beforeunload', () => {
            this.stopAlarm();
            this.stopCountdown();
        });
    }
}

// Initialize alarm manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('/alarm')) {
        window.alarmManager = new AlarmManager();
    }
});
