import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './RecommendedProjects.css';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PropertyCard from '../PropertyCard/PropertyCard';

const RecommendedProjects = () => {
  const [featuredProperties, setFeaturedProperties] = useState({
    individual: null,
    developer: null,
    liveGrouping: null,
    badaBuilder: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);
        // Fetch all properties from backend
        const response = await api.get('/properties');
        const allProperties = response.data.properties || [];

        // Helper to sort by date desc
        const sortByDate = (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0);

        // Filter and get latest for each category using new logic (developer_info existence)
        const individualProps = allProperties
          .filter(p => p.status === 'active' && !p.developer_info) 
          .sort(sortByDate);

        const developerProps = allProperties
          .filter(p => p.status === 'active' && p.developer_info)
          .sort(sortByDate);

        const liveGroupingProps = allProperties
          .filter(p => p.status === 'active' && p.is_live_grouping === true)
          .sort(sortByDate);

        const badaBuilderProps = allProperties
          .filter(p => p.status === 'active' && p.is_bada_builder === true)
          .sort(sortByDate);

        const results = {
          individual: individualProps.length > 0 ? individualProps[0] : null,
          developer: developerProps.length > 0 ? developerProps[0] : null,
          liveGrouping: liveGroupingProps.length > 0 ? liveGroupingProps[0] : null,
          badaBuilder: badaBuilderProps.length > 0 ? badaBuilderProps[0] : null
        };

        setFeaturedProperties(results);
      } catch (error) {
        console.error('Error fetching featured properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  const categories = [
    {
      key: 'individual',
      title: 'By Individual',
      link: '/exhibition/individual',
      badge: 'Individual'
    },
    {
      key: 'developer',
      title: 'By Developer / Builder',
      link: '/exhibition/developer',
      badge: 'Developer'
    },
    {
      key: 'liveGrouping',
      title: '🔴 Live Grouping',
      link: '/exhibition/live-grouping',
      badge: 'Live'
    },
    {
      key: 'badaBuilder',
      title: 'By Bada Builder',
      link: '/exhibition/badabuilder',
      badge: 'Bada Builder'
    }
  ];

  if (loading) {
    return (
      <section className="recommended-section">
        <div className="section-header">
           <div style={{ width: '100%' }}>
              <h2>Featured Properties</h2>
           </div>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Curating best properties for you...</p>
        </div>
      </section>
    );
  }

  // Check if at least one category has a property
  const hasAnyProperty = Object.values(featuredProperties).some(p => p !== null);

  if (!hasAnyProperty) {
    return null; // Hide section if no properties at all
  }

  return (
    <section className="recommended-section">
      <div className="section-container">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ width: '100%' }}>
            <h2>Featured Properties</h2>
            <p className="section-subtitle">
              Explore our handpicked selection of premium properties across various categories.
            </p>
          </div>
        </motion.div>

        <div className="featured-categories">
          {categories.map((category, idx) => {
            const property = featuredProperties[category.key];

            return (
              <motion.div
                key={category.key}
                className="featured-category"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="category-header">
                  <h3>{category.title}</h3>
                  <Link to={category.link} className="view-more-link">
                    View All →
                  </Link>
                </div>

                {property ? (
                  <PropertyCard
                    property={{
                      ...property,
                      image: property.image_url,
                      area: property.area || property.size,
                      status: property.status || 'Available',
                      badge: category.badge
                    }}
                    viewType="grid"
                    source={category.key}
                  />
                ) : (
                  <div className="empty-property-slot">
                    <div className="empty-slot-content">
                      <span className="empty-icon">🏠</span>
                      <p>No properties yet</p>
                      <Link to="/post-property" className="post-link">Post Property</Link>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="view-all-wrapper"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link to="/exhibition" className="view-all-btn">
            Explore All Properties
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default RecommendedProjects;
