import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// import './RecommendedProjects.css'; // Replaced with Tailwind
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

        // Filter and get latest for each category using mutual exclusion
        const individualProps = allProperties
          .filter(p => p.status === 'active' && !p.developer_info && !p.is_bada_builder) 
          .sort(sortByDate);

        const developerProps = allProperties
          .filter(p => p.status === 'active' && p.developer_info && !p.is_bada_builder)
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
      title: 'By Developer',
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
      <section className="py-32 px-4 flex flex-col items-center justify-center min-h-[50vh] bg-white text-slate-900">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-purple-600 rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold mb-2">Curating Properties</h2>
        <p className="text-slate-500">Finding the best options for you...</p>
      </section>
    );
  }

  // Check if at least one category has a property
  const hasAnyProperty = Object.values(featuredProperties).some(p => p !== null);

  if (!hasAnyProperty) {
    return null; // Hide section if no properties at all
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white text-slate-900 border-t border-slate-100">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Featured <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-indigo-600">Collections</span>
            </h2>
            <p className="text-lg text-slate-500 font-light leading-relaxed">
              Explore our handpicked selection of premium properties curated for exceptional lifestyles.
            </p>
          </div>
          <Link 
            to="/exhibition" 
            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-slate-50 text-slate-900 font-medium hover:bg-slate-100 transition-all duration-300"
          >
            Browse All 
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category, idx) => {
            const property = featuredProperties[category.key];

            return (
              <motion.div
                key={category.key}
                className="flex flex-col h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <div className="flex justify-between items-center mb-4 px-1">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{category.title}</h3>
                </div>

                <div className="h-full group">
                    {property ? (
                      <div className="h-full rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 bg-white ring-1 ring-slate-200 hover:ring-purple-100 transform group-hover:-translate-y-1">
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
                      </div>
                    ) : (
                    <div className="bg-slate-50 rounded-2xl h-[400px] flex flex-col items-center justify-center transition-all duration-300 border-2 border-dashed border-slate-200 hover:border-purple-200 group-hover:bg-purple-50/30">
                        <div className="p-8 text-center opacity-50 group-hover:opacity-80 transition-opacity">
                            <span className="text-4xl block mb-3 grayscale group-hover:grayscale-0 transition-all duration-500">✨</span>
                            <p className="text-slate-500 text-sm font-medium tracking-wide">Coming Soon</p>
                            <Link to="/post-property" className="mt-4 inline-block text-xs font-bold text-purple-600 uppercase tracking-wide border-b border-transparent hover:border-purple-600 transition-all">List Property</Link>
                        </div>
                    </div>
                    )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecommendedProjects;
