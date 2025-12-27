import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
// import { db } from '../../firebase';
import api from '../../services/api';
import './AdminLiveGrouping.css';

// --- Cloudinary Configuration ---
const CLOUDINARY_CLOUD_NAME = "dooamkdih";
const CLOUDINARY_UPLOAD_PRESET = "property_images";

/**
 * Uploads an image file to Cloudinary using an unsigned preset.
 * @param {File} file The image file to upload.
 * @returns {Promise<string>} A promise that resolves to the secure URL of the uploaded image.
 */
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};


const AdminLiveGrouping = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    developer: '',
    location: '',
    originalPrice: '',
    groupPrice: '',
    discount: '',
    type: '',
    totalSlots: '',
    filledSlots: '',
    timeLeft: '',
    minBuyers: '',
    benefits: '',
    status: 'active',
    area: '',
    possession: '',
    reraNumber: '',
    facilities: '',
    description: '',
    advantages: '',
    tokenAmount: '',
    refundPolicy: "100% refund if group doesn't fill",
    closingDate: '',
    expectedCompletion: ''
  });

  useEffect(() => {
    // Check if user is admin (you can add admin check in AuthContext)
    if (!isAuthenticated) {
      alert('Please login to access admin panel');
      navigate('/login');
      return;
    }
    
    fetchProperties();
  }, [isAuthenticated, navigate]);

  const fetchProperties = async () => {
    try {
      // Fetch all properties
      const response = await api.get('/properties');
      const allProps = response.data.properties || [];
      
      // Filter for live grouping only and map to form structure for display handles
      const liveGroupingProps = allProps
        .filter(p => p.is_live_grouping === true)
        .map(p => {
            const config = p.live_group_config || {};
            const devInfo = p.developer_info || {};
            
            return {
                id: p.id,
                title: p.title,
                developer: devInfo.name || '',
                location: p.location,
                originalPrice: p.price,
                groupPrice: config.groupPrice || '',
                discount: config.discount || '',
                type: p.type,
                totalSlots: config.totalSlots || 0,
                filledSlots: config.filledSlots || 0,
                timeLeft: config.timeLeft || '',
                minBuyers: config.minBuyers || 0,
                benefits: config.benefits || [],
                status: p.status,
                area: config.area || '',
                possession: config.possession || '',
                reraNumber: devInfo.rera || '',
                facilities: p.facilities || [],
                description: p.description,
                advantages: config.advantages || [],
                groupDetails: config.groupDetails || {
                    tokenAmount: '', refundPolicy: '', closingDate: '', expectedCompletion: ''
                },
                images: p.image_url ? [p.image_url] : [],
                image: p.image_url
            };
        });
        
      setProperties(liveGroupingProps);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    
    setImageFiles(files);
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const uploadImages = async () => {
    const uploadPromises = imageFiles.map(file => uploadToCloudinary(file));
    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload images to Cloudinary
      let imageUrls = [];
      if (imageFiles.length > 0) {
        console.log(`📸 Uploading ${imageFiles.length} images to Cloudinary...`);
        imageUrls = await uploadImages();
        console.log('✅ Images uploaded successfully:', imageUrls);
      }

      // Calculate savings
      const originalPriceNum = parseFloat(formData.originalPrice.replace(/[^0-9.]/g, '')) || 0;
      const groupPriceNum = parseFloat(formData.groupPrice.replace(/[^0-9.]/g, '')) || 0;
      const savings = `₹${(originalPriceNum - groupPriceNum).toFixed(0)} Lakhs`;

      // Prepare property data for Backend
      const propertyPayload = {
        title: formData.title,
        location: formData.location,
        type: formData.type,
        price: formData.originalPrice, // Storing original price in main column
        description: formData.description,
        status: formData.status,
        image_url: imageUrls.length > 0 ? imageUrls[0] : (editingId ? undefined : '/placeholder-property.jpg'), // Keep existing if undefined on edit?
        facilities: formData.facilities.split(',').map(f => f.trim()),
        
        is_live_grouping: true,
        
        developer_info: {
            name: formData.developer,
            rera: formData.reraNumber
        },
        
        live_group_config: {
            groupPrice: formData.groupPrice,
            discount: formData.discount,
            savings: savings,
            totalSlots: parseInt(formData.totalSlots) || 20,
            filledSlots: parseInt(formData.filledSlots) || 0,
            timeLeft: formData.timeLeft,
            minBuyers: parseInt(formData.minBuyers) || 5,
            benefits: formData.benefits.split(',').map(b => b.trim()),
            area: formData.area,
            possession: formData.possession,
            advantages: formData.advantages.split('|').map(adv => {
              const [place, distance] = adv.split(':');
              return { place: (place || '').trim(), distance: (distance || '').trim() };
            }),
            groupDetails: {
              tokenAmount: formData.tokenAmount,
              refundPolicy: formData.refundPolicy,
              closingDate: formData.closingDate,
              expectedCompletion: formData.expectedCompletion
            }
        }
      };

      if (editingId) {
        // Update existing property
        await api.put(`/properties/${editingId}`, propertyPayload);
        alert('Property updated successfully!');
      } else {
        // Create new property
        await api.post('/properties', propertyPayload);
        alert('Property added successfully!');
      }

      // Reset form
      resetForm();
      fetchProperties();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Error saving property: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (property) => {
    setEditingId(property.id);
    setFormData({
      title: property.title,
      developer: property.developer,
      location: property.location,
      originalPrice: property.originalPrice,
      groupPrice: property.groupPrice,
      discount: property.discount,
      type: property.type,
      totalSlots: property.totalSlots.toString(),
      filledSlots: property.filledSlots.toString(),
      timeLeft: property.timeLeft,
      minBuyers: property.minBuyers.toString(),
      benefits: Array.isArray(property.benefits) ? property.benefits.join(', ') : '',
      status: property.status,
      area: property.area,
      possession: property.possession,
      reraNumber: property.reraNumber,
      facilities: Array.isArray(property.facilities) ? property.facilities.join(', ') : '',
      description: property.description,
      advantages: Array.isArray(property.advantages) ? property.advantages.map(a => `${a.place}: ${a.distance}`).join(' | ') : '',
      tokenAmount: property.groupDetails?.tokenAmount || '',
      refundPolicy: property.groupDetails?.refundPolicy || "100% refund if group doesn't fill",
      closingDate: property.groupDetails?.closingDate || '',
      expectedCompletion: property.groupDetails?.expectedCompletion || ''
    });
    // Set image previews from existing images if available
    setImagePreviews(property.images || []);
    setImageFiles([]); // Clear any selected files
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      await api.delete(`/properties/${id}`);
      alert('Property deleted successfully!');
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Error deleting property: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      developer: '',
      location: '',
      originalPrice: '',
      groupPrice: '',
      discount: '',
      type: '',
      totalSlots: '',
      filledSlots: '',
      timeLeft: '',
      minBuyers: '',
      benefits: '',
      status: 'active',
      area: '',
      possession: '',
      reraNumber: '',
      facilities: '',
      description: '',
      advantages: '',
      tokenAmount: '',
      refundPolicy: "100% refund if group doesn't fill",
      closingDate: '',
      expectedCompletion: ''
    });
    setEditingId(null);
    setImageFiles([]);
    setImagePreviews([]);
  };

  return (
    <div className="admin-live-grouping">
      <div className="admin-container">
        <div className="admin-header">
          <h1>🔴 Manage Live Grouping Properties</h1>
          <button 
            className="add-property-btn"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? '✕ Cancel' : '+ Add New Property'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div 
            className="property-form-container"
          >
            <h2>{editingId ? 'Edit Property' : 'Add New Property'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              {/* Basic Information */}
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Property Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Skyline Towers - Group Buy"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Developer *</label>
                    <input
                      type="text"
                      name="developer"
                      value={formData.developer}
                      onChange={handleChange}
                      placeholder="e.g., Shree Balaji Builders"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Waghodia Road, Vadodara"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Property Type *</label>
                    <input
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      placeholder="e.g., 3 BHK Apartment"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Area *</label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="e.g., 1450 sq.ft"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Possession *</label>
                    <input
                      type="text"
                      name="possession"
                      value={formData.possession}
                      onChange={handleChange}
                      placeholder="e.g., Dec 2025"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>RERA Number *</label>
                    <input
                      type="text"
                      name="reraNumber"
                      value={formData.reraNumber}
                      onChange={handleChange}
                      placeholder="e.g., PR/GJ/VADODARA/123456"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="form-section">
                <h3>Pricing</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Original Price *</label>
                    <input
                      type="text"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      placeholder="e.g., ₹75 Lakhs"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Group Price *</label>
                    <input
                      type="text"
                      name="groupPrice"
                      value={formData.groupPrice}
                      onChange={handleChange}
                      placeholder="e.g., ₹68 Lakhs"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Discount *</label>
                    <input
                      type="text"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      placeholder="e.g., 9% OFF"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Token Amount *</label>
                    <input
                      type="text"
                      name="tokenAmount"
                      value={formData.tokenAmount}
                      onChange={handleChange}
                      placeholder="e.g., ₹50,000"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Group Details */}
              <div className="form-section">
                <h3>Group Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Total Slots *</label>
                    <input
                      type="number"
                      name="totalSlots"
                      value={formData.totalSlots}
                      onChange={handleChange}
                      placeholder="e.g., 20"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Filled Slots *</label>
                    <input
                      type="number"
                      name="filledSlots"
                      value={formData.filledSlots}
                      onChange={handleChange}
                      placeholder="e.g., 14"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Minimum Buyers *</label>
                    <input
                      type="number"
                      name="minBuyers"
                      value={formData.minBuyers}
                      onChange={handleChange}
                      placeholder="e.g., 15"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Time Left *</label>
                    <input
                      type="text"
                      name="timeLeft"
                      value={formData.timeLeft}
                      onChange={handleChange}
                      placeholder="e.g., 2 Days 5 Hours"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Closing Date *</label>
                    <input
                      type="text"
                      name="closingDate"
                      value={formData.closingDate}
                      onChange={handleChange}
                      placeholder="e.g., Dec 20, 2025"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="closing">Closing Soon</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description & Details */}
              <div className="form-section">
                <h3>Description & Details</h3>
                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Detailed description of the property..."
                    rows="4"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Benefits (comma-separated) *</label>
                  <input
                    type="text"
                    name="benefits"
                    value={formData.benefits}
                    onChange={handleChange}
                    placeholder="e.g., Free Modular Kitchen, 2 Years Maintenance Free, Premium Flooring"
                    required
                  />
                  <small>Separate each benefit with a comma</small>
                </div>

                <div className="form-group full-width">
                  <label>Facilities (comma-separated) *</label>
                  <input
                    type="text"
                    name="facilities"
                    value={formData.facilities}
                    onChange={handleChange}
                    placeholder="e.g., Swimming Pool, Gym, Parking, Security, Garden"
                    required
                  />
                  <small>Separate each facility with a comma</small>
                </div>

                <div className="form-group full-width">
                  <label>Location Advantages (format: Place: Distance | Place: Distance) *</label>
                  <input
                    type="text"
                    name="advantages"
                    value={formData.advantages}
                    onChange={handleChange}
                    placeholder="e.g., Railway Station: 2.5 km | Airport: 8 km | School: 500 m"
                    required
                  />
                  <small>Format: Place: Distance | Place: Distance</small>
                </div>
              </div>

              {/* Images */}
              <div className="form-section">
                <h3>Property Images</h3>
                <div className="form-group full-width">
                  <label>Upload Images (Max 5)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                  <small>Upload up to 5 images. First image will be the main image.</small>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="image-previews">
                    {imagePreviews.map((preview, idx) => (
                      <img key={idx} src={preview} alt={`Preview ${idx + 1}`} />
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Saving...' : editingId ? 'Update Property' : 'Add Property'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Properties List */}
        <div className="properties-list">
          <h2>Existing Properties ({properties.length})</h2>
          {properties.length === 0 ? (
            <p className="no-properties">No properties added yet. Click "Add New Property" to get started.</p>
          ) : (
            <div className="properties-grid-admin">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="property-card-admin"
                >
                  <div className="property-image-admin">
                    <img src={property.image} alt={property.title} />
                    <span className={`status-badge-admin ${property.status}`}>
                      {property.status}
                    </span>
                  </div>
                  <div className="property-info-admin">
                    <h3>{property.title}</h3>
                    <p className="developer">🏢 {property.developer}</p>
                    <p className="location">📍 {property.location}</p>
                    <div className="price-info">
                      <span className="original-price">{property.originalPrice}</span>
                      <span className="group-price">{property.groupPrice}</span>
                      <span className="discount">{property.discount}</span>
                    </div>
                    <div className="slots-info">
                      {property.filledSlots}/{property.totalSlots} Buyers Joined
                    </div>
                    <div className="admin-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(property)}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(property.id)}
                      >
                        🗑️ Delete
                      </button>
                      <button 
                        className="view-btn"
                        onClick={() => navigate(`/exhibition/live-grouping/${property.id}`)}
                      >
                        👁️ View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLiveGrouping;