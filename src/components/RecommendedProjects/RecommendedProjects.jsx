import React from 'react';
import { motion } from 'framer-motion';
import './RecommendedProjects.css';
import { Link, useNavigate } from 'react-router-dom';
import listings from '../../data/listings';
import ViewToggle from '../ViewToggle/ViewToggle';
import PropertyCard from '../PropertyCard/PropertyCard';
import useViewPreference from '../../hooks/useViewPreference';

const RecommendedProjects = () => {
  const navigate = useNavigate();
  const [view, setView] = useViewPreference();

  // Transform listings data to match PropertyCard format
  const transformedListings = listings.slice(0, 6).map(listing => ({
    ...listing,
    price: listing.priceRange,
    area: listing.size,
    bhk: listing.bhk,
    type: listing.type || 'Residential',
    status: 'Available',
    featured: listing.tags?.includes('Featured')
  }));

  return (
    <section className="recommended-section">
      <div className="section-header">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Recommended Projects
        </motion.h2>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      <div className={`recommended-grid ${view === 'list' ? 'list-view' : 'grid-view'}`}>
        {transformedListings.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <PropertyCard 
              property={project} 
              viewType={view}
              source="recommended"
            />
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="view-all-wrapper"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Link to="/projects" className="view-all-btn">
          View All Projects
        </Link>
      </motion.div>
    </section>
  );
};

export default RecommendedProjects;
