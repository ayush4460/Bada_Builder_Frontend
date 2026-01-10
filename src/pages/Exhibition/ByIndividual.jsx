import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import useViewPreference from '../../hooks/useViewPreference';
import { filterAndMarkExpiredProperties } from '../../utils/propertyExpiry';
import { FiGrid, FiList, FiHome, FiSearch, FiFilter } from 'react-icons/fi';

const ByIndividual = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useViewPreference();
  // const location = useLocation(); // Unused


  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch using backend API with role 'individual'
        const response = await api.get('/properties', { params: { role: 'individual' } });
        const propertiesData = response.data.properties || [];

        // Filter out expired properties and mark them as expired
        // AND exclude Bada Builder properties from this view
        const activeProperties = (await filterAndMarkExpiredProperties(propertiesData))
          .filter(p => !p.is_bada_builder);
        
        // Sort by created_at on client side
        activeProperties.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
        
        setProperties(activeProperties);
        setLoading(false);

      } catch (error) {
        console.error('Error fetching individual properties:', error);
        setError(`Failed to load properties: ${error.message}`);
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const navLinks = [
    { path: '/exhibition/individual', label: 'Individual', active: true },
    { path: '/exhibition/developer', label: 'Developer', active: false },
    { path: '/exhibition/live-grouping', label: 'Live Grouping', active: false, badge: 'LIVE' },
    { path: '/exhibition/badabuilder', label: 'Bada Builder', active: false },
  ];

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-purple-500/30 selection:text-white pb-20">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative max-w-[1600px] mx-auto z-10">
        
        {/* Header Section */}
        <div className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
             <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.3em] uppercase text-purple-400 mb-6 inline-block">
                Direct Listings
             </span>
             <h1 className="text-4xl md:text-6xl font-black text-white! tracking-tight mb-4">
               Individual <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-indigo-400">Collections</span>
             </h1>
             <p className="text-white! text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
               Discover exclusive properties listed directly by owners. Zero brokerage, transparent deals, and verified listings.
             </p>
          </motion.div>

          {/* Premium Navigation Tabs */}
          <motion.div 
            className="mt-12 flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl flex flex-wrap justify-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all relative group ${
                    link.active 
                      ? 'bg-white! text-black shadow-lg shadow-white/10' 
                      : 'text-white! hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                     {link.label}
                     {link.badge && (
                       <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                     )}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Filters & View Toggle Bar */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-2xl bg-white/2 border border-white/5 backdrop-blur-sm">
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80 group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                        <input 
                          type="text" 
                          placeholder="Search direct listings..." 
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 text-sm font-medium"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                       onClick={() => setView('grid')}
                       className={`p-2.5 rounded-xl border transition-all ${view === 'grid' ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20' : 'bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <FiGrid size={18} />
                    </button>
                    <button 
                       onClick={() => setView('list')}
                       className={`p-2.5 rounded-xl border transition-all ${view === 'list' ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20' : 'bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <FiList size={18} />
                    </button>
                </div>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="px-4 sm:px-6 lg:px-8 min-h-[400px]">
           
           {/* Loading State */}
           {loading && (
             <div className="flex flex-col items-center justify-center py-20">
               <div className="w-16 h-16 border-4 border-slate-800 border-t-purple-600 rounded-full animate-spin mb-6"></div>
               <p className="text-slate-400 font-light text-lg animate-pulse">Curating individual listings...</p>
             </div>
           )}

           {/* Error State */}
           {error && (
             <div className="text-center py-20 p-8 rounded-3xl bg-red-900/10 border border-red-500/20 max-w-2xl mx-auto">
               <h3 className="text-2xl font-bold text-red-400 mb-2">Something went wrong</h3>
               <p className="text-slate-400 mb-6">{error}</p>
               <button 
                 onClick={() => window.location.reload()}
                 className="px-6 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
               >
                 Try Again
               </button>
             </div>
           )}

           {/* Properties Grid */}
           {!loading && !error && properties.length > 0 && (
             <div className={
                view === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8" 
                : "flex flex-col gap-6 max-w-4xl mx-auto"
             }>
               {properties.map((property, index) => (
                 <motion.div
                   key={property.id}
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.5, delay: index * 0.05 }}
                   className="h-full"
                 >
                   <PropertyCard 
                     property={{
                       ...property,
                       image: property.image_url,
                       area: property.area || property.size,
                       status: property.status || 'Available',
                       badge: 'Owner Listed'
                     }}
                     viewType={view}
                     source="individual"
                     className="h-full shadow-lg hover:shadow-2xl transition-all duration-300"
                   />
                 </motion.div>
               ))}
             </div>
           )}

           {/* Empty State */}
           {!loading && !error && properties.length === 0 && (
             <motion.div 
               className="text-center py-32"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
             >
               <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
                  <FiHome size={40} />
               </div>
               <h3 className="text-2xl font-black text-white mb-2">No Listings Found</h3>
               <p className="text-slate-400 max-w-md mx-auto mb-8">
                 Currently, there are no individual properties listed. Be the first to showcase your property to thousands of buyers.
               </p>
               <Link 
                 to="/post-property" 
                 className="px-8 py-3 bg-white text-black font-black rounded-xl hover:bg-slate-200 transition-all hover:scale-105 inline-flex items-center gap-2"
               >
                 Post a Property
               </Link>
             </motion.div>
           )}

        </div>
      </div>
    </div>
  );
};

export default ByIndividual;
