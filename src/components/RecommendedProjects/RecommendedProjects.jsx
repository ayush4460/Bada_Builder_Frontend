import React from 'react';
import { motion } from 'framer-motion';
import './RecommendedProjects.css';
import { Link, useNavigate } from 'react-router-dom';
import listings from '../../data/listings';

const RecommendedProjects = () => {
  const navigate = useNavigate();

  return (
    <section className="recommended-section">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Recommended Projects
      </motion.h2>

      <div className="recommended-grid">
        {listings.slice(0, 2).map((project, idx) => (
          <motion.div 
            className="recommended-card" 
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.2 }}
          >
            <img src={project.image} alt={project.title} />
            <div className="recommended-info">
              {project.tags?.length > 0 && (
                <span className="tag">{project.tags[0]}</span>
              )}
              <h3>{project.title}</h3>
              <p>{project.location}</p>
              <strong>{project.priceRange}</strong>
              <div className="card-actions">
                <Link to={`/projects/${project.id}`} className="view-details-btn">
                  View Details
                </Link>
                <button 
                  onClick={() => navigate('/booksitevisit', { state: { property: project } })}
                  className="book-visit-btn"
                >
                  Book Visit
                </button>
              </div>
            </div>
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
