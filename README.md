# SafeTravel - GPS-Based Smart Travel Alarm System

A modern, web-based travel safety application that alerts you when you're approaching your destination. Perfect for travelers, commuters, and anyone who needs a reliable alarm for long journeys.

## Author

Author: Sanjai Reyanth  
Project: GPS Based Smart Travel Alarm System  
License: MIT  

## Features

✨ **Modern Dark UI** - Sleek glassmorphism design with animated components
🌍 **Place-Name Geocoding** - Search by city/location names instead of coordinates
📍 **Real-Time GPS Tracking** - Live location tracking with progress indication
🔔 **Customizable Alarm** - Set the alarm distance (0.5-50 km) before your destination
🎵 **Smart Alarm System** - Web Audio API alarm with 30-second countdown to emergency
📱 **Mobile Responsive** - Fully responsive design optimized for all devices
🚨 **Emergency Mode** - Automatic location logging and emergency alert page
🗺️ **Route Confirmation** - Visual route confirmation before journey starts
⚡ **No Database Required** - Session-based state management, runs locally

## Technology Stack

- **Backend**: Python Flask 3.0.0, Werkzeug 3.0.0
- **Frontend**: HTML5, CSS3 (Glassmorphism, Animations), Vanilla JavaScript ES6
- **APIs**: Nominatim (Free OpenStreetMap Geocoding)
- **Geolocation**: W3C Geolocation API
- **Audio**: Web Audio API (880 Hz oscillator with LFO modulation)
- **No External Dependencies**: All styling and interaction built from scratch

## Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser with HTTPS support (or localhost)

### Setup Steps

1. **Clone the Repository**
   ```bash
   cd GPS_Travel_Alarm
   ```

2. **Create Virtual Environment** (Recommended)
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Application**
   ```bash
   python app.py
   ```

5. **Access the Application**
   - Open browser: `http://localhost:5000`
   - The application is now ready to use!

## Usage Guide

### Step 1: Select Route
1. Enter your starting point (e.g., "Chennai")
2. Enter your destination (e.g., "Madurai")
3. Use the swap button (↕) to exchange source and destination
4. Click "Calculate Route" to proceed

**Geocoding Tips:**
- Search by city name: "New York", "London", "Tokyo"
- Search by region: "Tamil Nadu", "California"
- Search by landmark: "Taj Mahal", "Statue of Liberty"
- The autocomplete shows matching locations as you type

### Step 2: Confirm Route
1. Review your route (source → destination)
2. Check the total distance calculation
3. Click "Continue to Alarm Setup" or "Change Route" to modify

### Step 3: Set Alarm Distance
1. Use the slider to set alarm distance (0.5-50 km)
2. The preview shows: "Your alarm will ring when you're X km away"
3. Click "Start Journey" to begin tracking

### Step 4: Live Tracking
1. **Grant Location Permission** - Allow browser to access your GPS
2. **Watch the Progress** - See distance to destination update in real-time
3. **Check Status** - Green pulsing dot indicates active GPS
4. **Warning Display** - Message appears when you're 2 km or less away

### Step 5: Destination Alarm
When you reach your alarm distance:
1. 🔔 Alarm rings (Web Audio beeping)
2. ⏱️ 30-second countdown timer appears
3. Click "I'm Getting Off Here" to stop alarm and go to Emergency page
4. OR wait for timeout to trigger automatic emergency

### Step 6: Emergency Mode
If alarm times out:
1. Last known location displays (latitude, longitude, timestamp)
2. Emergency actions available:
   - 📞 **Call Emergency (112)** - Opens phone dialer
   - ⟲ **Start New Journey** - Resets and returns to route selection
   - 🏠 **Go to Home** - Returns to landing page

## API Endpoints

All endpoints expect/return JSON and are protected by session validation.

### POST /api/geocode
Convert place names to coordinates and calculate distance.

**Request:**
```json
{
    "source": "Chennai",
    "destination": "Madurai"
}
```

