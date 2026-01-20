# 🚀 Quick Reference Guide - GPS Smart Travel Alarm System

## ⚡ Start in 30 Seconds

```bash
pip install -r requirements.txt
python app.py
# Open http://localhost:5000
```

---

## 📍 Test Coordinates (Ready to Use)

### Mumbai Route
```
Destination: 19.0760, 72.8884
Alert Distance: 0.5 KM
```

### Pune Route
```
Destination: 18.5204, 73.8567
Alert Distance: 1.0 KM
```

### Delhi Route
```
Destination: 28.7041, 77.1025
Alert Distance: 2.0 KM
```

---

## 🔑 Key JavaScript Functions

### LocationTracker
```javascript
locationTracker.startTracking()      // Start GPS tracking
locationTracker.stopTracking()       // Stop GPS tracking
locationTracker.checkAlarmCondition() // Check if alarm needed
```

### DistanceCalculator
```javascript
DistanceCalculator.haversine(lat1, lon1, lat2, lon2)
DistanceCalculator.isWithinDistance(lat1, lon1, lat2, lon2, km)
```

### AlarmSystem
```javascript
alarmSystem.playAlarmSound()         // Play alarm
alarmSystem.startCountdown()         // Start 30-sec countdown
alarmSystem.stopAlarm()              // Stop and return
alarmSystem.triggerEmergencyAlert()  // Show emergency page
```

---

## 🛣️ API Endpoints

### GET `/api/get-destination`
Get saved destination and alert distance
```json
{ "lat": 19.0760, "lon": 72.8884, "alert_distance": 1.5 }
```

### POST `/api/save-journey`
Save new destination
```json
{ "lat": 19.0760, "lon": 72.8884, "alert_distance": 1.5 }
```

### POST `/api/log-alarm-triggered`
Log alarm event

### POST `/api/emergency-alert`
Trigger emergency

### POST `/api/reset-journey`
Clear all data

---

## 📱 Navigation Flow

```
Home (/)
  ↓
Journey Setup (/home)
  ↓
Destination Setup (/set-destination)
  ↓
Tracking (/tracking)
  ↓
Alarm (/alarm) [if distance ≤ alert]
  ↓
Emergency (/emergency) [after 30 seconds]
```

---

## 🎨 CSS Variables (Theming)

Edit in `static/css/style.css`:

```css
:root {
    --primary-color: #00d4ff;      /* Cyan */
    --secondary-color: #6c5ce7;    /* Purple */
    --danger-color: #ff6b6b;       /* Red */
    --success-color: #26de81;      /* Green */
    --warning-color: #ffa502;      /* Orange */
    --dark-bg: #0f1419;            /* Main background */
    --darker-bg: #0a0e13;          /* Darker background */
    --card-bg: #1a2332;            /* Card background */
}
```

---

## 🔧 Common Customizations

### Change Alarm Sound Frequency
File: `static/js/alarm.js` Line ~110
```javascript
oscillator.frequency.value = 800;  // Hz (higher = higher pitch)
```

### Adjust Countdown Timer
File: `static/js/alarm.js` Line ~10
```javascript
this.countdownTime = 30;  // seconds
```

### Change GPS Update Interval
File: `static/js/location.js` Line ~11
```javascript
this.checkInterval = 1000;  // milliseconds
```

### Modify Alert Trigger Tolerance
File: `static/js/location.js` Line ~90
```javascript
if (distance <= this.alertDistance) {  // Can add tolerance here
    this.triggerAlarm();
}
```

---

## 📊 Haversine Formula (Technical)

Used for accurate distance calculation:

```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
c = 2 × atan2(√a, √(1-a))
d = R × c

where:
  Δlat = lat2 - lat1 (latitude difference)
  Δlon = lon2 - lon1 (longitude difference)
  R = 6371 km (Earth's radius)
  d = distance in kilometers
```

---

