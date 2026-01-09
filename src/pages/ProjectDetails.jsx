import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import listings from '../data/listings';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiCheckCircle, FiDownload, FiCalendar, FiMaximize, FiArrowRight, FiPhone } from 'react-icons/fi';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = listings.find(item => item.id === parseInt(id));
  const [selectedImage, setSelectedImage] = useState(null);

  if (!project) return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
              <button 
                  onClick={() => navigate('/projects')}
                  className="text-purple-400 hover:text-purple-300 underline"
              >
                  Back to Projects
              </button>
          </motion.div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 relative overflow-hidden font-sans selection:bg-purple-500/30">
        
        {/* Ambient Background */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-12 pb-20">
            
            {/* Header / Intro */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col lg:flex-row justify-between items-start gap-6"
            >
                <div className="space-y-2">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold tracking-wider uppercase"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        Premium Listing
                    </motion.div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                        {project.title}
                    </h1>
                    <div className="flex items-center gap-2 text-slate-400 text-lg">
                        <FiMapPin className="text-purple-500 flex-shrink-0" />
                        <span>{project.location}</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/book-visit', { state: { property: { ...project, type: 'project-details' } } })}
                        className="px-8 py-4 bg-white text-black font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2 group"
                    >
                        Book Site Visit
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                     <motion.button 
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        <FiDownload /> Brochure
                    </motion.button>
                </div>
            </motion.div>

            {/* Image Gallery */}
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[250px]"
            >
                 {project.images?.slice(0, 5).map((img, idx) => (
                    <motion.div
                        key={idx}
                        className={`relative group rounded-2xl overflow-hidden cursor-pointer border border-white/5 ${idx === 0 ? 'md:col-span-2 md:row-span-2 h-full' : 'h-full'}`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.4 }}
                        layoutId={`image-${idx}`}
                        onClick={() => setSelectedImage(img)}
                    >
                        <img 
                            src={img} 
                            alt={`${project.title} view ${idx+1}`} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                ))}
                 {/* "View All" Placeholder if more images exist */}
                 <motion.div 
                     whileHover={{ scale: 1.02 }}
                     className="relative group rounded-2xl overflow-hidden cursor-pointer border border-white/5 bg-slate-900 flex items-center justify-center"
                 >
                     <span className="text-slate-400 group-hover:text-white transition-colors font-medium">View Gallery</span>
                 </motion.div>
            </motion.div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-10">
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-3">
                         {project.tags?.map((tag, i) => (
                            <div key={i} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors cursor-default">
                                <FiCheckCircle className="text-green-400" />
                                {tag}
                            </div>
                         ))}
                    </div>

                    {/* About */}
                    <motion.section 
                        initial={{ opacity: 0 }} 
                        whileInView={{ opacity: 1 }} 
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        <h2 className="text-2xl font-bold text-white">About the Project</h2>
                        <p className="text-slate-400 leading-relaxed text-lg">
                            {project.description || "Experience luxury living at its finest. This project offers vivid landscapes, modern amenities, and a community designed for your comfort and style."}
                        </p>
                    </motion.section>

                    {/* Facilities */}
                    <motion.section 
                        initial={{ opacity: 0 }} 
                        whileInView={{ opacity: 1 }} 
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold text-white">Premium Amenities</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                             {project.facilities?.map((facility, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-3 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                        <FiCheckCircle size={20} />
                                    </div>
                                    <span className="text-slate-300 font-medium">{facility}</span>
                                </div>
                             ))}
                        </div>
                    </motion.section>

                     {/* Location Advantages */}
                    <motion.section 
                        initial={{ opacity: 0 }} 
                        whileInView={{ opacity: 1 }} 
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold text-white">Location Highlights</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {project.advantages?.map((item, idx) => (
                                <div key={idx} className="flex px-4 py-3 rounded-lg bg-white/5 items-center justify-between border border-transparent hover:border-white/10 transition-colors">
                                    <span className="text-slate-200 font-medium">{item.place}</span>
                                    <span className="text-slate-500 text-sm bg-black/30 px-2 py-1 rounded">{item.distance}</span>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Floor Plans */}
                    <motion.section 
                        initial={{ opacity: 0 }} 
                        whileInView={{ opacity: 1 }} 
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h2 className="text-2xl font-bold text-white">Floor Plans</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {project.floorPlans?.map((plan, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all group">
                                    <div className="h-48 overflow-hidden relative">
                                        <img src={plan.image} alt={`Plan ${idx+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full">View Plan</button>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-3">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="text-xl font-bold text-white">4 BHK Luxury Villa</h3>
                                            <span className="text-purple-400 font-bold">{plan.size} sq.ft.</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-slate-400 pt-2 border-t border-white/5">
                                            <span>Starts at <strong className="text-white text-lg ml-1">₹ {plan.price}</strong></span>
                                            <span className="flex items-center gap-1"><FiCalendar /> Dec '25</span>
                                        </div>
                                        <button className="w-full py-3 mt-2 rounded-xl bg-purple-600/20 text-purple-300 font-semibold hover:bg-purple-600 hover:text-white transition-all">
                                            Request Callback
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Price Card */}
                    <div className="bg-gradient-to-b from-purple-900/20 to-transparent p-6 rounded-3xl border border-purple-500/20 backdrop-blur-xl sticky top-6">
                        <span className="text-purple-300 text-sm font-semibold tracking-wider uppercase">Price Range</span>
                        <div className="text-4xl font-bold text-white mt-1 mb-2">
                           ₹ {project.priceRange}
                        </div>
                        <p className="text-slate-400 text-sm mb-6">Inclusive of all taxes and govt. charges</p>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => navigate('/book-visit', { state: { property: { ...project, type: 'project-details' } } })}
                                className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                            >
                                Book Site Visit Now
                            </button>
                            <button className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 hover:bg-purple-500 transition-all flex items-center justify-center gap-2">
                                <FiPhone /> Contact Developer
                            </button>
                        </div>
                    </div>

                    {/* Developer Info */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h3 className="text-lg font-bold text-white mb-4">Developed By</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-xl font-bold text-slate-500">
                                SB
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Shree Balaji Builders</h4>
                                <p className="text-slate-500 text-sm">Premium Real Estate Developer</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        {/* Lightbox for Images */}
        <AnimatePresence>
            {selectedImage && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <motion.img 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.9 }}
                        src={selectedImage} 
                        alt="Full view" 
                        className="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
                    />
                    <button className="absolute top-6 right-6 text-white/50 hover:text-white">
                        <FiMaximize size={32} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default ProjectDetails;