**Response:**
```json
{
    "success": true,
    "source": "Chennai, Tamil Nadu, India",
    "destination": "Madurai, Tamil Nadu, India",
    "source_latitude": 13.0827,
    "source_longitude": 80.2707,
    "destination_latitude": 9.9252,
    "destination_longitude": 78.1198,
    "total_distance": 165.42
}
```

### POST /api/setup-alarm
Save the alarm distance preference.

**Request:**
```json
{
    "alarm_distance": 10
}
```

**Response:**
```json
{
    "success": true,
    "message": "Alarm setup complete"
}
```

### GET /api/get-journey
Retrieve current journey data from session.

**Response:**
```json
{
    "source": "Chennai",
    "destination": "Madurai",
    "total_distance": 165.42,
    "source_latitude": 13.0827,
    "source_longitude": 80.2707,
    "destination_latitude": 9.9252,
    "destination_longitude": 78.1198,
    "alarm_distance_before": 10.0
}
```

### POST /api/update-location
Send current GPS position and get distance to destination.

**Request:**
```json
{
    "latitude": 13.0500,
    "longitude": 80.2500
}
```

**Response:**
```json
{
    "success": true,
    "distance_remaining": 165.0,
    "latitude": 13.0500,
    "longitude": 80.2500
}
```

### POST /api/trigger-alarm
Log alarm trigger event and prepare for emergency.

**Request:** (Empty body)

**Response:**
```json
{
    "success": true,
    "message": "Alarm triggered"
}
```

### POST /api/trigger-emergency
Log emergency event after alarm timeout.

**Request:** (Empty body)

**Response:**
```json
{
    "success": true,
    "message": "Emergency triggered"
}
```

### POST /api/reset
Clear session and return to initial state.

**Request:** (Empty body)

**Response:**
```json
{
    "success": true,
    "message": "System reset"
}
```

## File Structure

```
GPS_Travel_Alarm/
├── app.py                          # Main Flask application
├── requirements.txt                # Python dependencies
├── README.md                       # This file
├── templates/
│   ├── index.html                 # Landing page with hero section
│   ├── home.html                  # Route selection with geocoding
│   ├── route_selection.html       # Route confirmation page
│   ├── alarm_setup.html           # Alarm distance configuration
│   ├── tracking.html              # GPS tracking dashboard
│   ├── alarm.html                 # Alarm alert screen
│   └── emergency.html             # Emergency alert page
└── static/
    ├── css/
    │   ├── style.css              # Main stylesheet (dark theme, glassmorphism)
    │   ├── animations.css         # Keyframe animations library
    │   └── alarm.css              # Red alert theme for alarm/emergency
    └── js/
        ├── navigation.js          # Client-side routing and navigation
        ├── geocoding.js           # Nominatim API integration
        ├── tracking.js            # GPS tracking and alarm trigger
        ├── alarm.js               # Alarm sound and countdown
        └── distance.js            # Distance calculation utilities
```

## Configuration

### Environment Variables (Optional)

To run in production, set Flask SECRET_KEY:

```bash
# Linux/Mac
export FLASK_SECRET_KEY="your-secret-key-here"
export FLASK_ENV="production"

# Windows PowerShell
$env:FLASK_SECRET_KEY = "your-secret-key-here"
$env:FLASK_ENV = "production"
```

### Development vs Production

**Development** (Default):
- Runs on `http://localhost:5000`
- Debug mode enabled
- Hot-reload on file changes

**Production**:
- Use WSGI server (e.g., Gunicorn)
- Set `FLASK_ENV=production`
- Use HTTPS with valid SSL certificate
- Set secure `SECRET_KEY`

Example production deployment with Gunicorn:
```bash
pip install gunicorn
gunicorn --workers 4 --bind 0.0.0.0:5000 app:app
```

## Testing with Sample Routes

### India Routes
- **Chennai to Madurai** (~165 km) - ~3-4 hours
- **Delhi to Jaipur** (~230 km) - ~4-5 hours
- **Mumbai to Pune** (~150 km) - ~3 hours
- **Bangalore to Mysore** (~145 km) - ~3 hours

