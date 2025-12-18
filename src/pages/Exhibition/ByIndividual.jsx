import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import './Exhibition.css';

const ByIndividual = () => {
  const navigate = useNavigate();
  const properties = [
    {
      id: 1,
      title: "Modern 3BHK Apartment",
      owner: "Rajesh Kumar",
      location: "Alkapuri, Vadodara",
      price: "₹65 Lakhs",
      image: "/placeholder-property.jpg",
      type: "Apartment",
      area: "1450 sq.ft"
    },
    {
      id: 2,
      title: "Luxury Villa with Garden",
      owner: "Priya Sharma",
      location: "Gotri, Vadodara",
      price: "₹1.2 Cr",
      image: "/placeholder-property.jpg",
      type: "Villa",
      area: "2800 sq.ft"
    },
    {
      id: 3,
      title: "Commercial Shop Space",
      owner: "Amit Patel",
      location: "RC Dutt Road, Vadodara",
      price: "₹45 Lakhs",
      image: "/placeholder-property.jpg",
      type: "Commercial",
      area: "800 sq.ft"
    }
  ];

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

        {/* Properties Grid */}
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
                <img src={property.image} alt={property.title} />
                <div className="property-badge">Individual</div>
              </div>
              <div className="property-info">
                <h3>{property.title}</h3>
                <p className="owner">👤 {property.owner}</p>
                <p className="location">📍 {property.location}</p>
                <div className="property-details">
                  <span className="type">{property.type}</span>
                  <span className="area">{property.area}</span>
                </div>
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

        {/* Empty State if no properties */}
        {properties.length === 0 && (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3>No properties available yet</h3>
            <p>Check back soon for new listings from individual owners</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ByIndividual;
