import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Edit, Trash2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const ManageProperties = () => {
    const [properties, setProperties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Group Booking Config State
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [groupConfig, setGroupConfig] = useState({
        totalSlots: 20,
        minBuyers: 5,
        discount: '15%',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            // Fetch all properties (admin should see all)
            // Assuming GET /properties works. 
            const response = await api.get('/properties');
            setProperties(response.data.properties);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch properties', error);
            setIsLoading(false);
        }
    };

    const handleConfigSave = async () => {
        if (!selectedProperty) return;
        try {
            // Call Admin Route to updated config
            await api.patch(`/admin/properties/${selectedProperty.id}/group-booking`, groupConfig);
            setIsConfigOpen(false);
            fetchProperties(); // Refresh
            alert('Group Booking Configured Successfully!');
        } catch (error) {
            console.error('Failed to save config', error);
            alert('Failed to save configuration.');
        }
    };

    const openConfigModal = (property) => {
        setSelectedProperty(property);
        setGroupConfig({
            totalSlots: property.live_group_config?.totalSlots || 20,
            minBuyers: property.live_group_config?.minBuyers || 5,
            discount: property.live_group_config?.discount || '15%',
            startDate: property.live_group_config?.startDate || '',
            endDate: property.live_group_config?.endDate || ''
        });
        setIsConfigOpen(true);
    };

    const filteredProperties = properties.filter(p => 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Manage Properties</h1>
                
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search properties..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 w-full sm:w-64"
                        />
                    </div>
                    <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">
                        <Filter size={20} />
                    </button>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
                        <span className="font-medium">Export</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Group Booking</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">Loading Properties...</td>
                                </tr>
                            ) : filteredProperties.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">No properties found.</td>
                                </tr>
                            ) : (
                                filteredProperties.map((property) => (
                                    <motion.tr 
                                        key={property.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden">
                                                    {property.image_url && (
                                                        <img src={property.image_url} alt="" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{property.title}</p>
                                                    <p className="text-xs text-gray-500">{property.type}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">{property.location}</td>
                                        <td className="py-4 px-6 text-sm font-medium text-gray-900">₹{property.price}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                property.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {property.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {property.is_live_grouping ? (
                                                <span className="flex items-center gap-1 text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full w-fit">
                                                    <Users size={12} /> Active
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">Not Configured</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openConfigModal(property)}
                                                    className="p-1.5 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
                                                    title="Configure Group Booking"
                                                >
                                                    <Users size={18} />
                                                </button>
                                                <button className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                                                    <Edit size={18} />
                                                </button>
                                                <button className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Config Modal */}
            <AnimatePresence>
                {isConfigOpen && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsConfigOpen(false)}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800">Configure Group Booking</h2>
                                <p className="text-sm text-gray-500 mt-1">For {selectedProperty?.title}</p>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Slots</label>
                                        <input 
                                            type="number" 
                                            value={groupConfig.totalSlots}
                                            onChange={(e) => setGroupConfig({...groupConfig, totalSlots: parseInt(e.target.value)})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Buyers</label>
                                        <input 
                                            type="number" 
                                            value={groupConfig.minBuyers}
                                            onChange={(e) => setGroupConfig({...groupConfig, minBuyers: parseInt(e.target.value)})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Offer</label>
                                    <input 
                                        type="text" 
                                        value={groupConfig.discount}
                                        onChange={(e) => setGroupConfig({...groupConfig, discount: e.target.value})}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                        placeholder="e.g. 15% OFF + Free Parking"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input 
                                            type="date" 
                                            value={groupConfig.startDate}
                                            onChange={(e) => setGroupConfig({...groupConfig, startDate: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input 
                                            type="date" 
                                            value={groupConfig.endDate}
                                            onChange={(e) => setGroupConfig({...groupConfig, endDate: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 flex items-center justify-end gap-3">
                                <button 
                                    onClick={() => setIsConfigOpen(false)}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfigSave}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-lg shadow-purple-900/20 transition-all"
                                >
                                    Save Configuration
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageProperties;
