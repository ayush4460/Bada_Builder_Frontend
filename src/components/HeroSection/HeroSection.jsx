import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './HeroSection.css';
import { useNavigate, useLocation } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();
  const locationState = useLocation();

  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bhkType, setBhkType] = useState('');
  const [possession, setPossession] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check for success message from booking redirect
  useEffect(() => {
    if (locationState.state?.successMessage) {
      setShowSuccessMessage(true);
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }
  }, [locationState]);

  // Check if BHK type should be shown
  const showBhkType = ['Flat', 'House', 'Villa'].includes(propertyType);

  // Handle property type change
  const handlePropertyTypeChange = (e) => {
    const newType = e.target.value;
    setPropertyType(newType);
    // Reset BHK if property type doesn't support it
    if (!['Flat', 'House', 'Villa'].includes(newType)) {
      setBhkType('');
    }
  };

  const handleSearch = () => {
    // Build search query parameters
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (propertyType) params.append('type', propertyType);
    // Only add BHK if it's applicable for the property type
    if (bhkType && showBhkType) params.append('bhk', bhkType);
    if (possession) params.append('possession', possession);
    
    // Navigate to search results page
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="hero-section">
      {/* Success Message from Booking */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">✓</span>
            <span>{locationState.state?.successMessage}</span>
            <button 
              onClick={() => setShowSuccessMessage(false)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
      
      <div className="hero-content">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Find Your Dream Property
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Search from a wide range of properties across India
        </motion.p>
        <motion.div 
          className="search-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Location Input with Datalist - User can type or select */}
          <input 
            type="text" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)} 
            className="search-input"
            placeholder="Enter or Select Location"
            list="location-suggestions"
          />
          <datalist id="location-suggestions">
            <option value="PAN India" />
            <option value="Mumbai" />
            <option value="Delhi" />
            <option value="Bangalore" />
            <option value="Hyderabad" />
            <option value="Ahmedabad" />
            <option value="Chennai" />
            <option value="Kolkata" />
            <option value="Pune" />
            <option value="Vadodara" />
            <option value="Surat" />
            <option value="Rajkot" />
            <option value="Gandhinagar" />
            <option value="Bhavnagar" />
            <option value="Jamnagar" />
            <option value="Anand" />
            <option value="Navi Mumbai" />
            <option value="Thane" />
            <option value="Nagpur" />
            <option value="Nashik" />
            <option value="Aurangabad" />
            <option value="Mysore" />
            <option value="Mangalore" />
            <option value="Hubli" />
            <option value="Coimbatore" />
            <option value="Madurai" />
            <option value="Tiruchirappalli" />
            <option value="Warangal" />
            <option value="Nizamabad" />
            <option value="Visakhapatnam" />
            <option value="Vijayawada" />
            <option value="Guntur" />
            <option value="Kochi" />
            <option value="Thiruvananthapuram" />
            <option value="Kozhikode" />
            <option value="Howrah" />
            <option value="Durgapur" />
            <option value="Siliguri" />
            <option value="Jaipur" />
            <option value="Jodhpur" />
            <option value="Udaipur" />
            <option value="Kota" />
            <option value="Indore" />
            <option value="Bhopal" />
            <option value="Jabalpur" />
            <option value="Gwalior" />
            <option value="Noida" />
            <option value="Ghaziabad" />
            <option value="Lucknow" />
            <option value="Kanpur" />
            <option value="Agra" />
            <option value="Varanasi" />
            <option value="Chandigarh" />
            <option value="Ludhiana" />
            <option value="Amritsar" />
            <option value="Jalandhar" />
            <option value="Gurgaon" />
            <option value="Faridabad" />
            <option value="Panipat" />
            <option value="Patna" />
            <option value="Gaya" />
            <option value="Bhubaneswar" />
            <option value="Cuttack" />
            <option value="Ranchi" />
            <option value="Jamshedpur" />
            <option value="Raipur" />
            <option value="Bhilai" />
            <option value="Dehradun" />
            <option value="Haridwar" />
            <option value="Panaji" />
            <option value="Margao" />
          </datalist>

          {/* Property Type */}
          <select value={propertyType} onChange={handlePropertyTypeChange} className="search-select">
            <option value="">Property Type</option>
            <option value="Flat">Flat/Apartment</option>
            <option value="House">Independent House</option>
            <option value="Villa">Villa</option>
            <option value="Plot">Plot/Land</option>
            <option value="Commercial">Commercial Space</option>
            <option value="Shop">Shop</option>
            <option value="Office">Office Space</option>
            <option value="Warehouse">Warehouse</option>
            <option value="Showroom">Showroom</option>
          </select>

          {/* BHK Type - Only show for Flat, House, Villa */}
          {showBhkType && (
            <motion.select 
              value={bhkType} 
              onChange={(e) => setBhkType(e.target.value)} 
              className="search-select"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
            >
              <option value="">BHK Type</option>
              <option value="1RK">1 RK</option>
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
              <option value="4BHK">4 BHK</option>
              <option value="5BHK">5 BHK</option>
              <option value="6BHK">6+ BHK</option>
            </motion.select>
          )}

          {/* Possession Status */}
          <select value={possession} onChange={(e) => setPossession(e.target.value)} className="search-select">
            <option value="">Possession Status</option>
            <option value="Just Launched">Just Launched</option>
            <option value="Under Construction">Under Construction</option>
            <option value="Ready to Move">Ready to Move</option>
          </select>

          <button onClick={handleSearch} className="search-button">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
