import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import './Exhibition.css';

const ByIndividual = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use real-time listener for immediate updates
        const propertiesRef = collection(db, 'properties');
        const q = query(propertiesRef, where('user_type', '==', 'individual'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const propertiesData = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Filter active properties on client side
            if (data.status === 'active') {
              propertiesData.push({
                id: doc.id,
                ...data
              });
            }
          });
          
          // Sort by created_at on client side
          propertiesData.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
          });
          
          setProperties(propertiesData);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching individual properties:', error);
          setError(`Failed to load properties: ${error.message}`);
          setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();

      } catch (error) {
        console.error('Error setting up properties listener:', error);
        setError(`Failed to load properties: ${error.message}`);
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="exhibition-page">
      <div className="exhibition-container">
        {/* Header */}
        <motion.div 
          className="exhibition-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Properties by Individual Owners</h1>
          <p>Direct listings from property owners - No middleman, better deals</p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div 
          className="exhibition-tabs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link to="/exhibition/individual" className="tab active">
            By Individual
          </Link>
          <Link to="/exhibition/developer" className="tab">
            By Developer
          </Link>
          <Link to="/exhibition/live-grouping" className="tab">
            🔴 Live Grouping
          </Link>
          <Link to="/exhibition/badabuilder" className="tab">
            By Bada Builder
          </Link>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div 
            className="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="spinner"></div>
            <p>Loading individual properties...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div 
            className="error-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3>⚠️ {error}</h3>
            <button 
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Properties Grid */}
        {!loading && !error && (
          <div className="properties-grid">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                className="property-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="property-image">
                  <img 
                    src={property.image_url || "/placeholder-property.jpg"} 
                    alt={property.title}
                    onError={(e) => {
                      e.target.src = "/placeholder-property.jpg";
                    }}
                  />
                  <div className="property-badge">Individual</div>
                </div>
                <div className="property-info">
                  <h3>{property.title}</h3>
                  <p className="owner">👤 Individual Owner</p>
                  <p className="location">📍 {property.location}</p>
                  <div className="property-details">
                    <span className="type">{property.type}</span>
                    {property.bhk && <span className="bhk">{property.bhk}</span>}
                  </div>
                  {property.description && (
                    <p className="description">{property.description.substring(0, 100)}...</p>
                  )}
                  <div className="property-footer">
                    <span className="price">{property.price}</span>
                    <div className="property-actions">
                      <button 
                        className="view-details-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/property-details/${property.id}`, { 
                            state: { property, type: 'individual' } 
                          });
                        }}
                      >
                        View Details
                      </button>
                      <button 
                        className="book-visit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/book-visit', { 
                            state: { property: { ...property, type: 'individual' } } 
                          });
                        }}
                      >
                        Book Site Visit
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State if no properties */}
        {!loading && !error && properties.length === 0 && (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3>No properties available yet</h3>
            <p>Check back soon for new listings from individual owners</p>
            <Link to="/post-property" className="post-property-link">
              Be the first to post a property!
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ByIndividual;
