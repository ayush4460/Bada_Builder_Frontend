import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './LeadModal.css';

const LeadModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    requirementType: '',
    bhkType: '',
    location: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.requirementType || !formData.bhkType || !formData.location || !formData.phone) {
      setError('All fields are required');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be 10 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save to Firestore
      await addDoc(collection(db, 'leads'), {
        name: formData.name,
        requirement_type: formData.requirementType,
        bhk_type: formData.bhkType,
        location: formData.location,
        phone: formData.phone,
        created_at: new Date().toISOString()
      });

      console.log('✅ Lead saved successfully:', formData);
      setSuccess(true);
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        setFormData({ name: '', requirementType: '', bhkType: '', location: '', phone: '' });
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('❌ Error saving lead:', err);
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="lead-modal-overlay" 
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="lead-modal-content" 
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <button className="lead-modal-close" onClick={onClose}>&times;</button>
          
          {success ? (
            <motion.div 
              className="success-message"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <div className="success-icon">✓</div>
              <h2>Thank You!</h2>
              <p>We'll contact you soon</p>
            </motion.div>
          ) : (
            <>
              <h2 className="lead-modal-title">Find Your Dream Property</h2>
              <p className="lead-modal-subtitle">Tell us what you're looking for</p>

              <form onSubmit={handleSubmit} className="lead-modal-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="requirementType">Property Type *</label>
            <select
              id="requirementType"
              name="requirementType"
              value={formData.requirementType}
              onChange={handleChange}
              required
            >
              <option value="">Select property type</option>
              <option value="Flat">Flat</option>
              <option value="House">House</option>
              <option value="Villa">Villa</option>
              <option value="Plot">Plot</option>
              <option value="Commercial">Commercial</option>
              <option value="Shop">Shop</option>
              <option value="Office">Office</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Showroom">Showroom</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bhkType">BHK Type *</label>
            <select
              id="bhkType"
              name="bhkType"
              value={formData.bhkType}
              onChange={handleChange}
              required
            >
              <option value="">Select BHK type</option>
              <option value="1RK">1 RK</option>
              <option value="1BHK">1 BHK</option>
              <option value="2BHK">2 BHK</option>
              <option value="3BHK">3 BHK</option>
              <option value="4BHK">4 BHK</option>
              <option value="5BHK">5 BHK</option>
              <option value="6+BHK">6+ BHK</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter city or location"
              list="location-suggestions"
              required
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
              <option value="Jaipur" />
              <option value="Surat" />
              <option value="Lucknow" />
              <option value="Kanpur" />
              <option value="Nagpur" />
              <option value="Indore" />
              <option value="Thane" />
              <option value="Bhopal" />
              <option value="Visakhapatnam" />
              <option value="Pimpri-Chinchwad" />
              <option value="Patna" />
              <option value="Vadodara" />
              <option value="Ghaziabad" />
              <option value="Ludhiana" />
              <option value="Agra" />
              <option value="Nashik" />
              <option value="Faridabad" />
              <option value="Meerut" />
              <option value="Rajkot" />
              <option value="Kalyan-Dombivali" />
              <option value="Vasai-Virar" />
              <option value="Varanasi" />
              <option value="Srinagar" />
              <option value="Aurangabad" />
              <option value="Dhanbad" />
              <option value="Amritsar" />
              <option value="Navi Mumbai" />
              <option value="Allahabad" />
              <option value="Ranchi" />
              <option value="Howrah" />
              <option value="Coimbatore" />
              <option value="Jabalpur" />
              <option value="Gwalior" />
              <option value="Vijayawada" />
              <option value="Jodhpur" />
              <option value="Madurai" />
              <option value="Raipur" />
              <option value="Kota" />
              <option value="Chandigarh" />
              <option value="Guwahati" />
              <option value="Solapur" />
              <option value="Hubli-Dharwad" />
              <option value="Mysore" />
              <option value="Tiruchirappalli" />
              <option value="Bareilly" />
              <option value="Aligarh" />
              <option value="Tiruppur" />
              <option value="Moradabad" />
              <option value="Jalandhar" />
              <option value="Bhubaneswar" />
              <option value="Salem" />
              <option value="Warangal" />
              <option value="Mira-Bhayandar" />
              <option value="Thiruvananthapuram" />
              <option value="Bhiwandi" />
              <option value="Saharanpur" />
              <option value="Guntur" />
              <option value="Amravati" />
              <option value="Bikaner" />
              <option value="Noida" />
              <option value="Jamshedpur" />
              <option value="Bhilai" />
              <option value="Cuttack" />
              <option value="Firozabad" />
              <option value="Kochi" />
              <option value="Nellore" />
              <option value="Bhavnagar" />
              <option value="Dehradun" />
              <option value="Durgapur" />
              <option value="Asansol" />
            </datalist>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit number"
              maxLength="10"
              required
            />
          </div>

                {error && (
                  <motion.p 
                    className="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.p>
                )}

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="spinner"></span>
                      Submitting...
                    </span>
                  ) : (
                    'Submit'
                  )}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LeadModal;
