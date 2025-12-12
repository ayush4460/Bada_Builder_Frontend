import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Exhibition.css';

const ByDeveloper = () => {
  const projects = [
    {
      id: 1,
      title: "Skyline Residency",
      developer: "Shree Balaji Builders",
      location: "Waghodia Road, Vadodara",
      price: "₹45 L - ₹85 L",
      image: "/placeholder-property.jpg",
      type: "Residential Complex",
      units: "120 Units",
      status: "Under Construction"
    },
    {
      id: 2,
      title: "Green Valley Apartments",
      developer: "Prestige Group",
      location: "Manjalpur, Vadodara",
      price: "₹55 L - ₹95 L",
      image: "/placeholder-property.jpg",
      type: "Gated Community",
      units: "200 Units",
      status: "Ready to Move"
    },
    {
      id: 3,
      title: "Royal Heights",
      developer: "Kalpataru Developers",
      location: "Akota, Vadodara",
      price: "₹70 L - ₹1.2 Cr",
      image: "/placeholder-property.jpg",
      type: "Luxury Apartments",
      units: "80 Units",
      status: "Under Construction"
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
          <h1>Projects by Developers</h1>
          <p>Premium projects from trusted real estate developers</p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div 
          className="exhibition-tabs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link to="/exhibition/individual" className="tab">
            By Individual
          </Link>
          <Link to="/exhibition/developer" className="tab active">
            By Developer
          </Link>
          <Link to="/exhibition/live-grouping" className="tab">
            🔴 Live Grouping
          </Link>
          <Link to="/exhibition/badabuilder" className="tab">
            By Bada Builder
          </Link>
        </motion.div>

        {/* Projects Grid */}
        <div className="properties-grid">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              className="property-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className="property-image">
                <img src={project.image} alt={project.title} />
                <div className="property-badge developer">Developer</div>
                <div className="status-badge">{project.status}</div>
              </div>
              <div className="property-info">
                <h3>{project.title}</h3>
                <p className="owner">🏢 {project.developer}</p>
                <p className="location">📍 {project.location}</p>
                <div className="property-details">
                  <span className="type">{project.type}</span>
                  <span className="area">{project.units}</span>
                </div>
                <div className="property-footer">
                  <span className="price">{project.price}</span>
                  <button className="contact-btn">View Details</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State if no projects */}
        {projects.length === 0 && (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3>No projects available yet</h3>
            <p>Check back soon for new projects from developers</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ByDeveloper;
