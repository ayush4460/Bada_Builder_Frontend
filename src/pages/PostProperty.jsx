import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import './PostProperty.css';

const PostProperty = () => {
  const navigate = useNavigate();
  const { currentUser, isSubscribed, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Get userType from navigation state if available
  const locationState = window.history.state?.usr;
  const [userType, setUserType] = useState(locationState?.userType || null); // 'individual' or 'developer'

  const [formData, setFormData] = useState({
    title: '',
    type: '',
    location: '',
    price: '',
    bhk: '',
    description: '',
    facilities: '',
    // Developer specific fields
    companyName: '',
    projectName: '',
    totalUnits: '',
    completionDate: '',
    reraNumber: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      alert('Please login to post a property');
      navigate('/login');
      return;
    }

    if (!isSubscribed()) {
      alert('Please subscribe to a plan to post properties');
      navigate('/subscription-plans');
    }
  }, [isAuthenticated, isSubscribed, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If property type changes, reset BHK if not applicable
    if (name === 'type') {
      const newFormData = { ...formData, [name]: value };
      // Reset BHK if property type doesn't support it
      if (!['Flat/Apartment', 'Independent House/Villa'].includes(value)) {
        newFormData.bhk = '';
      }
      setFormData(newFormData);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Check if BHK type should be shown
  const showBhkType = ['Flat/Apartment', 'Independent House/Villa'].includes(formData.type);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isSubscribed()) {
      alert('Your subscription has expired. Please renew to post properties.');
      navigate('/subscription-plans');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = '';

      // Upload image if provided
      if (imageFile) {
        const imageRef = ref(storage, `properties/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Save property to Firestore
      const propertyData = {
        title: formData.title,
        type: formData.type,
        location: formData.location,
        price: formData.price,
        description: formData.description,
        facilities: formData.facilities.split(',').map(f => f.trim()),
        image_url: imageUrl,
        user_id: currentUser.uid,
        user_type: userType,
        created_at: new Date().toISOString(),
        status: 'active'
      };

      // Only add BHK if applicable
      if (showBhkType && formData.bhk) {
        propertyData.bhk = formData.bhk;
      }

      // Add developer-specific fields if user is a developer
      if (userType === 'developer') {
        propertyData.company_name = formData.companyName;
        propertyData.project_name = formData.projectName;
        propertyData.total_units = formData.totalUnits;
        propertyData.completion_date = formData.completionDate;
        propertyData.rera_number = formData.reraNumber;
      }

      await addDoc(collection(db, 'properties'), propertyData);

      alert('Property posted successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error posting property:', error);
      alert('Failed to post property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-property-page">
      <motion.div 
        className="post-property-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Post Your Property</h1>
        <p className="subtitle">Fill in the details to list your property</p>

        {/* User Type Selection */}
        {!userType ? (
          <div className="user-type-selection">
            <h2>I am a...</h2>
            <div className="user-type-cards">
              <motion.div 
                className="user-type-card"
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => setUserType('individual')}
              >
                <div className="card-icon">👤</div>
                <h3>Individual Owner</h3>
                <p>Selling or renting your own property</p>
                <ul className="card-features">
                  <li>✓ Direct listing</li>
                  <li>✓ No commission</li>
                  <li>✓ Quick posting</li>
                </ul>
                <button type="button" className="select-type-btn">
                  Select
                </button>
              </motion.div>

              <motion.div 
                className="user-type-card"
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => setUserType('developer')}
              >
                <div className="card-icon">🏢</div>
                <h3>Developer / Builder</h3>
                <p>Listing projects or multiple units</p>
                <ul className="card-features">
                  <li>✓ Project listing</li>
                  <li>✓ Multiple units</li>
                  <li>✓ RERA verified</li>
                </ul>
                <button type="button" className="select-type-btn">
                  Select
                </button>
              </motion.div>
            </div>
          </div>
        ) : (
          <>
            <div className="selected-type-badge">
              <span>
                {userType === 'individual' ? '👤 Individual Owner' : '🏢 Developer'}
              </span>
              <button 
                type="button" 
                className="change-type-btn"
                onClick={() => setUserType(null)}
              >
                Change
              </button>
            </div>

            <form onSubmit={handleSubmit} className="property-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Property Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Luxury 3BHK Apartment"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Property Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select type</option>
                <option value="Flat/Apartment">Flat/Apartment</option>
                <option value="Independent House/Villa">Independent House/Villa</option>
                <option value="Commercial Property">Commercial Property</option>
                <option value="Land">Land</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Vadodara, Gujarat"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price *</label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 50 L - 75 L"
                required
              />
            </div>
          </div>

          {/* Developer Specific Fields */}
          {userType === 'developer' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="companyName">Company Name *</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g., ABC Developers"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="projectName">Project Name *</label>
                  <input
                    type="text"
                    id="projectName"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    placeholder="e.g., Green Valley Phase 2"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="totalUnits">Total Units</label>
                  <input
                    type="number"
                    id="totalUnits"
                    name="totalUnits"
                    value={formData.totalUnits}
                    onChange={handleChange}
                    placeholder="e.g., 120"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="completionDate">Expected Completion</label>
                  <input
                    type="month"
                    id="completionDate"
                    name="completionDate"
                    value={formData.completionDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reraNumber">RERA Registration Number</label>
                <input
                  type="text"
                  id="reraNumber"
                  name="reraNumber"
                  value={formData.reraNumber}
                  onChange={handleChange}
                  placeholder="e.g., PR/GJ/VADODARA/..."
                />
              </div>
            </>
          )}

          <div className="form-row">
            {/* BHK Type - Only show for Flat/Apartment and Independent House/Villa */}
            {showBhkType && (
              <div className="form-group">
                <label htmlFor="bhk">BHK Type</label>
                <select
                  id="bhk"
                  name="bhk"
                  value={formData.bhk}
                  onChange={handleChange}
                >
                  <option value="">Select BHK type</option>
                  <option value="1 RK">1 RK</option>
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                  <option value="5 BHK">5 BHK</option>
                  <option value="6+ BHK">6+ BHK</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="image">Property Image</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="facilities">Facilities (comma-separated)</label>
            <input
              type="text"
              id="facilities"
              name="facilities"
              value={formData.facilities}
              onChange={handleChange}
              placeholder="e.g., Swimming Pool, Gym, Parking"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your property..."
              rows="5"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner"></span>
                Posting...
              </span>
            ) : (
              'Post Property'
            )}
          </button>
        </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PostProperty;
