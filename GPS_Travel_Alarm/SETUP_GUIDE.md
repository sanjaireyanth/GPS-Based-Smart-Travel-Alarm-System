# GPS Smart Travel Alarm System - Setup Guide

## ⚡ Quick Setup (5 Minutes)

### Step 1: Install Python Packages
```bash
cd GPS_Travel_Alarm
pip install -r requirements.txt
```

### Step 2: Run Flask Server
```bash
python app.py
```

You should see:
```
WARNING in app.run(): This is a development server...
Running on http://127.0.0.1:5000
```

### Step 3: Open Browser
Go to: **http://localhost:5000**

## 🧪 Testing the Application

### Test Journey Setup
1. Click "Start Journey"
2. Use these test coordinates:
   - **Latitude**: 19.0760 (Mumbai)
   - **Longitude**: 72.8884
   - **Alert Distance**: 0.5 KM
3. Click "Continue to Tracking"

### Test on Mobile
1. Run server: `python app.py`
2. Find your computer's IP: 
   - Windows: `ipconfig` (look for IPv4)
   - Mac/Linux: `ifconfig` (look for inet)
3. On mobile, open: `http://YOUR_IP:5000`
4. Grant location permission when asked

### Test Alarm (Without Traveling)
1. After you're in tracking page, quickly stop the Flask server
2. Manually change coordinates in browser console:
   ```javascript
   localStorage.setItem('lastAlarmLocation', 
     JSON.stringify({lat: 19.0760, lon: 72.8884}));
   ```
3. Go to `/alarm` manually
4. Test the alarm and emergency alert

## 📝 File Descriptions

| File | Purpose |
|------|---------|
| **app.py** | Flask backend with routes and API endpoints |
| **requirements.txt** | Python dependencies (Flask, Werkzeug) |
| **templates/index.html** | Landing page with features overview |
| **templates/home.html** | Journey setup form |
| **templates/tracking.html** | Live GPS tracking page |
| **templates/alarm.html** | Alarm alert screen |
| **templates/emergency.html** | Emergency contact page |
| **static/css/style.css** | Main dark theme styling |
| **static/css/alarm.css** | Alarm & emergency styles |
| **static/css/responsive.css** | Mobile responsive design |
| **static/js/location.js** | GPS tracking functionality |
| **static/js/distance.js** | Haversine distance calculator |
| **static/js/alarm.js** | Alarm sound & countdown |
| **data/contacts.json** | Emergency contact configuration |

## 🎯 Key Features Implemented

✅ **Geolocation API** - Browser-based GPS tracking
✅ **Haversine Formula** - Accurate distance calculation
✅ **Real-time Updates** - Location updates every 1 second
✅ **Alarm System** - Loud alarm with 30-second countdown
✅ **Emergency Alert** - Contact notification system
✅ **Dark Theme** - Modern, stylish UI with dark background
✅ **Mobile Responsive** - Works on all devices
✅ **Session Management** - Flask sessions for data persistence
✅ **No External APIs** - Completely self-contained

## 🔐 Security Notes

For **Production Deployment**:

1. Change secret key in `app.py`:
```python
app.secret_key = 'your-new-secret-key-here'  # Line 11
```

2. Set debug to False:
```python
app.run(debug=False)  # Change debug=True to False
```

3. Use HTTPS certificate (required for Geolocation on production)

4. Implement actual email/SMS for emergency alerts

## 🎨 Customization Ideas

### Change Theme Color
Edit `static/css/style.css` (Line 10-13):
```css
--primary-color: #00d4ff;      /* Cyan - change this */
--secondary-color: #6c5ce7;    /* Purple - change this */
--danger-color: #ff6b6b;       /* Red - change this */
```

### Adjust Countdown Timer
Edit `static/js/alarm.js` (Line 10):
```javascript
this.countdownTime = 30;  // Change from 30 to any number
```

### Change Alarm Sound Frequency
Edit `static/js/alarm.js` (Line 110):
```javascript
oscillator.frequency.value = 800;  // Higher = higher pitch
```

### Add More Emergency Contacts
Edit `data/contacts.json`:
```json
{
  "name": "Friend Name",
  "phone": "+91-XXXXXXXXXX",
  "email": "friend@email.com"
}
```

## 📊 Testing Checklist

- [ ] Landing page loads
- [ ] Can enter destination coordinates
- [ ] Can set alert distance
- [ ] Tracking page shows GPS location
- [ ] Distance calculation is accurate
- [ ] Alarm triggers when within alert distance
- [ ] Alarm stops when button clicked
- [ ] Emergency alert after 30 seconds
- [ ] Emergency contacts are displayed
- [ ] Mobile view is responsive
- [ ] Dark theme is applied throughout

## 🆘 Common Issues

**Issue**: "Geolocation not available"
- Solution: Use Chrome/Firefox, not Internet Explorer

**Issue**: "Server won't start"
- Solution: Port 5000 might be in use. Change in app.py: `port=5001`

**Issue**: "Location not updating"
- Solution: Check browser location permissions in settings

**Issue**: "Alarm doesn't play"
- Solution: Check volume and browser audio settings

## 📱 Demo Routes

Ready-to-use test coordinates:

**Route 1: Mumbai to Pune**
- Source: 19.0760, 72.8884
- Destination: 18.5204, 73.8567
- Distance: 149 KM

**Route 2: Delhi to Agra**
- Source: 28.7041, 77.1025
- Destination: 27.1767, 78.0081
- Distance: 206 KM

**Route 3: Bangalore to Hyderabad**
- Source: 12.9716, 77.5946
- Destination: 17.3850, 78.4867
- Distance: 575 KM

---

**Happy coding! 🚀**
