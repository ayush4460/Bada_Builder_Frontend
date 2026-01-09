import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ViewToggle from '../../components/ViewToggle/ViewToggle';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import useViewPreference from '../../hooks/useViewPreference';
import './Exhibition.css';

const ByBadaBuilder = () => {
  const [view, setView] = useViewPreference();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBadaBuilderProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all properties and filter for is_bada_builder
        const response = await api.get('/properties');
        const allProperties = response.data.properties || [];
        
        const badaBuilderProps = allProperties
          .filter(p => p.status === 'active' && p.is_bada_builder === true)
          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

        setProperties(badaBuilderProps);
      } catch (err) {
        console.error('Error fetching Bada Builder properties:', err);
        setError('Failed to load premium properties.');
      } finally {
        setLoading(false);
      }
    };

    fetchBadaBuilderProperties();
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
          <h1>Curated by Bada Builder</h1>
          <p>Handpicked premium properties verified by our experts</p>
          <div className="badge-container">
            <span className="verified-badge">✓ 100% Verified</span>
            <span className="verified-badge">✓ Best ROI</span>
            <span className="verified-badge">✓ Legal Clearance</span>
          </div>
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
          <Link to="/exhibition/developer" className="tab">
            By Developer
          </Link>
          <Link to="/exhibition/live-grouping" className="tab">
            🔴 Live Grouping
          </Link>
          <Link to="/exhibition/badabuilder" className="tab active">
            By Bada Builder
          </Link>
        </motion.div>
        {/* View Toggle */}
        {!loading && !error && properties.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            className="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="spinner"></div>
            <p>Loading premium properties...</p>
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
          <div className={`properties-grid ${view === 'list' ? 'list-view' : 'grid-view'}`}>
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PropertyCard
                  property={{
                    ...property,
                    image: property.image_url,
                    status: 'Verified',
                    badge: 'Bada Builder',
                    owner: property.developer_info?.companyName || 'Bada Builder',
                    featured: true
                  }}
                  viewType={view}
                  source="badabuilder"
                />
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
            <h3>No premium properties available yet</h3>
            <p>Check back soon for handpicked listings from Bada Builder</p>
          </motion.div>
        )}

        {/* Why Choose Bada Builder Section */}
        <motion.div
          className="why-choose-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2>Why Choose Bada Builder Curated Properties?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🔍</div>
              <h3>Verified Properties</h3>
              <p>Every property is thoroughly verified for legal compliance</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💰</div>
              <h3>Best ROI</h3>
              <p>Handpicked for maximum return on investment</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🛡️</div>
              <h3>Secure Investment</h3>
              <p>Complete legal clearance and documentation support</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🤝</div>
              <h3>Expert Guidance</h3>
              <p>Dedicated support from property experts</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ByBadaBuilder;
