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
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0a0a0a] py-32 px-4 sm:px-6 lg:px-8 text-center text-white font-sans">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(147,51,234,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(79,70,229,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none mix-blend-overlay"></div>

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/10 text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-3 ring-1 ring-white/20"
        >
          <span className="w-5 h-5 flex items-center justify-center bg-green-500 rounded-full text-[10px] font-bold">✓</span>
          <span className="font-light tracking-wide text-sm">{locationState.state?.successMessage}</span>
          <button
            onClick={() => setShowSuccessMessage(false)}
            className="ml-2 hover:text-white/80 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </motion.div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium mb-8 leading-[1.1] tracking-tight text-white">
            Find Your <span className="font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-300 via-indigo-300 to-purple-300 animate-gradient-x">Dream Property</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-lg sm:text-xl text-white mb-14 max-w-3xl leading-relaxed tracking-wide"
        >
          Experience the finest collection of real estate across India. 
          <span className="block mt-2 text-white">Luxury. Comfort. Lifestyle.</span>
        </motion.p>

        <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-3xl"
        >
            <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-purple-600 to-indigo-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-black/40 backdrop-blur-xl p-3 md:p-4 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/5">
                    <DetailedSearchBar />
                </div>
            </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
