import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
// import ViewToggle from '../../components/ViewToggle/ViewToggle'; // Replaced with inline buttons
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import useViewPreference from '../../hooks/useViewPreference';
import { FiCheckCircle, FiShield, FiTrendingUp, FiAward, FiSearch, FiGrid, FiList } from 'react-icons/fi';
import './Exhibition.css';

const ByBadaBuilder = () => {
  const navigate = useNavigate();
  const [view, setView] = useViewPreference();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBadaBuilderProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all properties
        // In a real scenario, API might support filtering by is_bada_builder=true
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

  const filteredProperties = properties.filter(property => 
    property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-amber-500/30 selection:text-white pb-20">
      
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-amber-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative max-w-[1600px] mx-auto z-10">
        
        {/* Header Section */}
        <div className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black tracking-[0.3em] uppercase text-amber-500 mb-6">
                <FiAward /> Exclusively Curated
             </div>
             <h1 className="text-4xl md:text-6xl font-black text-white! tracking-tight mb-4">
               The Bada Builder <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-200 via-yellow-400 to-amber-600">Collection</span>
             </h1>
             <p className="text-white! text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
               Handpicked premium properties, verified for legal clearance and high ROI. Experience the gold standard of real estate.
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
              <Link to="/exhibition/individual" className="px-6 py-2.5 rounded-full text-white! hover:text-white hover:bg-white/5 text-sm font-bold transition-all">
                Individual
              </Link>
              <Link to="/exhibition/developer" className="px-6 py-2.5 rounded-full text-white! hover:text-white hover:bg-white/5 text-sm font-bold transition-all">
                Developer
              </Link>
              <Link to="/exhibition/live-grouping" className="px-6 py-2.5 rounded-full text-white! hover:text-white hover:bg-white/5 text-sm font-bold transition-all flex items-center gap-2">
                Live Grouping <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              </Link>
              <Link to="/exhibition/badabuilder" className="px-6 py-2.5 rounded-full bg-white text-black shadow-lg shadow-amber-500/20 text-sm font-bold transition-all">
                Bada Builder
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Filters & View Toggle Bar */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-2xl bg-white/2 border border-white/5 backdrop-blur-sm">
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80 group">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search premium properties..." 
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-slate-600 text-sm font-medium"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                       onClick={() => setView('grid')}
                       className={`p-2.5 rounded-xl border transition-all ${view === 'grid' ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-900/20' : 'bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <FiGrid size={18} />
                    </button>
                    <button 
                       onClick={() => setView('list')}
                       className={`p-2.5 rounded-xl border transition-all ${view === 'list' ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-900/20' : 'bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <FiList size={18} />
                    </button>
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="px-4 sm:px-6 lg:px-8 min-h-[400px]">
           
           {/* Loading State */}
           {loading && (
             <div className="flex flex-col items-center justify-center py-20">
               <div className="w-16 h-16 border-4 border-slate-800 border-t-amber-500 rounded-full animate-spin mb-6"></div>
               <p className="text-slate-400 font-light text-lg animate-pulse">Curating premium collection...</p>
             </div>
           )}

            {/* Error State */}
            {!loading && error && (
                <div className="text-center py-20">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white transition-all">
                        Retry
                    </button>
                </div>
            )}

           {/* Properties Grid */}
           {!loading && !error && filteredProperties.length > 0 && (
             <div className={
                view === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8" 
                : "flex flex-col gap-6 max-w-4xl mx-auto"
             }>
               {filteredProperties.map((property, index) => (
                 <motion.div
                   key={property.id}
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.5, delay: index * 0.1 }}
                   className="relative group isolate"
                 >
                    {/* Gold Glow Effect */}
                    <div className="absolute -inset-0.5 bg-linear-to-b from-amber-500/20 to-transparent rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md -z-10"></div>
                    
                    <div className="h-full bg-[#0A0A0A] border border-white/5 hover:border-amber-500/30 rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1">
                        <PropertyCard
                            property={{
                                ...property,
                                image: property.image_url, // Map API field
                                badge: 'Bada Builder Verified', // Custom badge
                                owner: property.developer_info?.companyName || 'Bada Builder Premium',
                            }}
                            viewType={view}
                            source="badabuilder"
                        />
                         {/* Premium Overlay Badge */}
                         {view === 'grid' && (
                             <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/80 backdrop-blur-md border border-amber-500/30 rounded-lg flex items-center gap-1.5 z-20">
                                 <FiShield className="text-amber-400 text-xs" />
                                 <span className="text-[10px] font-bold text-amber-100 tracking-wider uppercase">Verified</span>
                             </div>
                         )}
                    </div>
                 </motion.div>
               ))}
             </div>
           )}

           {/* Empty State */}
           {!loading && !error && filteredProperties.length === 0 && (
             <motion.div 
               className="text-center py-32"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
             >
               <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
                  <FiAward size={40} />
               </div>
               <h3 className="text-2xl font-black text-white mb-2">No Premium Properties Found</h3>
               <p className="text-slate-400 max-w-md mx-auto mb-8">
                 We couldn't find any properties matching your search in our curated collection.
               </p>
               <button 
                onClick={() => setSearchQuery('')}
                className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all"
               >
                 Clear Search
               </button>
             </motion.div>
           )}

            {/* Why Choose Section - Premium Style */}
            <div className="mt-32 mb-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Why Choose <span className="text-amber-500">Bada Builder?</span></h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">Experience real estate investing with complete peace of mind and maximum returns.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: <FiShield />, title: "100% Verified", desc: "Every property passes our rigorous 50-point legal checklist." },
                        { icon: <FiTrendingUp />, title: "High ROI", desc: "Handpicked locations with highest appreciation potential." },
                        { icon: <FiAward />, title: "Premium Quality", desc: "Only Grade-A featured developers make it to our list." },
                        { icon: <FiCheckCircle />, title: "Zero Brokerage", desc: "Transact directly and save significantly on fees." }
                    ].map((item, idx) => (
                        <motion.div 
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 hover:bg-white/[0.04] transition-all group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 text-2xl mb-6 group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ByBadaBuilder;
