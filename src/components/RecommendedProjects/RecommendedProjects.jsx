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
      title: 'Live Grouping',
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
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 text-slate-900">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold tracking-[0.2em] uppercase mb-6"
            >
              Exclusive Listings
            </motion.div>
            <h2 className="text-3xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6">
              Featured <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-indigo-600">Collections</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-500 font-light leading-relaxed">
              Explore our handpicked selection of premium properties curated for exceptional lifestyles and high-growth investments.
            </p>
          </div>
          <Link 
            to="/exhibition" 
            className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-slate-900 font-bold border border-slate-200 hover:border-purple-200 hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-xl w-full md:w-auto justify-center md:justify-start"
          >
            Browse All Properties
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </motion.div>
 
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10">
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
                <div className="flex justify-between items-center mb-6 pl-1">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    {category.title}
                  </h3>
                </div>
 
                <div className="h-full group">
                    {property ? (
                      <div className="h-full rounded-3xl overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] transition-all duration-500 bg-white ring-1 ring-slate-100 hover:ring-purple-200 transform group-hover:-translate-y-2">
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
                    <div className="bg-white rounded-3xl h-[450px] flex flex-col items-center justify-center transition-all duration-300 border border-slate-100 hover:border-purple-200 group-hover:bg-purple-50/20 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-purple-200 to-indigo-200 opacity-20"></div>
                        <div className="p-8 text-center transition-all duration-500">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                              <span className="text-4xl block grayscale group-hover:grayscale-0 transition-all duration-500">✨</span>
                            </div>
                            <h4 className="text-slate-900 font-bold mb-2">Expanding Soon</h4>
                            <p className="text-slate-400 text-sm font-light max-w-[180px] mx-auto leading-relaxed mb-8">We're carefully selecting the best properties for this category.</p>
                            <Link to="/post-property" className="px-5 py-2 rounded-xl bg-slate-900 text-white! text-xs font-bold uppercase tracking-wider hover:bg-purple-700 transition-colors shadow-lg shadow-slate-200">
                              List Your Property
                            </Link>
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
