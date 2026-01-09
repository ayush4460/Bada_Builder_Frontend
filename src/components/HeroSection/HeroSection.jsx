import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// import './HeroSection.css'; // Replaced with Tailwind
import { useLocation } from 'react-router-dom';
import DetailedSearchBar from '../DetailedSearchBar/DetailedSearchBar';

const HeroSection = () => {

  const locationState = useLocation();

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Success message from booking
  useEffect(() => {
    if (locationState.state?.successMessage) {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [locationState]);

  // 🔴 HIDE HERO SECTION ON SEARCH PAGE AND POST PROPERTY PAGE
  if (locationState.pathname === '/search' || locationState.pathname === '/post-property') {
    return null;
  }



  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505] py-20 px-4 sm:px-6 lg:px-8 text-center text-white">
      {/* Premium Ambient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -ml-64 -mb-64"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay"></div>
        
        {/* Subtle Mesh Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-white/5 backdrop-blur-2xl border border-white/10 text-white px-8 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 ring-1 ring-white/20"
        >
          <div className="w-6 h-6 flex items-center justify-center bg-linear-to-br from-green-400 to-emerald-500 rounded-full text-white text-[10px] font-bold shadow-lg shadow-green-500/20">
            ✓
          </div>
          <span className="font-medium tracking-tight text-sm">{locationState.state?.successMessage}</span>
          <button
            onClick={() => setShowSuccessMessage(false)}
            className="ml-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-lg"
          >
            ×
          </button>
        </motion.div>
      )}

      <div className="relative z-10 max-w-[1400px] mx-auto w-full flex flex-col items-center">
        {/* Badge/Tagline */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="mb-8 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-bold tracking-[0.2em] uppercase text-purple-300 shadow-xl"
        >
          The Future of Indian Real Estate
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[120px] font-bold mb-10 leading-[0.9] tracking-[-0.04em] text-white">
            Beyond <br /> 
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-indigo-300 to-purple-400 animate-gradient-x px-2">Property.</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl sm:text-2xl text-slate-400 mb-16 max-w-2xl leading-relaxed font-light tracking-tight"
        >
          Discover curated investments and premium lifestyles across India's most iconic locations.
        </motion.p>

        <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl px-4"
        >
            <div className="relative group">
                <div className="absolute -inset-2 bg-linear-to-r from-purple-500/20 to-indigo-500/20 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-white/5 backdrop-blur-3xl p-2 md:p-3 rounded-[32px] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-[1.01]">
                    <div className="bg-white/5 rounded-[24px] p-2">
                        <DetailedSearchBar />
                    </div>
                </div>
            </div>
            
            {/* Quick Stats/Trust Marks */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 hover:opacity-100 transition-opacity duration-500">
               <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">100%</span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Verified</span>
               </div>
               <div className="w-px h-10 bg-white/10 hidden md:block"></div>
               <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">24/7</span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Support</span>
               </div>
               <div className="w-px h-10 bg-white/10 hidden md:block"></div>
               <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">ROI</span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Focused</span>
               </div>
            </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
