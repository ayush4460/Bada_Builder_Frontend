import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiPhone, FiCheckCircle, FiInfo, FiMapPin, FiClock, FiShield, FiHome, FiMaximize, FiArrowLeft, FiArrowRight, FiDownload } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const PropertyDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const getPropertyData = async () => {
      if (location.state?.property) {
        setProperty(location.state.property);
        setLoading(false);
      } else if (id) {
        try {
          const response = await api.get(`/properties/${id}`);
          if (response.data) {
            setProperty(response.data);
          }
        } catch (error) {
          console.error("Error fetching property:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    getPropertyData();
  }, [id, location.state]);

  const nextImage = () => {
    if (!propertyImages.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
  };

  const prevImage = () => {
    if (!propertyImages.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-slate-800 border-t-purple-600 rounded-full animate-spin mb-6"></div>
        <p className="text-slate-400 font-light tracking-wide animate-pulse">Loading Exclusive Details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Property Not Found</h2>
        <p className="text-slate-400 mb-8">The property you are looking for might have been removed or is unavailable.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // --- Data Preparation ---
  const isDeveloper = property.user_type === 'developer';
  const propertyTitle = property.project_name || property.projectName || property.title;
  // Fallback images if none exist
  const propertyImages = property.project_images?.length 
    ? property.project_images 
    : (property.images?.length ? property.images : (property.image_url ? [property.image_url] : []));
  
  if (propertyImages.length === 0) {
      propertyImages.push("https://images.unsplash.com/photo-1600596542815-2a4d04774c13?q=80&w=2075&auto=format&fit=crop");
  }

  const propertyTags = isDeveloper
    ? [property.scheme_type, property.possession_status].filter(Boolean)
    : [property.status, property.type].filter(Boolean);

  if (property.rera_status === 'Yes' && !propertyTags.includes('RERA Registered')) {
    propertyTags.push('RERA Registered');
  }

  const propertyFacilities = property.amenities || property.facilities || [];
  
  // Price formatting
  const formatPrice = (p) => {
      if(!p) return '';
      // If it's a number/string that looks like price
      if(p.toString().match(/^\d+$/)) {
          return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 3 }).format(p);
      }
      return p;
  };

  const displayPrice = property.price ||
    (property.base_price && property.max_price ? `${formatPrice(property.base_price)} - ${formatPrice(property.max_price)}` : null) ||
    'Price on Request';

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-purple-500/30 selection:text-white pb-20">
      
      {/* Navbar Placeholder / Back Button */}
      <div className="max-w-[1400px] mx-auto pt-8 px-4 sm:px-6 lg:px-8 flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all">
            <FiArrowLeft />
          </div>
          Back to Listings
        </button>
        <div className="px-3 py-1 bg-purple-900/20 border border-purple-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-purple-400">
          {isDeveloper ? 'Developer Project' : 'Exclusive Property'}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HERO SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Main Image Slider */}
          <div className="lg:col-span-8 relative group rounded-[40px] overflow-hidden bg-slate-900 aspect-[4/3] md:aspect-[16/9] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] border border-white/5">
            <AnimatePresence mode='wait'>
              <motion.img
                key={currentImageIndex}
                src={propertyImages[currentImageIndex]}
                alt={`View ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
              />
            </AnimatePresence>
            
             {/* Gradient Overlay for Text Visibility */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

            {/* Slider Controls */}
            {propertyImages.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-black transition-all transform hover:scale-110">
                    <FiArrowLeft size={20} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-black transition-all transform hover:scale-110">
                    <FiArrowRight size={20} />
                </button>
                </div>
            )}

            {/* Image Counter & Fullscreen */}
            <div className="absolute top-6 right-6 flex gap-3">
               <div className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-white tracking-wider flex items-center gap-2">
                 <FiMaximize /> {currentImageIndex + 1} / {propertyImages.length}
               </div>
            </div>
            
            {/* Quick Title Overlay (Mobile Friendly) */}
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-10">
                <div className="flex flex-wrap gap-2 mb-3">
                    {propertyTags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-[10px] md:text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                            {tag}
                        </span>
                    ))}
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white! tracking-tight leading-tight shadow-black drop-shadow-lg">
                    {propertyTitle}
                </h1>
                <p className="text-white! font-medium flex items-center gap-2 mt-2 text-sm md:text-base">
                    <FiMapPin className="text-purple-400" /> {property.project_location || property.location}
                </p>
            </div>
          </div>

          {/* Quick Stats & CTA Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-4">
             {/* Price Card */}
             <div className="p-8 rounded-[32px] bg-[#0A0A0A] border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-[60px] -mr-16 -mt-16 transition-all group-hover:bg-purple-600/20"></div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">Estimated Price</p>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-1">{displayPrice}</h2>
                <p className="text-xs text-slate-500 font-medium">
                    {isDeveloper ? '*Base price excluding taxes' : '*Negotiable'}
                </p>
                <div className="w-full h-px bg-white/5 my-6"></div>
                
                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Config</p>
                        <p className="text-white font-bold text-sm md:text-base">
                            {property.residential_options?.length ? property.residential_options[0] : (property.bhk || 'N/A')}
                        </p>
                     </div>
                     <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Area</p>
                        <p className="text-white font-bold text-sm md:text-base">
                             {property.project_stats?.area || property.area || property.size || 'N/A'}
                        </p>
                     </div>
                     <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Possession</p>
                        <p className="text-white font-bold text-sm md:text-base">
                             {property.possession_status || 'Ready'}
                        </p>
                     </div>
                     <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">RERA</p>
                        <p className={`font-bold text-sm md:text-base ${property.rera_status === 'Yes' ? 'text-green-400' : 'text-slate-400'}`}>
                             {property.rera_status === 'Yes' ? 'Verified' : 'N/A'}
                        </p>
                     </div>
                </div>

                <button 
                  onClick={() => navigate('/contact', { state: { propertyId: property.id, propertyTitle } })}
                  className="w-full mt-6 py-4 bg-white text-black font-black rounded-xl hover:bg-purple-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/5"
                >
                    Request Callback
                </button>
             </div>

             {/* Brochure Download */}
             {(property.brochure_url || property.brochure) && (
                 <a 
                   href={property.brochure_url || property.brochure}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="flex items-center justify-between p-6 rounded-[24px] bg-[#0A0A0A] border border-white/5 hover:border-purple-500/30 transition-all group"
                 >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white group-hover:bg-purple-600 transition-colors">
                            <FiDownload />
                        </div>
                        <div>
                            <p className="text-white font-bold">Project Brochure</p>
                            <p className="text-xs text-slate-500">PDF Format • 2.4 MB</p>
                        </div>
                    </div>
                 </a>
             )}
          </div>
        </div>

        {/* --- DETAILS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column: Description & Amenities */}
            <div className="lg:col-span-2 space-y-12">
                
                {/* About Section */}
                <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="w-1 h-8 bg-purple-500 rounded-full"></span>
                        About {propertyTitle}
                    </h3>
                    <div className="prose prose-invert prose-lg max-w-none text-slate-400 leading-relaxed font-light">
                        <p className="whitespace-pre-line">{property.description || "No description available for this premium property."}</p>
                    </div>
                </div>

                {/* Amenities Grid */}
                {propertyFacilities.length > 0 && (
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-1 h-8 bg-indigo-500 rounded-full"></span>
                            Premium Amenities
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {propertyFacilities.map((amenity, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/[0.05] transition-colors group">
                                    <div className="w-8 h-8 mb-3 text-slate-500 group-hover:text-purple-400 transition-colors">
                                        <FiCheckCircle size={24} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-300">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Developer / Project Stats */}
                {isDeveloper && property.project_stats && (
                    <div className="bg-[#0A0A0A] rounded-[32px] p-8 border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-8 text-center">Project Configuration</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                             <div className="text-center">
                                 <p className="text-3xl font-black text-white mb-1">{property.project_stats.towers || '--'}</p>
                                 <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Towers</p>
                             </div>
                             <div className="text-center border-l border-white/10">
                                 <p className="text-3xl font-black text-white mb-1">{property.project_stats.floors || '--'}</p>
                                 <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Floors</p>
                             </div>
                             <div className="text-center border-l border-white/10">
                                 <p className="text-3xl font-black text-white mb-1">{property.project_stats.units || '--'}</p>
                                 <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Units</p>
                             </div>
                             <div className="text-center border-l border-white/10">
                                 <p className="text-3xl font-black text-white mb-1">{property.project_stats.area || '--'}</p>
                                 <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Acres</p>
                             </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Right Column: Sticky Contact/Trust Card */}
            <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                    
                    {/* Trust Card */}
                    <div className="p-8 rounded-[32px] bg-linear-to-br from-slate-900 to-black border border-slate-800 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[80px] -mr-10 -mt-10"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                             {(property.logo || property.developer_logo) ? (
                                 <div className="w-24 h-24 bg-white rounded-2xl p-2 flex items-center justify-center mb-6 shadow-lg">
                                     <img src={property.logo || property.developer_logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                                 </div>
                             ) : (
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-3xl">
                                    🏢
                                </div>
                             )}

                             <h4 className="text-white font-black text-xl mb-1">
                                {property.developer || property.company_name || property.owner_name || "Verified Listing"}
                             </h4>
                             <p className="text-slate-500 text-sm font-medium mb-8">
                                {isDeveloper ? 'Premium Developer' : 'Property Owner'} • {property.contact_phone ? 'Verified Contact' : 'Reach out via Form'}
                             </p>

                             {property.contact_phone && (
                                <a href={`tel:${property.contact_phone}`} className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-900/20 mb-3">
                                    <FiPhone /> +91 {property.contact_phone}
                                </a>
                             )}
                             
                             <button className="w-full py-4 rounded-xl border border-white/10 text-slate-300 font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                                <FiShield /> View Legitimacy Report
                             </button>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-xs text-slate-600 text-center leading-relaxed px-4">
                        Bada Builder verifies all developer listings. However, we recommend conducting your own due diligence before any financial transaction.
                    </p>

                </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default PropertyDetails;