### International Routes
- **New York to Boston** (~350 km) - ~4 hours
- **London to Manchester** (~330 km) - ~4 hours
- **Paris to Lyon** (~465 km) - ~5 hours
- **Tokyo to Kyoto** (~475 km) - ~3.5 hours

**Testing Tips:**
1. Use a laptop/desktop for testing (more reliable GPS)
2. Grant location permission when prompted
3. Set alarm distance to 2-5 km for shorter test routes
4. Test on actual route or use geolocation spoofing in DevTools
5. Check browser console for API responses and errors

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended, best performance |
| Firefox | ✅ Full | Full support for all features |
| Safari | ✅ Full | iOS/macOS compatible |
| Edge | ✅ Full | Chromium-based, fully supported |
| IE 11 | ❌ Not Supported | Modern ES6 syntax required |

## Troubleshooting

### GPS Not Working
- ✅ Check browser location permission
- ✅ Ensure HTTPS or localhost
- ✅ Check browser console for geolocation errors
- ✅ Verify "enableHighAccuracy: true" is set

### Alarm Not Sounding
- ✅ Check browser audio is not muted
- ✅ Verify system volume is on
- ✅ Check browser console for Web Audio API errors
- ✅ Try fallback HTML5 audio element

### Geocoding Returning Wrong Location
- ✅ Use full location names: "Chennai, Tamil Nadu, India"
- ✅ Try alternative spellings
- ✅ Check Nominatim API status
- ✅ Add more specific location identifiers

### Session Expires / Cannot Continue Journey
- ✅ Session times out after 30 minutes of inactivity
- ✅ Restart journey from home page
- ✅ Check browser privacy settings (cookies must be enabled)

### Distance Calculation Incorrect
- ✅ Nominatim may return center coordinates, not exact entry points
- ✅ Use major city centers for more accurate results
- ✅ GPS drift can vary ±10-20 meters

## Performance Optimization

### Frontend
- Minified CSS and JavaScript in production
- Lazy loading for images
- CSS animations run on GPU (transform, opacity)
- Debounced geocoding search (500ms)
- Throttled location updates (1000ms)

### Backend
- Cached geocoding results in session
- Haversine formula for O(1) distance calculation
- Session-based state (no database overhead)
- Nominatim API rate limiting: ~1 request per second

## Security Considerations

⚠️ **Development Only Features:**
- Debug mode enabled
- No CSRF protection (add in production)
- Session stored server-side (Flask default)
- No user authentication required

🔒 **Production Recommendations:**
1. Enable HTTPS with valid SSL certificate
2. Use strong `SECRET_KEY` (32+ characters)
3. Add CSRF protection with Flask-WTF
4. Implement rate limiting for API endpoints
5. Add user authentication/authorization
6. Log all emergency triggers
7. Implement proper error handling for sensitive data
8. Use environment variables for secrets

## Data Privacy

- **Location Data**: Not stored anywhere (only in session during journey)
- **Session Data**: Server-side Flask session (expires after inactivity)
- **Nominatim API**: Uses OpenStreetMap (check their privacy policy)
- **No Telemetry**: Application doesn't collect or send user data anywhere

## Contributing

This project was created as an educational resource for GPS-based travel safety systems. Feel free to:
- Report bugs and issues
- Suggest improvements
- Create enhancements
- Share with others

## License

Open Source - Free to use for personal and educational purposes.

## Author

Created: January 2026

---

## Quick Reference

### Keyboard Shortcuts
- `Esc` - Go back to previous page
- `Enter` - Submit forms

### Hotkeys (Development)
- `F12` - Open Developer Tools
- `Ctrl+Shift+I` - Open Inspector
- `Ctrl+Shift+K` - Open Console

## Support

For issues, questions, or improvements:
1. Check the troubleshooting section above
2. Review API endpoints documentation
3. Check browser console for detailed error messages
4. Verify all dependencies are installed correctly

---

**Safe travels! 🚗✨**
