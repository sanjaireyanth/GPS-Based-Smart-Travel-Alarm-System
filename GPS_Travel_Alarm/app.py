"""
Author: Sanjai Reyanth
Project: GPS Based Smart Travel Alarm System
License: MIT

GPS Based Smart Travel Alarm System - Enhanced Backend
Flask backend with modern routing, API integration, and session management
Uses Nominatim (free) for place name to coordinates conversion
"""

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import json
import os
from datetime import datetime
import requests
from urllib.parse import quote

app = Flask(__name__)
app.secret_key = 'gps-alarm-system-2026-secure-key'

# Nominatim API (free, open-source geocoding)
NOMINATIM_API = 'https://nominatim.openstreetmap.org/search'

# ==================== HELPER FUNCTIONS ====================

def geocode_place(place_name):
    """Convert place name to coordinates using Nominatim (free)"""
    try:
        params = {
            'q': place_name,
            'format': 'json',
            'limit': 1,
            'timeout': 10
        }
        headers = {'User-Agent': 'GPSAlarmSystem/1.0'}
        response = requests.get(NOMINATIM_API, params=params, headers=headers, timeout=10)
        
        if response.status_code == 200 and response.json():
            result = response.json()[0]
            return {
                'lat': float(result['lat']),
                'lon': float(result['lon']),
                'display_name': result.get('display_name', place_name)
            }
        return None
    except Exception as e:
        print(f"Geocoding error: {e}")
        return None


def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in KM"""
    from math import radians, sin, cos, sqrt, atan2
    
    R = 6371  # Earth's radius in kilometers
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    return R * c


# ==================== MAIN ROUTES ====================

@app.route('/')
def index():
    """Landing page"""
    return render_template('index.html')


@app.route('/home')
def home():
    """Home page"""
    return render_template('home.html')


@app.route('/route-selection')
def route_selection():
    """Route selection page"""
    return render_template('route_selection.html')


@app.route('/alarm-setup')
def alarm_setup():
    """Alarm setup page"""
    if 'route_data' not in session:
        return redirect(url_for('route_selection'))
    return render_template('alarm_setup.html', route_data=session['route_data'])


@app.route('/tracking')
def tracking():
    """Live tracking page"""
    if 'journey' not in session:
        return redirect(url_for('alarm_setup'))
    return render_template('tracking.html')


@app.route('/alarm')
def alarm():
    """Alarm screen"""
    if 'journey' not in session:
        return redirect(url_for('home'))
    return render_template('alarm.html')


@app.route('/emergency')
def emergency():
    """Emergency alert screen"""
    return render_template('emergency.html')


# ==================== API ENDPOINTS ====================

@app.route('/api/geocode', methods=['POST'])
def api_geocode():
    """Geocode place names to coordinates"""
    try:
        data = request.get_json()
        source_place = data.get('source')
        destination_place = data.get('destination')
        
        if not source_place or not destination_place:
            return jsonify({'success': False, 'error': 'Missing place names'}), 400
        
        # Geocode source
        source_coords = geocode_place(source_place)
        if not source_coords:
            return jsonify({'success': False, 'error': f'Could not find source: {source_place}'}), 400
        
        # Geocode destination
        destination_coords = geocode_place(destination_place)
        if not destination_coords:
            return jsonify({'success': False, 'error': f'Could not find destination: {destination_place}'}), 400
        
        # Calculate distance
        distance = haversine_distance(
            source_coords['lat'], source_coords['lon'],
            destination_coords['lat'], destination_coords['lon']
        )
        
        # Store in session
        session['route_data'] = {
            'source': source_place,
            'source_coords': source_coords,
            'destination': destination_place,
            'destination_coords': destination_coords,
            'total_distance': round(distance, 2)
        }
        
        return jsonify({
            'success': True,
            'route': {
                'source': source_place,
                'destination': destination_place,
                'total_distance': round(distance, 2),
                'source_display': source_coords['display_name'],
                'destination_display': destination_coords['display_name']
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/setup-alarm', methods=['POST'])
def api_setup_alarm():
    """Setup alarm with user-defined distance before destination"""
    try:
        data = request.get_json()
        alarm_distance = float(data.get('alarm_distance'))
        
        if 'route_data' not in session:
            return jsonify({'success': False, 'error': 'No route data'}), 400
        
        route = session['route_data']
        
        session['journey'] = {
            'source': route['source'],
            'source_coords': route['source_coords'],
            'destination': route['destination'],
            'destination_coords': route['destination_coords'],
            'total_distance': route['total_distance'],
            'alarm_distance_before': alarm_distance,
            'started_at': datetime.now().isoformat(),
            'alarm_triggered': False,
            'emergency_triggered': False
        }
        
        return jsonify({'success': True, 'message': 'Journey initialized'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/get-journey', methods=['GET'])
def api_get_journey():
    """Get current journey data"""
    if 'journey' not in session:
        return jsonify({'error': 'No active journey'}), 400
    
    return jsonify(session['journey'])


@app.route('/api/update-location', methods=['POST'])
def api_update_location():
    """Update current location and check if alarm should trigger"""
    try:
        data = request.get_json()
        current_lat = float(data.get('lat'))
        current_lon = float(data.get('lon'))
        
        if 'journey' not in session:
            return jsonify({'success': False, 'error': 'No active journey'}), 400
        
        journey = session['journey']
        dest_coords = journey['destination_coords']
        
        # Calculate distance to destination
        distance_to_dest = haversine_distance(
            current_lat, current_lon,
            dest_coords['lat'], dest_coords['lon']
        )
        
        # Check if alarm should trigger
        should_alarm = distance_to_dest <= journey['alarm_distance_before']
        
        return jsonify({
            'success': True,
            'distance_to_destination': round(distance_to_dest, 2),
            'alarm_distance_before': journey['alarm_distance_before'],
            'should_alarm': should_alarm
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/trigger-alarm', methods=['POST'])
def api_trigger_alarm():
    """Log alarm trigger"""
    try:
        if 'journey' in session:
            session['journey']['alarm_triggered'] = True
            session.modified = True
        
        return jsonify({'success': True, 'message': 'Alarm triggered'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/trigger-emergency', methods=['POST'])
def api_trigger_emergency():
    """Log emergency trigger"""
    try:
        if 'journey' in session:
            session['journey']['emergency_triggered'] = True
            session.modified = True
        
        return jsonify({'success': True, 'message': 'Emergency triggered'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/reset', methods=['POST'])
def api_reset():
    """Reset journey"""
    session.clear()
    return jsonify({'success': True, 'message': 'System reset'})


# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return render_template('index.html'), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Server error'}), 500


if __name__ == '__main__':
    os.makedirs('data', exist_ok=True)
    app.run(debug=True, host='127.0.0.1', port=5000)
