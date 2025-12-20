import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import './Exhibition.css';

const ByDeveloper = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use real-time listener for immediate updates
        const propertiesRef = collection(db, 'properties');
        const q = query(propertiesRef, where('user_type', '==', 'developer'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const projectsData = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Filter active properties on client side
            if (data.status === 'active') {
              projectsData.push({
                id: doc.id,
                ...data
              });
            }
          });
          
          // Sort by created_at on client side
          projectsData.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
          });
          
          setProjects(projectsData);
          setLoading(false);
        }, (error) => {
          console.error('Error fetching developer projects:', error);
          setError(`Failed to load projects: ${error.message}`);
          setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();

      } catch (error) {
        console.error('Error setting up projects listener:', error);
        setError(`Failed to load projects: ${error.message}`);
        setLoading(false);
      }
    };

    fetchProjects();
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

        {/* Loading State */}
        {loading && (
          <motion.div 
            className="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="spinner"></div>
            <p>Loading developer projects...</p>
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

        {/* Projects Grid */}
        {!loading && !error && (
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
                  <img 
                    src={project.image_url || "/placeholder-property.jpg"} 
                    alt={project.title}
                    onError={(e) => {
                      e.target.src = "/placeholder-property.jpg";
                    }}
                  />
                  <div className="property-badge developer">Developer</div>
                  <div className="status-badge">Active</div>
                </div>
                <div className="property-info">
                  <h3>{project.title}</h3>
                  <p className="owner">🏢 {project.company_name || 'Developer'}</p>
                  <p className="location">📍 {project.location}</p>
                  <div className="property-details">
                    <span className="type">{project.type}</span>
                    {project.total_units && <span className="units">{project.total_units} Units</span>}
                    {project.bhk && <span className="bhk">{project.bhk}</span>}
                  </div>
                  {project.project_name && (
                    <p className="project-name">🏗️ {project.project_name}</p>
                  )}
                  {project.description && (
                    <p className="description">{project.description.substring(0, 100)}...</p>
                  )}
                  {project.rera_number && (
                    <p className="rera">RERA: {project.rera_number}</p>
                  )}
                  <div className="property-footer">
                    <span className="price">{project.price}</span>
                    <div className="property-actions">
                      <button 
                        className="view-details-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/property-details/${project.id}`, { 
                            state: { property: project, type: 'developer' } 
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
                            state: { property: { ...project, type: 'developer' } } 
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

        {/* Empty State if no projects */}
        {!loading && !error && projects.length === 0 && (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3>No projects available yet</h3>
            <p>Check back soon for new projects from developers</p>
            <Link to="/post-property" className="post-property-link">
              Be the first to post a project!
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ByDeveloper;
