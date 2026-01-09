import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import listings from '../data/listings';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiMapPin, FiArrowRight, FiHome, FiDollarSign } from 'react-icons/fi';

const categories = ['All', 'Flat/Apartment', 'Independent House/Villa', 'Commercial Property', 'Land'];

const Projects = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const filteredListings = listings.filter(listing => {
    const matchesCategory = selectedCategory === 'All' || listing.type === selectedCategory;
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          listing.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBookVisit = (e, project = null) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/book-visit', { 
        state: project ? { property: { ...project, type: 'projects' } } : null 
      });
    } else {
      navigate('/login', {
        state: {
          returnTo: '/book-visit',
          property: project,
          message: 'Please login to book a site visit'
        }
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 relative overflow-hidden font-sans selection:bg-purple-500/30 font-light">
       
       {/* Ambient Background */}
       <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
       </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
            <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight"
            >
                Discover Premium <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-indigo-400">Living</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="text-slate-400 text-lg md:text-xl font-light"
            >
                Explore our curated collection of luxury properties designed for your lifestyle.
            </motion.p>
        </div>

        {/* Filters & Search */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10"
        >
            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
                {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                        selectedCategory === cat 
                        ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' 
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                >
                    {cat}
                </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-96 group">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search projects, locations..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-black/40 transition-all font-light"
                />
            </div>
        </motion.div>

        {/* Listings Grid */}
        <AnimatePresence mode='wait'>
            <motion.div 
                key={selectedCategory + searchQuery}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {filteredListings.length > 0 ? (
                    filteredListings.map((listing) => (
                    <motion.div 
                        key={listing.id}
                        variants={itemVariants}
                        className="group"
                    >
                        <Link to={`/projects/${listing.id}`} className="block h-full">
                            <article className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 hover:bg-white/[0.07] transition-all duration-500 flex flex-col hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
                                {/* Image Container */}
                                <div className="relative h-64 overflow-hidden">
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent z-10" />
                                    <img 
                                        src={listing.image} 
                                        alt={listing.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    />
                                    
                                    {/* Quick Info Overlay */}
                                    <div className="absolute bottom-4 left-4 z-20">
                                        <p className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">{listing.priceRange}</p>
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 w-fit">
                                            <FiHome className="text-purple-400" />
                                            {listing.type}
                                        </div>
                                    </div>

                                    {/* Top Tags */}
                                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                                        {listing.tags?.slice(0, 2).map((tag, i) => (
                                            <span key={i} className="bg-purple-600/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors line-clamp-1">{listing.title}</h3>
                                    
                                    <div className="flex items-start gap-2 text-slate-400 mb-6 text-sm line-clamp-2 min-h-[40px]">
                                        <FiMapPin className="text-purple-500 mt-1 shrink-0" />
                                        <span>{listing.location}</span>
                                    </div>

                                    <div className="mt-auto grid grid-cols-2 gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleBookVisit(e, listing);
                                            }}
                                            className="px-4 py-2.5 rounded-lg bg-white text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-white/5"
                                        >
                                            Book Visit
                                        </button>
                                        <div className="flex items-center justify-center gap-2 text-slate-300 text-sm font-semibold group-hover:text-white transition-colors">
                                            View Details <FiArrowRight />
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    </motion.div>
                    ))
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="col-span-full py-20 text-center"
                    >
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiFilter className="text-3xl text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
                        <p className="text-slate-400">Try adjusting your filters or search query.</p>
                        <button 
                            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-500 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Projects;