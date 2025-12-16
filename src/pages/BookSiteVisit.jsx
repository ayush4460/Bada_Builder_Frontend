// src/pages/BookSiteVisit.jsx
import { useState, useEffect, useRef } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './BookSiteVisit.css';

const BookSiteVisit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const property = location.state?.property;

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    people: 1,
    person1: '',
    person2: '',
    person3: '',
    address: '',
    paymentMethod: 'postvisit',
  });

  const [loading, setLoading] = useState(false);
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const mapSearchInputRef = useRef(null);
  const mapSearchAutocompleteRef = useRef(null);

  // Set date restrictions (today to 30 days from now, excluding Sundays)
  useEffect(() => {
    const today = new Date();
    const maxBookingDate = new Date();
    maxBookingDate.setDate(today.getDate() + 30);

    setMinDate(today.toISOString().split('T')[0]);
    setMaxDate(maxBookingDate.toISOString().split('T')[0]);
  }, []);

  // Initialize Google Maps and Places Autocomplete
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocomplete();
      } else {
        // Load Google Maps API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeAutocomplete;
        document.head.appendChild(script);
      }
    };

    const initializeAutocomplete = () => {
      if (addressInputRef.current && window.google) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: 'IN' }, // Restrict to India
            fields: ['formatted_address', 'geometry', 'name']
          }
        );

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          if (place.formatted_address) {
            setFormData(prev => ({ ...prev, address: place.formatted_address }));
            setSelectedLocation({
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address
            });
          }
        });
      }
    };

    loadGoogleMaps();
  }, []);

  // Initialize Google Maps for location picker
  const initializeMap = () => {
    if (window.google && mapRef.current) {
      const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // Delhi as default
      
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: selectedLocation || defaultLocation,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Add marker
      const marker = new window.google.maps.Marker({
        position: selectedLocation || defaultLocation,
        map: mapInstanceRef.current,
        draggable: true,
        title: 'Pickup Location',
        animation: window.google.maps.Animation.DROP
      });

      // Update location when marker is dragged
      marker.addListener('dragend', () => {
        const position = marker.getPosition();
        reverseGeocode(position, marker);
      });

      // Update location when map is clicked
      mapInstanceRef.current.addListener('click', (event) => {
        const position = event.latLng;
        marker.setPosition(position);
        reverseGeocode(position, marker);
      });

      // Initialize search autocomplete for map modal
      if (mapSearchInputRef.current) {
        mapSearchAutocompleteRef.current = new window.google.maps.places.Autocomplete(
          mapSearchInputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: 'IN' },
            fields: ['formatted_address', 'geometry', 'name']
          }
        );

        mapSearchAutocompleteRef.current.addListener('place_changed', () => {
          const place = mapSearchAutocompleteRef.current.getPlace();
          if (place.geometry) {
            const location = place.geometry.location;
            mapInstanceRef.current.setCenter(location);
            mapInstanceRef.current.setZoom(16);
            marker.setPosition(location);
            
            setSelectedLocation({
              lat: location.lat(),
              lng: location.lng(),
              address: place.formatted_address
            });
            setMapSearchQuery(place.formatted_address);
          }
        });
      }
    }
  };

  // Reverse geocode function
  const reverseGeocode = (position, marker) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: position }, (results, status) => {
      if (status === 'OK' && results[0]) {
        setSelectedLocation({
          lat: position.lat(),
          lng: position.lng(),
          address: results[0].formatted_address
        });
      }
    });
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // Update map center and marker
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(userLocation);
            mapInstanceRef.current.setZoom(16);
            
            // Find marker and update position
            const marker = new window.google.maps.Marker({
              position: userLocation,
              map: mapInstanceRef.current,
              draggable: true,
              title: 'Your Current Location',
              animation: window.google.maps.Animation.BOUNCE
            });
            
            // Stop bouncing after 2 seconds
            setTimeout(() => {
              marker.setAnimation(null);
            }, 2000);
            
            // Reverse geocode to get address
            reverseGeocode(userLocation, marker);
            
            // Add event listeners to new marker
            marker.addListener('dragend', () => {
              const position = marker.getPosition();
              reverseGeocode(position, marker);
            });
          }
          
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          let errorMessage = 'Unable to get your location. ';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please allow location access and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
              break;
          }
          
          alert(errorMessage);
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setLocationLoading(false);
    }
  };

  // Check if selected date is a Sunday
  const isSunday = (dateString) => {
    const date = new Date(dateString);
    return date.getDay() === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Check if selected date is Sunday
    if (name === 'date' && isSunday(value)) {
      alert('Site visits are not available on Sundays. Please select another date.');
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handlePaymentMethodChange = (e) => {
    setFormData({ ...formData, paymentMethod: e.target.value });
  };

  const handleOpenMapModal = () => {
    setShowMapModal(true);
    // Load Google Maps if not already loaded
    setTimeout(() => {
      if (window.google) {
        initializeMap();
      } else {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
      }
    }, 100);
  };

  const handleMapLocationConfirm = () => {
    if (selectedLocation) {
      setFormData(prev => ({ ...prev, address: selectedLocation.address }));
      setShowMapModal(false);
    }
  };

  const handleMapModalClose = () => {
    setShowMapModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Please login to book a site visit');
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      // Save booking to Firestore
      const bookingData = {
        property_id: property?.id || 'unknown',
        property_title: property?.title || 'Unknown Property',
        user_id: currentUser.uid,
        user_email: currentUser.email,
        visit_date: formData.date,
        visit_time: formData.time,
        number_of_people: formData.people,
        person1_name: formData.person1,
        person2_name: formData.person2 || null,
        person3_name: formData.person3 || null,
        pickup_address: formData.address,
        pickup_coordinates: selectedLocation ? {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng
        } : null,
        payment_method: formData.paymentMethod,
        created_at: new Date().toISOString(),
        status: 'pending'
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      
      // Add booking ID to data
      bookingData.booking_id = docRef.id;
      bookingData.property_location = property?.location || 'N/A';

      // Send email and SMS notifications to admin
      try {
        const response = await fetch('http://localhost:3002/api/notify-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Notifications sent to admin successfully');
        } else {
          console.warn('⚠️ Notification sending failed:', result.error);
        }
      } catch (notificationError) {
        console.error('❌ Error sending notifications:', notificationError);
        // Continue even if notification fails
      }

      alert('Your site visit has been booked successfully!\n\nYou will receive a confirmation shortly.');
      navigate('/');
    } catch (error) {
      console.error('Error booking site visit:', error);
      alert('Failed to book site visit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-visit-container">
      <div className="form-section ui-bg">
        <h2>Book a Site Visit</h2>
        <form onSubmit={handleSubmit}>
          <div className="date-time-section">
            <h4>📅 Select Date & Time</h4>
            <label>
              Visit Date:
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange} 
                min={minDate}
                max={maxDate}
                required 
                className="enhanced-date-input"
              />
              <small className="date-help">Available Monday to Saturday (No Sundays)</small>
            </label>
            <label>
              Visit Time:
              <select name="time" value={formData.time} onChange={handleChange} required className="time-select">
                <option value="">Select time slot</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="12:30">12:30 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="13:30">1:30 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="14:30">2:30 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="15:30">3:30 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="16:30">4:30 PM</option>
                <option value="17:00">5:00 PM</option>
              </select>
              <small className="time-help">Available slots: 10:00 AM - 5:00 PM</small>
            </label>
          </div>
          <label>
            Number of People (Max 3):
            <select name="people" value={formData.people} onChange={handleChange} required>
              <option value="1">1 Person</option>
              <option value="2">2 People</option>
              <option value="3">3 People</option>
            </select>
          </label>

          <div className="people-details">
            <h4>👥 Visitor Details</h4>
            <label>
              1st Person Name: *
              <input 
                type="text" 
                name="person1" 
                value={formData.person1} 
                onChange={handleChange} 
                placeholder="Enter first person's name"
                required 
              />
            </label>
            {formData.people >= 2 && (
              <label className="additional-person">
                2nd Person Name: {parseInt(formData.people) >= 2 ? '*' : ''}
                <input 
                  type="text" 
                  name="person2" 
                  value={formData.person2} 
                  onChange={handleChange}
                  placeholder="Enter second person's name"
                  required={parseInt(formData.people) >= 2}
                />
              </label>
            )}
            {formData.people == 3 && (
              <label className="additional-person">
                3rd Person Name: *
                <input 
                  type="text" 
                  name="person3" 
                  value={formData.person3} 
                  onChange={handleChange}
                  placeholder="Enter third person's name"
                  required
                />
              </label>
            )}
          </div>
          <div className="pickup-section">
            <h4>📍 Pickup Location</h4>
            
            {/* Enhanced Address Input with Google Maps Integration */}
            <div className="address-input-container">
              <label>
                Pickup Address:
                <div className="address-input-wrapper">
                  <input
                    ref={addressInputRef}
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your pickup address or use Google Maps..."
                    required
                    className="address-input-with-maps"
                  />
                  <button
                    type="button"
                    className="maps-button"
                    onClick={handleOpenMapModal}
                    title="Select from Google Maps"
                  >
                    🗺️
                  </button>
                </div>
                <small className="address-help">
                  Type your address or click the map icon to select from Google Maps
                </small>
              </label>
            </div>
          </div>

          {/* Google Maps Modal */}
          {showMapModal && (
            <div className="map-modal-overlay" onClick={handleMapModalClose}>
              <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="map-modal-header">
                  <h3>📍 Select Pickup Location</h3>
                  <button className="map-modal-close" onClick={handleMapModalClose}>
                    ✕
                  </button>
                </div>
                
                {/* Map Controls */}
                <div className="map-controls">
                  <div className="location-options">
                    <button
                      type="button"
                      className="current-location-btn"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                    >
                      {locationLoading ? (
                        <>
                          <span className="location-spinner"></span>
                          Getting Location...
                        </>
                      ) : (
                        <>
                          📍 Use My Current Location
                        </>
                      )}
                    </button>
                    
                    <div className="search-location">
                      <input
                        ref={mapSearchInputRef}
                        type="text"
                        placeholder="Search for a location..."
                        value={mapSearchQuery}
                        onChange={(e) => setMapSearchQuery(e.target.value)}
                        className="map-search-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="map-container">
                  <div ref={mapRef} className="google-map"></div>
                </div>
                
                <div className="map-modal-footer">
                  <div className="selected-location-info">
                    {selectedLocation ? (
                      <div>
                        <strong>Selected Address:</strong>
                        <p>{selectedLocation.address}</p>
                        <small className="coordinates-info">
                          📍 Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                        </small>
                      </div>
                    ) : (
                      <div className="location-instructions">
                        <p><strong>How to select your location:</strong></p>
                        <ul>
                          <li>🎯 Click "Use My Current Location" for automatic detection</li>
                          <li>🔍 Search for an address in the search box above</li>
                          <li>📍 Click anywhere on the map to place a marker</li>
                          <li>🖱️ Drag the marker to fine-tune the location</li>
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="map-modal-actions">
                    <button
                      type="button"
                      className="confirm-location-btn"
                      onClick={handleMapLocationConfirm}
                      disabled={!selectedLocation}
                    >
                      ✓ Confirm Location
                    </button>
                    <button
                      type="button"
                      className="cancel-location-btn"
                      onClick={handleMapModalClose}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="visit-duration">
            <strong>Hours of Visit & Charges:</strong>
            <div className="duration-box">
              1 Hour - ₹300
            </div>
            <p>Additional charges: ₹5 per minute</p>
          </div>
          <div className="payment-method">
            <strong>Payment Method:</strong>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="previsit"
                checked={formData.paymentMethod === 'previsit'}
                onChange={handlePaymentMethodChange}
              />
              Previsit
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="postvisit"
                checked={formData.paymentMethod === 'postvisit'}
                onChange={handlePaymentMethodChange}
              />
              Postvisit
            </label>
          </div>
          {formData.paymentMethod === 'previsit' && (
            <div className="gpay-section">
              <p>Please scan the QR code below to complete your payment:</p>
              <img src="/images/gpay-qr.png" alt="GPay QR Code" className="qr-code" />
            </div>
          )}
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Booking...' : 'Book'}
            </button>
            <button type="button" onClick={() => alert('Reschedule functionality coming soon!')}>Reschedule</button>
            <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
      <div className="info-section ui-bg">
        <h3>Note:</h3>
        <p>
          After booking a site visit, a car will pick you up from your address, take you to the site, and drop you back at your address.
        </p>
        <p>
          If you decide to purchase the property, the visit charges will be refunded.
        </p>
      </div>
    </div>
  );
};

export default BookSiteVisit;