## 🐛 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| "Location not available" | Use Chrome, grant permission |
| "Geolocation not supported" | Use modern browser |
| "Port 5000 in use" | Change to `port=5001` in app.py |
| "No alarm sound" | Check volume, browser settings |
| "Coordinates not saved" | Clear browser cache, allow cookies |
| "Mobile not working" | Use phone's actual GPS, not mock |

---

## 📂 File Size Reference

| File | Size |
|------|------|
| app.py | ~8 KB |
| style.css | ~25 KB |
| alarm.css | ~15 KB |
| responsive.css | ~12 KB |
| location.js | ~7 KB |
| distance.js | ~5 KB |
| alarm.js | ~6 KB |
| HTML files | ~15 KB total |

---

## ✅ Pre-Demo Checklist

- [ ] `pip install -r requirements.txt` completed
- [ ] `python app.py` running
- [ ] Browser opens http://localhost:5000
- [ ] Can set destination
- [ ] GPS tracking works
- [ ] Alarm triggers
- [ ] Emergency page displays
- [ ] Responsive on mobile

---

## 📞 Emergency Contact JSON Format

```json
{
  "emergency_contacts": [
    {
      "name": "Contact Name",
      "phone": "+91-XXXXXXXXXX",
      "email": "email@example.com"
    }
  ]
}
```

---

## 🌐 Browser Feature Requirements

- ✅ Geolocation API
- ✅ Web Audio API
- ✅ localStorage API
- ✅ Fetch API
- ✅ CSS Grid & Flexbox
- ✅ ES6 Classes

All supported in modern browsers!

---

## 📚 Key Files to Know

| File | Purpose | Edit For |
|------|---------|----------|
| `app.py` | Backend routing | API changes |
| `templates/*.html` | Pages | Layout changes |
| `static/css/style.css` | Main styling | Color/theme |
| `static/js/location.js` | GPS tracking | Tracking logic |
| `static/js/distance.js` | Distance calc | Algorithm |
| `static/js/alarm.js` | Alarm system | Alarm behavior |
| `data/contacts.json` | Emergency data | Contact info |

---

## 🎯 User Workflow

1. **Enter destination** → `POST /api/save-journey`
2. **Grant location** → GPS tracking starts
3. **Get updates** → JavaScript calculates distance
4. **Distance ≤ alert?** → Auto-redirect to alarm
5. **Click button?** → Stop and return to setup
6. **Wait 30s?** → Emergency page with contacts

---

## 💡 Pro Tips

1. **Test on Mobile**: Use your phone for real GPS
2. **Use Real Coordinates**: Google Maps → Right-click → Copy
3. **Check Accuracy**: Wait 10 seconds for GPS lock
4. **Add Alarm Sound**: Download from Pixabay or Freesound
5. **Customize Colors**: Edit `:root` in style.css
6. **Deploy for Free**: Use Heroku or PythonAnywhere

---

## 🚨 Important Security Notes

**DEVELOPMENT**:
- ✅ debug=True (development only)
- ✅ Simple secret key (okay for testing)
- ✅ No HTTPS needed (localhost)

**PRODUCTION**:
- 🔒 Change secret key in app.py
- 🔒 Set debug=False
- 🔒 Use HTTPS/SSL certificate
- 🔒 Add environment variables
- 🔒 Implement proper error handling

---

## 📞 Default Emergency Contact

Edit `data/contacts.json`:
```json
{
  "name": "Mom",
  "phone": "+91-XXXXXXXXXX",
  "email": "mom@email.com"
}
```

---

## 🎓 Teaching Points

Great for explaining:
- 📍 GPS/Geolocation technology
- 📏 Haversine formula (math + programming)
- 🌐 Web APIs (browser native)
- 🏗️ Full-stack architecture
- 📱 Responsive design
- ⚙️ Backend routing (Flask)
- 🎨 UI/UX principles
- 🔊 Web Audio API

---

**Questions?** Check README.md for detailed documentation!

**Ready?** Run `python app.py` and open http://localhost:5000 🚀
