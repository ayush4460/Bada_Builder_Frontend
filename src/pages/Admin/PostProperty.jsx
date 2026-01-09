import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Upload, 
  MapPin, 
  DollarSign,
  Briefcase,
  Layout,
  Clock,
  Shield
} from 'lucide-react';
import PropertyForm from '../../components/PropertyForm/PropertyForm'; // Reusing existing component
import api from '../../services/api';
// We will need to refactor PropertyForm to be tailwind-native later, or wrap it nicely.

const AdminPostProperty = () => {
  const [flow, setFlow] = useState('selection'); // 'selection' | 'live-grouping' | 'bada-builder'

  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (flow === 'selection') {
    return (
      <div className="min-h-screen bg-gray-50/50 p-8 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            What would you like to post?
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Choose the type of listing you want to create. Each flow is optimized for specific requirements.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full px-4">
          {/* Live Grouping Option */}
          <motion.div
            whileHover={{ scale: 1.02, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFlow('live-grouping')}
            className="group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-indigo-50/50 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/30"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50 group-hover:bg-indigo-100 transition-colors" />
            
            <div className="relative z-10 flex flex-col items-start h-full">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                Live Grouping
              </h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Create a time-sensitive group buying opportunity. Set group sizes, discount tiers, and automated timers to drive collective purchasing.
              </p>
              
              <div className="mt-auto flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform">
                Start Campaign <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </div>
          </motion.div>

          {/* Bada Builder Property Option */}
          <motion.div
            whileHover={{ scale: 1.02, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFlow('bada-builder')}
            className="group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-purple-50/50 cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-purple-500/30"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full -mr-32 -mt-32 opacity-50 group-hover:bg-purple-100 transition-colors" />
            
            <div className="relative z-10 flex flex-col items-start h-full">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                Bada Builder Property
              </h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                List a premium property directly from Bada Builder. Add extensive details, amenities, and media for a high-quality standard listing.
              </p>
              
              <div className="mt-auto flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
                Create Listing <ArrowRight className="w-5 h-5 ml-2" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header for Flow */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => setFlow('selection')}
            className="flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Selection
          </button>
          <div className="text-lg font-bold text-gray-900">
            {flow === 'live-grouping' ? 'New Live Grouping Campaign' : 'New Bada Builder Property'}
          </div>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-10 px-6">
        <AnimatePresence mode="wait">
          {flow === 'live-grouping' && (
            <motion.div
              key="live-grouping"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <LiveGroupingForm />
            </motion.div>
          )}

          {flow === 'bada-builder' && (
             <motion.div
             key="bada-builder"
             variants={variants}
             initial="initial"
             animate="animate"
             exit="exit"
             transition={{ duration: 0.3 }}
           >
             {/* We wrap PropertyForm to inject admin-specific props */}
             <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                <PropertyFormWrapper />
             </div>
           </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Live Grouping Form ---
const LiveGroupingForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    basePrice: '',
    targetGroupSize: '',
    discountTiers: [], // [{ size: 10, discount: 5 }, { size: 20, discount: 10 }]
    startDate: '',
    endDate: '',
    description: '',
    images: [] // Placeholders
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCampaign = async () => {
      setLoading(true);
      try {
          const propertyPayload = {
              title: formData.title,
              location: formData.location,
              price: formData.basePrice,
              description: formData.description,
              type: 'Flat/Apartment', 
              status: 'active'
          };

          const createRes = await api.post('/admin/properties', propertyPayload);
          const propertyId = createRes.data.data.id;

          const groupConfig = {
              totalSlots: formData.targetGroupSize,
              startDate: formData.startDate,
              endDate: formData.endDate,
          };
          
          await api.patch(`/admin/properties/${propertyId}/group-booking`, groupConfig);

          alert('Live Grouping Campaign Created Successfully!');
          setFormData({
            title: '', location: '', basePrice: '', targetGroupSize: '', discountTiers: [], startDate: '', endDate: '', description: '', images: []
          });
      } catch (error) {
          console.error("Error creating campaign:", error);
          alert('Failed to create campaign: ' + (error.response?.data?.message || error.message));
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/30">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="text-indigo-600" /> Campaign Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">Configure your live grouping event.</p>
        </div>
        
        <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Title</label>
                    <input 
                        type="text" 
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Summer Villa Group Buy"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-gray-50/50 hover:bg-white"
                    />
                </div>
                
                <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Target Location</label>
                     <div className="relative">
                        <MapPin className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. Mumbai"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-gray-50/50 hover:bg-white"
                        />
                     </div>
                </div>

                <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Base Price (Per Unit)</label>
                     <div className="relative">
                        <DollarSign className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                        <input 
                            type="number" 
                            name="basePrice"
                            value={formData.basePrice}
                            onChange={handleChange}
                            placeholder="e.g. 5000000"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-gray-50/50 hover:bg-white"
                        />
                     </div>
                </div>

                 <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Target Group Size</label>
                     <div className="relative">
                        <Users className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                        <input 
                            type="number" 
                            name="targetGroupSize"
                            value={formData.targetGroupSize}
                            onChange={handleChange}
                            placeholder="e.g. 20"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-gray-50/50 hover:bg-white"
                        />
                     </div>
                </div>
            </div>

            {/* Timings */}
            <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Clock className="text-indigo-600 w-5 h-5" /> Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                        <input 
                            type="datetime-local" 
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-gray-50/50 hover:bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                        <input 
                            type="datetime-local" 
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-gray-50/50 hover:bg-white"
                        />
                    </div>
                </div>
            </div>

             {/* Discount Tiers */}
             <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Shield className="text-indigo-600 w-5 h-5" /> Discount Tiers
                </h3>
                <div className="bg-indigo-50/50 rounded-xl p-6 border border-indigo-100">
                    <p className="text-sm text-indigo-700 mb-4">Define how the price drops as more people join.</p>
                    <div className="space-y-4">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Group Size</label>
                                <input type="number" placeholder="10" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Discount %</label>
                                <input type="number" placeholder="5" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10" />
                            </div>
                            <button className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors">
                                <Briefcase className="w-4 h-4" /> {/* Icon placeholder for 'Add' */}
                            </button>
                        </div>
                        {/* Example added tier */}
                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 text-sm">
                            <span className="font-medium text-gray-700">20 People</span>
                            <span className="text-green-600 font-bold">10% Off</span>
                            <button className="text-red-400 hover:text-red-500">×</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <button 
                  onClick={handleCreateCampaign}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating...' : 'Create Live Grouping Campaign'}
                </button>
            </div>
        </div>
    </div>
  );
}

// --- Wrapper for Bada Builder Property ---
const PropertyFormWrapper = () => {
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        type: '',
        location: '',
        price: '',
        bhk: '',
        facilities: '',
        description: '',
        // Developer specific fields (hidden for admin mostly, or optional)
        companyName: 'Bada Builder',
        projectName: '',
        totalUnits: '',
        completionDate: '',
        reraNumber: '',
        image: null 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log('Submitting property form...');
        
        try {
            let imageUrl = '';
            // Handle Image Upload if exists
            if (formData.image) {
                const uploadData = new FormData();
                uploadData.append('file', formData.image);
                // NOTE: Your upload endpoint might be /upload or /api/upload. Adjust if needed.
                const header = { headers: { 'Content-Type': 'multipart/form-data' } };
                const uploadRes = await api.post('/upload', uploadData, header); 
                imageUrl = uploadRes.data.url || uploadRes.data.imageUrl; // Check upload controller response
            }

            // Prepare developer_info JSON
            const developer_info = {
                companyName: formData.companyName,
                projectName: formData.projectName,
                totalUnits: formData.totalUnits,
                completionDate: formData.completionDate,
                reraNumber: formData.reraNumber
            };

            // Prepare facilities Array (JSON)
            let facilitiesArray = [];
            if (formData.facilities && typeof formData.facilities === 'string') {
                facilitiesArray = formData.facilities.split(',').map(f => f.trim()).filter(f => f !== '');
            }

            const payload = {
                title: formData.title,
                type: formData.type,
                location: formData.location,
                price: formData.price,
                description: formData.description,
                image_url: imageUrl,
                status: 'active',
                facilities: JSON.stringify(facilitiesArray), // Send as JSON string if backend doesn't stringify, or array if body-parser handles it? 
                // Wait, if content-type is json, axios stringifies the whole body. 
                // If the backend expects a JSON object/array for the column, we pass the JS array/object.
                // Postgres driver usually handles JS object -> JSON if using parameterized queries, BUT
                // sometimes express/pg requires it to be stringified if the column is explicitly JSON. 
                // However, usually passing the object is safe with 'pg'. 
                // Let's pass the object/array directly.
                facilities: facilitiesArray, 
                developer_info: developer_info,
                // We don't need to send the flat fields anymore if the backend doesn't use them
            };
            
            // NOTE: The previous backend controller looked for 'facilities' and 'developer_info' in req.body.
            // It did NOT look for companyName etc.
            
            const response = await api.post('/admin/properties', payload);
            console.log('API Response:', response);
            alert('Property Posted Successfully via Admin Portal!');
            
            // Reset Form - Ensure complete reset
            setFormData({
                title: '', type: '', location: '', price: '', bhk: '', facilities: '', description: '', companyName: 'Bada Builder', projectName: '', totalUnits: '', completionDate: '', reraNumber: '', image: null
            });
            setImagePreview(null);
            
        } catch (error) {
            console.error('Error posting property:', error);
            alert('Failed to post property: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8 pb-6 border-b border-gray-100">
                 <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Building2 className="text-purple-600 w-8 h-8" /> 
                    Property Details
                </h2>
                <p className="text-gray-500 mt-2">All fields are required. This property will be listed as verified by Bada Builder.</p>
            </div>
            
            <PropertyForm 
                formData={formData} 
                handleChange={handleChange}
                handleImageChange={handleImageChange}
                handleSubmit={handleSubmit}
                loading={loading}
                userType="admin" 
                showBhkType={['Flat/Apartment', 'Independent House/Villa'].includes(formData.type)}
                imagePreview={imagePreview}
            />
        </div>
    );
}

export default AdminPostProperty;
